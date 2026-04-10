import React from 'react';
import styles from '../app/feed.module.css';

interface LinkPreviewProps {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
}

/**
 * A beautiful, premium-styled link preview card.
 */
const LinkPreview: React.FC<LinkPreviewProps> = ({ url, title, description, image }) => {
  if (!url) return null;

  let hostname = '';
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    hostname = url;
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={styles.linkPreviewCard}
      onClick={(e) => e.stopPropagation()}
    >
      {image && (
        <div className={styles.linkPreviewImageContainer}>
          <img 
            src={image} 
            alt={title || 'Link preview'} 
            className={styles.linkPreviewImage}
            onError={(e) => {
              // Hide image if it fails to load
              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className={styles.linkPreviewContent}>
        <div className={styles.linkPreviewHostname}>{hostname}</div>
        <h3 className={styles.linkPreviewTitle}>{title || hostname}</h3>
        {description && (
          <p className={styles.linkPreviewDescription}>
            {description.length > 150 ? `${description.substring(0, 150)}...` : description}
          </p>
        )}
      </div>
    </a>
  );
};

export default LinkPreview;
