import * as React from 'react';
import { INewsWebpartProps } from './IVerticalNewsProps';
import { INewsItem } from '../models/INewsItem';
import { NewsService } from '../services/NewsService';
import NewsCard from './NewsCard';
import styles from './VerticalNews.module.scss';

// ─── Skeleton ────────────────────────────────────────────────────────────────
interface ISkeletonGridProps {
  count: number;
  columns: number;
}

const SkeletonGrid: React.FC<ISkeletonGridProps> = ({ count, columns }) => {
  const skeletonCount = Math.min(count, 6);
  const skeletonItems: React.ReactElement[] = [];

  for (let i = 0; i < skeletonCount; i++) {
    skeletonItems.push(
      <div key={i} className={`${styles.newsCard} ${styles.skeleton}`}>
        <div className={styles.skeletonImage} />
        <div className={styles.cardBody}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} style={{ width: '70%' }} />
          <div className={styles.skeletonMeta} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.grid}
      style={{ '--columns': columns } as React.CSSProperties}
    >
      {skeletonItems}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const NewsWebpart: React.FC<INewsWebpartProps> = ({
  title,
  newsCount,
  showImages,
  showAuthor,
  showDate,
  showDescription,
  columns,
  siteUrl,
  spHttpClient,
  currentSiteUrl,
}) => {
  const [newsItems, setNewsItems] = React.useState<INewsItem[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadNews = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const targetSiteUrl =
        siteUrl && siteUrl.trim() ? siteUrl.trim() : currentSiteUrl;

      const service = new NewsService(spHttpClient, targetSiteUrl);
      const items = await service.getNewsItems(newsCount);
      setNewsItems(items);

    } catch (err) {
      console.error('NewsWebpart error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load news'
      );
    } finally {
      setIsLoading(false);
    }
  }, [newsCount, siteUrl, spHttpClient, currentSiteUrl]);

    console.log("News Data", newsItems);
  // Reload whenever count or source site changes
  React.useEffect(() => {
    loadNews().catch(() => undefined);
  }, [loadNews]);

  return (
    <section className={styles.newsWebpart}>
      {title && (
        <header className={styles.webpartHeader}>
          <h2 className={styles.webpartTitle}>{title}</h2>
          <div className={styles.titleAccent} />
        </header>
      )}

      {/* Loading */}
      {isLoading && (
        <SkeletonGrid count={newsCount} columns={columns} />
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className={styles.errorState} role="alert">
          <span className={styles.errorIcon}>⚠</span>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryButton} onClick={loadNews}>
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && newsItems.length === 0 && (
        <div className={styles.emptyState}>
          <p>No news posts found on this site.</p>
          <p>
            Create a <strong>News post</strong> (not a regular Site Page) from
            the site home page or Site contents, then refresh this web part.
          </p>
        </div>
      )}

      {/* News grid */}
      {!isLoading && !error && newsItems.length > 0 && (
        <div
          className={styles.grid}
          style={{ '--columns': columns } as React.CSSProperties}
          role="list"
        >

          {newsItems.map((item, index) => ( 
            <div key={item.id} className={styles.gridItem} role="listitem">
              <NewsCard
                item={item}
                showImage={showImages}
                showAuthor={showAuthor}
                showDate={showDate}
                showDescription={showDescription}
                featured={index === 0}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default NewsWebpart;
