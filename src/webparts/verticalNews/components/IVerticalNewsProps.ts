import { SPHttpClient } from '@microsoft/sp-http';

export interface INewsWebpartProps {
  title: string;
  newsCount: number;
  showImages: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showDescription: boolean;
  columns: number;
  siteUrl: string;
  spHttpClient: SPHttpClient;
  currentSiteUrl: string;
  isReadOnly: boolean;
}
