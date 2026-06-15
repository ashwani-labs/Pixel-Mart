export interface HeroSlideCta {
  label: string;
  to: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  imageAlt: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: HeroSlideCta;
  secondaryCta: HeroSlideCta;
}

export interface HeroSlidesResponse {
  slides: HeroSlide[];
}
