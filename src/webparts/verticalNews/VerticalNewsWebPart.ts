import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneSlider,
  PropertyPaneDropdown,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import NewsWebpart from './components/VerticalNews';
import { INewsWebpartProps } from './components/IVerticalNewsProps';

// NOTE: BaseClientSideWebPart must remain a class — it is an SPFx framework
// requirement. All React UI (NewsWebpart, NewsCard) are function components.
export interface INewsWebpartWebPartProps {
  title: string;
  newsCount: number;
  showImages: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showDescription: boolean;
  columns: number;
  siteUrl: string;
}

export default class NewsWebpartWebPart extends BaseClientSideWebPart<INewsWebpartWebPartProps> {

  public render(): void {
    const props = this._getResolvedProperties();

    const element: React.ReactElement<INewsWebpartProps> = React.createElement(
      NewsWebpart,
      {
        title: props.title,
        newsCount: props.newsCount,
        showImages: props.showImages,
        showAuthor: props.showAuthor,
        showDate: props.showDate,
        showDescription: props.showDescription,
        columns: props.columns,
        siteUrl: props.siteUrl,
        spHttpClient: this.context.spHttpClient,
        currentSiteUrl: this.context.pageContext.web.absoluteUrl,
        isReadOnly: this.displayMode === 1,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    this._applyDefaultProperties();
    return super.onInit();
  }

  private _applyDefaultProperties(): void {
    if (!this.properties.title) {
      this.properties.title = 'Latest News';
    }
    if (!this.properties.newsCount) {
      this.properties.newsCount = 6;
    }
    if (this.properties.showImages === undefined) {
      this.properties.showImages = true;
    }
    if (this.properties.showAuthor === undefined) {
      this.properties.showAuthor = true;
    }
    if (this.properties.showDate === undefined) {
      this.properties.showDate = true;
    }
    if (this.properties.showDescription === undefined) {
      this.properties.showDescription = true;
    }
    if (!this.properties.columns) {
      this.properties.columns = 3;
    }
    if (this.properties.siteUrl === undefined) {
      this.properties.siteUrl = '';
    }
  }

  private _getResolvedProperties(): INewsWebpartWebPartProps {
    this._applyDefaultProperties();
    return this.properties;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;
    const primary = currentTheme.palette?.themePrimary;
    if (primary) {
      this.domElement.style.setProperty('--spfx-primary', primary);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Configure the News Web Part' },
          groups: [
            {
              groupName: 'Content',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Web Part Title',
                  placeholder: 'e.g. Latest News',
                }),
                PropertyPaneTextField('siteUrl', {
                  label: 'News Source Site URL',
                  description:
                    'Leave blank to use the current site. Enter a full URL to pull news from another site.',
                  placeholder: 'https://yourtenant.sharepoint.com/sites/news',
                }),
                PropertyPaneSlider('newsCount', {
                  label: 'Number of News Posts',
                  min: 1,
                  max: 20,
                  step: 1,
                  showValue: true,
                  value: 6,
                }),
              ],
            },
            {
              groupName: 'Layout',
              groupFields: [
                PropertyPaneDropdown('columns', {
                  label: 'Columns',
                  options: [
                    { key: 1, text: '1 Column' },
                    { key: 2, text: '2 Columns' },
                    { key: 3, text: '3 Columns (default)' },
                    { key: 4, text: '4 Columns' },
                  ],
                }),
              ],
            },
            {
              groupName: 'Display Options',
              groupFields: [
                PropertyPaneToggle('showImages', {
                  label: 'Show Banner Images',
                  onText: 'Yes',
                  offText: 'No',
                }),
                PropertyPaneToggle('showDescription', {
                  label: 'Show Description',
                  onText: 'Yes',
                  offText: 'No',
                }),
                PropertyPaneToggle('showAuthor', {
                  label: 'Show Author',
                  onText: 'Yes',
                  offText: 'No',
                }),
                PropertyPaneToggle('showDate', {
                  label: 'Show Published Date',
                  onText: 'Yes',
                  offText: 'No',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
