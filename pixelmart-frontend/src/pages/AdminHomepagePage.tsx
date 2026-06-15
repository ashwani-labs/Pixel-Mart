import { useEffect, useState } from 'react';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useGetAdminHeroSlidesQuery,
  useUpdateHeroSlidesMutation,
} from '../store/api/settingsApi';
import type { HeroSlide } from '../types/homepage';
import styles from './AdminSettingsPage.module.css';

const emptySlide = (): HeroSlide => ({
  id: `slide-${Date.now()}`,
  image: '',
  imageAlt: '',
  badge: '',
  title: '',
  subtitle: '',
  primaryCta: { label: 'Shop now', to: '/products' },
  secondaryCta: { label: 'Learn more', to: '/products' },
});

export function AdminHomepagePage() {
  const { data, isLoading } = useGetAdminHeroSlidesQuery();
  const [updateSlides, { isLoading: saving }] = useUpdateHeroSlidesMutation();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data?.slides) {
      setSlides(data.slides);
    }
  }, [data]);

  const updateSlide = (index: number, patch: Partial<HeroSlide>) => {
    setSlides((current) => current.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)));
  };

  const updateCta = (
    index: number,
    key: 'primaryCta' | 'secondaryCta',
    field: 'label' | 'to',
    value: string,
  ) => {
    setSlides((current) =>
      current.map((slide, i) =>
        i === index ? { ...slide, [key]: { ...slide[key], [field]: value } } : slide,
      ),
    );
  };

  const onSave = async () => {
    setMessage(null);
    try {
      await updateSlides({ slides }).unwrap();
      setMessage('Homepage carousel saved.');
    } catch {
      setMessage('Could not save carousel.');
    }
  };

  if (isLoading) {
    return <p className={styles.loading}>Loading homepage content…</p>;
  }

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Homepage carousel"
        subtitle="Manage hero banner slides shown on the storefront home page."
      />

      <div className="flex flex-col gap-4">
        {slides.map((slide, index) => (
          <div key={slide.id} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="m-0 text-base font-bold">Slide {index + 1}</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={slides.length <= 1}
                onClick={() => setSlides((current) => current.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Slide ID
                <Input value={slide.id} onChange={(e) => updateSlide(index, { id: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Badge
                <Input value={slide.badge} onChange={(e) => updateSlide(index, { badge: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                Image URL
                <Input value={slide.image} onChange={(e) => updateSlide(index, { image: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                Image alt text
                <Input value={slide.imageAlt} onChange={(e) => updateSlide(index, { imageAlt: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                Title
                <Input value={slide.title} onChange={(e) => updateSlide(index, { title: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                Subtitle
                <Input value={slide.subtitle} onChange={(e) => updateSlide(index, { subtitle: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Primary CTA label
                <Input
                  value={slide.primaryCta.label}
                  onChange={(e) => updateCta(index, 'primaryCta', 'label', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Primary CTA link
                <Input
                  value={slide.primaryCta.to}
                  onChange={(e) => updateCta(index, 'primaryCta', 'to', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Secondary CTA label
                <Input
                  value={slide.secondaryCta.label}
                  onChange={(e) => updateCta(index, 'secondaryCta', 'label', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Secondary CTA link
                <Input
                  value={slide.secondaryCta.to}
                  onChange={(e) => updateCta(index, 'secondaryCta', 'to', e.target.value)}
                />
              </label>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setSlides((current) => [...current, emptySlide()])}>
            Add slide
          </Button>
          <Button type="button" variant="default" disabled={saving} onClick={() => void onSave()}>
            {saving ? 'Saving…' : 'Save carousel'}
          </Button>
        </div>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}
