import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useCatalogLabel } from '@/i18n/catalogI18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RootState } from '../../store';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import styles from './HeroCarousel.module.css';

export interface HeroSlide {
  id: string;
  image: string;
  imageAlt: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'savings',
    image:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Colorful shopping bags and gifts',
    badge: 'Everyday savings',
    title: 'Shop smarter. Save more.',
    subtitle: 'Electronics, groceries, fashion and more — clear pricing, fast checkout.',
    primaryCta: { label: 'Browse products', to: '/products' },
    secondaryCta: { label: 'Shop groceries', to: '/products?superCategoryId=super-grocery' },
  },
  {
    id: 'electronics',
    image:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Laptop and tech gadgets on a desk',
    badge: 'Tech deals',
    title: 'Upgrade your everyday tech.',
    subtitle: 'Phones, laptops, audio and smart home — fresh picks with fast delivery.',
    primaryCta: { label: 'Shop electronics', to: '/products?superCategoryId=super-electronics' },
    secondaryCta: { label: 'Featured picks', to: '/products?featured=true' },
  },
  {
    id: 'grocery',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Fresh produce in a grocery store',
    badge: 'Fresh & value',
    title: 'Groceries delivered to your door.',
    subtitle: 'Daily essentials, snacks and pantry staples at prices you can trust.',
    primaryCta: { label: 'Shop groceries', to: '/products?superCategoryId=super-grocery' },
    secondaryCta: { label: 'View all aisles', to: '/products' },
  },
  {
    id: 'fashion',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Fashion boutique clothing display',
    badge: 'New season',
    title: 'Style that fits your budget.',
    subtitle: 'Trending fashion, footwear and accessories — easy returns within 7 days.',
    primaryCta: { label: 'Shop fashion', to: '/products?superCategoryId=super-fashion' },
    secondaryCta: { label: 'Today’s deals', to: '/products' },
  },
];

const AUTOPLAY_MS = 5500;

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      className={styles.navIcon}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d={direction === 'left' ? 'M10 3.5L5.5 8 10 12.5' : 'M6 3.5L10.5 8 6 12.5'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

export function HeroCarousel({ slides = HERO_SLIDES }: HeroCarouselProps) {
  const { t } = useTranslation();
  const catalogName = useCatalogLabel();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      const total = slides.length;
      setActiveIndex(((index % total) + total) % total);
    },
    [slides.length],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

  const slide = slides[activeIndex];

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label={t('home.featuredPromos')}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.viewport}>
        {slides.map((item, index) => (
          <article
            key={item.id}
            className={`${styles.slide} ${index === activeIndex ? styles.slideActive : ''}`}
            aria-hidden={index !== activeIndex}
          >
            <img
              className={styles.image}
              src={item.image}
              alt={catalogName(item.imageAlt)}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <div className={styles.overlay} />
          </article>
        ))}
      </div>

      <div className={styles.content}>
        <Badge className={`${styles.badge} mb-3 border-0 bg-accent text-accent-foreground`}>
          {catalogName(slide.badge)}
        </Badge>
        <h1 className={styles.title}>{catalogName(slide.title)}</h1>
        <p className={styles.subtitle}>{catalogName(slide.subtitle)}</p>
        <div className={styles.actions}>
          <Button variant="accent" size="lg" asChild>
            <Link to={slide.primaryCta.to} className="no-underline hover:no-underline">
              {catalogName(slide.primaryCta.label)}
            </Link>
          </Button>
          <Button variant="brandOutline" size="lg" asChild className={styles.secondaryBtn}>
            <Link to={slide.secondaryCta.to} className="no-underline hover:no-underline">
              {catalogName(slide.secondaryCta.label)}
            </Link>
          </Button>
          {!isAuthenticated && (
            <Button variant="brandOutline" size="lg" asChild className={styles.secondaryBtn}>
              <Link to="/register" className="no-underline hover:no-underline">
                {t('home.joinFree')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navPrev}`}
            onClick={goPrev}
            aria-label={t('home.prevSlide')}
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navNext}`}
            onClick={goNext}
            aria-label={t('home.nextSlide')}
          >
            <ChevronIcon direction="right" />
          </button>

          <div className={styles.dots} role="tablist" aria-label={t('home.chooseSlide')}>
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={t('home.goToSlide', { n: index + 1, title: catalogName(item.title) })}
                className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
