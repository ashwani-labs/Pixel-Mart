import { useState } from 'react';
import type { ProductImage } from '../../types/catalog';
import styles from './ProductImageGallery.module.css';

interface Props {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={styles.placeholder} aria-hidden>
        ◆
      </div>
    );
  }

  const active = images[activeIndex] ?? images[0];

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <img
          src={active.url}
          alt={active.altText ?? productName}
          className={styles.mainImg}
        />
      </div>
      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              className={index === activeIndex ? styles.thumbActive : styles.thumb}
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img src={img.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
