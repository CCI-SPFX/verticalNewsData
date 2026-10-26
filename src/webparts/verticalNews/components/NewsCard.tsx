import * as React from 'react';
import { INewsItem } from '../models/INewsItem';
import styles from './VerticalNews.module.scss';

export interface INewsCardProps {
  item: INewsItem;
  showImage: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showDescription: boolean;
  featured?: boolean;
}

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTRlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOWFhM2IwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gaW1hZ2U8L3RleHQ+PC9zdmc+';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const NewsCard: React.FC<INewsCardProps> = ({
  item,
  showImage,
  showAuthor,
  showDate,
  showDescription,
  featured = false,
}) => {
  const [imgError, setImgError] = React.useState<boolean>(false);

  const imgSrc =
    showImage && item.bannerImageUrl.Url && !imgError
      ? item.bannerImageUrl.Url
      : PLACEHOLDER_IMAGE;

  return (
    <article
      className={`${styles.newsCard} ${featured ? styles.featured : ''}`}
      role="article"
    >
      {showImage && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.imageLink}
          aria-label={`Read: ${item.title}`}
          tabIndex={-1}
        >
          <div className={styles.imageWrapper}>
            <img
              src={imgSrc}
              alt={item.title}
              className={styles.bannerImage}
              onError={() => setImgError(true)}
              loading="lazy"
            />
            <div className={styles.imageOverlay} />
          </div>
        </a>
      )}

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.titleLink}
          >
            {item.title}
          </a>
        </h3>

        {showDescription && item.description && (
          <p className={styles.cardDescription}>{item.description}</p>
        )}

        <div className={styles.cardMeta}>
          {showAuthor && (
            <div className={styles.authorInfo}>
              {item.authorPhotoUrl && (
                <img
                  src={item.authorPhotoUrl}
                  alt={item.authorName}
                  className={styles.authorPhoto}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <span className={styles.authorName}>{item.authorName}</span>
            </div>
          )}
          {showDate && (
            <time
              className={styles.publishedDate}
              dateTime={item.firstPublishedDate.toISOString()}
            >
              {formatDate(item.firstPublishedDate)}
            </time>
          )}
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
