import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { INewsItem } from '../models/INewsItem';

interface ISitePageListItem {
  Id: number;
  Title?: string;
  Description?: string;
  BannerImageUrl?: {
    Url: string;
    Description?: string;
  };
  FileRef?: string;
  Modified?: string;
  FirstPublishedDate?: string;
  PromotedState?: number;
  Author?: {
    Title?: string;
    EMail?: string;
  };
}

export class NewsService {
  private _spHttpClient: SPHttpClient;
  private _siteUrl: string;

  constructor(spHttpClient: SPHttpClient, siteUrl: string) {
    this._spHttpClient = spHttpClient;
    this._siteUrl = siteUrl.replace(/\/+$/, '');
  }

  public async getNewsItems(count: number = 6): Promise<INewsItem[]> {
    const top = Math.max(1, count || 6);
    const queries = [
      this._buildQuery(top, true, true),
      this._buildQuery(top, true, false),
      this._buildQuery(top, false, false),
    ];

    let lastError: Error | undefined;

    for (const apiUrl of queries) {
      try {
        const items = await this._fetchItems(apiUrl);
        if (items.length > 0) {
          return items.map((item) => this._mapItem(item));
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Failed to fetch news');
        console.warn('NewsService query failed:', apiUrl, lastError.message);
      }
    }

    if (lastError) {
      throw lastError;
    }

    return [];
  }

  private _buildQuery(top: number, newsOnly: boolean, includeDescription: boolean): string {
    const fields = [
      'Id',
      'Title',
      'BannerImageUrl',
      'FileRef',
      'Modified',
      'FirstPublishedDate',
      'PromotedState',
      'Author/Title',
      'Author/EMail',
    ];

    if (includeDescription) {
      fields.splice(2, 0, 'Description');
    }

    let url =
      `${this._siteUrl}/_api/web/lists/GetByTitle('Site Pages')/items` +
      `?$select=${fields.join(',')}` +
      `&$expand=Author` +
      `&$orderby=Modified desc` +
      `&$top=${top}`;

    if (newsOnly) {
      url += `&$filter=PromotedState eq 2`;
    }

    return url;
  }

  private async _fetchItems(apiUrl: string): Promise<ISitePageListItem[]> {
    const response: SPHttpClientResponse = await this._spHttpClient.get(
      apiUrl,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch news (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as { value?: ISitePageListItem[] };
    return data.value || [];
  }

  private _mapItem(item: ISitePageListItem): INewsItem {
    const modified = item.Modified ? new Date(item.Modified) : new Date();
    const published = item.FirstPublishedDate
      ? new Date(item.FirstPublishedDate)
      : modified;

    return {
      id: item.Id,
      title: item.Title || 'Untitled',
      description: item.Description || '',
      bannerImageUrl: item.BannerImageUrl || { Url: '' },
      url: this._buildPageUrl(item.FileRef),
      authorName: item.Author?.Title || 'Unknown',
      authorPhotoUrl: item.Author?.EMail
        ? `${this._siteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${encodeURIComponent(item.Author.EMail)}`
        : '',
      publishedDate: modified,
      firstPublishedDate: published,
      categories: [],
    };
  }

  private _buildPageUrl(fileRef: string | undefined): string {
    if (!fileRef) {
      return this._siteUrl;
    }

    if (fileRef.indexOf('http') === 0) {
      return fileRef;
    }

    const webUrl = new URL(this._siteUrl);
    return `${webUrl.origin}${fileRef}`;
  }

  // private _parseBannerImageUrl(raw: string | null | undefined): string {
  //   if (!raw) return '';
  //   try {
  //     const parsed = JSON.parse(raw) as { Url?: string };
  //     return parsed.Url || '';
  //   } catch {
  //     return raw;
  //   }
  // }
}
