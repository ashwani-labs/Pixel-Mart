import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useLazyGetSearchSuggestQuery } from '@/store/api/catalogApi';
import type { SearchSuggestItem } from '@/types/catalog';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
}

export function SearchAutocomplete({ value, onChange, onSubmit, className }: SearchAutocompleteProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [triggerSuggest, { data, isFetching }] = useLazyGetSearchSuggestQuery();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void triggerSuggest(trimmed);
      setOpen(true);
    }, 280);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, triggerSuggest]);

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];
  const hasResults = products.length > 0 || categories.length > 0;
  const showDropdown = open && value.trim().length >= 2 && (hasResults || isFetching);

  const pickItem = (item: SearchSuggestItem) => {
    setOpen(false);
    if (item.type === 'product') {
      navigate(`/products/${item.slug}`);
      return;
    }
    navigate(`/products?search=${encodeURIComponent(item.label)}`);
  };

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.trim().length >= 2 && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setOpen(false);
            onSubmit();
          }
          if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        placeholder="Search products…"
        className={className}
        aria-label="Search products"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        role="combobox"
      />
      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-80 overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg"
          role="listbox"
        >
          {isFetching && !hasResults && (
            <p className="m-0 px-3 py-2 text-sm text-muted-foreground">Searching…</p>
          )}
          {categories.length > 0 && (
            <div className="px-2 py-1">
              <p className="m-0 px-1 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Categories
              </p>
              {categories.map((item) => (
                <button
                  key={`cat-${item.id}`}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickItem(item)}
                >
                  <span aria-hidden>📂</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          )}
          {products.length > 0 && (
            <div className="px-2 py-1">
              <p className="m-0 px-1 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Products
              </p>
              {products.map((item) => (
                <button
                  key={`prod-${item.id}`}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickItem(item)}
                >
                  <span aria-hidden>🛍️</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          )}
          {!isFetching && !hasResults && (
            <p className="m-0 px-3 py-2 text-sm text-muted-foreground">No suggestions — press Enter to search</p>
          )}
        </div>
      )}
    </div>
  );
}
