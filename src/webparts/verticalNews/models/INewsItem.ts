export interface INewsItem {
  id: number;
  title: string;
  description: string;
  bannerImageUrl: {
    Url:string;
    Description?:string;
  } | any;
  
  url: string;
  authorName: string;
  authorPhotoUrl: string;
  publishedDate: Date;
  firstPublishedDate: Date;
  categories: string[];
}
