'use client';

import { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  Filter,
  Sparkles,
  Ruler,
  CheckCircle2,
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { YEZBEE_CATEGORIES, getCategoryBySlug, CategoryConfig } from '@/data/categories';
import { CATALOG_PRODUCTS, CatalogProduct } from '@/data/products';

// ─── Filter Constants ────────────────────────────────────────────────────────

const WOMEN_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
const KIDS_SIZES = ['0-1Y', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-10Y', '10-12Y', '12-14Y'] as const;

const COLORS = [
  { name: 'Peach Floral', hex: '#FFDAB9' },
  { name: 'Blush Pink', hex: '#FFB6C1' },
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Sage Green', hex: '#8FBC8F' },
  { name: 'Maroon Gold', hex: '#800000' },
  { name: 'Teal Blue', hex: '#008080' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Coral Pink', hex: '#FF6F61' },
];

const FABRICS = ['100% Pure Cotton', 'Soft Premium Rayon', 'Modal Cotton Knit', 'Microfiber Nylon', 'Combed Cotton'];
const OCCASIONS = ['Everyday & Office Wear', 'Festive & Celebration', 'Home & Sleepwear', 'Party & Casual', 'Daily Intimate Essential'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'bestselling', label: 'Bestselling Patrons Choice' },
  { value: 'rating', label: 'Highest Rated' },
];

// ─── Inner Category Component ────────────────────────────────────────────────

function CategoryPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = (params.slug as string) || 'all';
  const categoryConfig = getCategoryBySlug(slug);

  const isKidsCategory = slug === 'kids-clothing';
  const availableSizeList = isKidsCategory ? KIDS_SIZES : WOMEN_SIZES;

  // ── UI State ───────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    color: true,
    fabric: true,
    occasion: true,
  });

  // ── URL-Aware Size Filter ───────────────────────────────────────────────
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => {
    const sizeParam = searchParams.get('size');
    if (!sizeParam) return [];
    return sizeParam.split(',');
  });

  useEffect(() => {
    const sizeParam = searchParams.get('size');
    if (!sizeParam) {
      setSelectedSizes([]);
    } else {
      setSelectedSizes(sizeParam.split(','));
    }
  }, [searchParams]);

  const updateSizeUrl = useCallback(
    (sizes: string[]) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (sizes.length === 0) {
        current.delete('size');
      } else {
        current.set('size', sizes.join(','));
      }
      const query = current.toString();
      router.replace(`?${query}`, { scroll: false });
    },
    [router, searchParams]
  );

  const toggleSize = useCallback(
    (size: string) => {
      setSelectedSizes((prev) => {
        const next = prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size];
        updateSizeUrl(next);
        return next;
      });
    },
    [updateSizeUrl]
  );

  const toggleColor = (color: string) =>
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );

  const toggleFabric = (fabric: string) =>
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );

  const clearAllFilters = useCallback(() => {
    setSelectedColors([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setPriceRange([0, 10000]);
    setInStockOnly(false);
    setSelectedSizes([]);
    updateSizeUrl([]);
  }, [updateSizeUrl]);

  const activeFilterCount =
    selectedColors.length +
    selectedSizes.length +
    selectedFabrics.length +
    selectedOccasions.length +
    (inStockOnly ? 1 : 0);

  // ── Category Products Filtering ─────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return CATALOG_PRODUCTS.filter((p) => {
      // 1. Strict Category Match (Unless 'all' is specified)
      if (slug !== 'all' && p.category !== slug) {
        return false;
      }

      // 2. Price filter
      if (p.price > priceRange[1]) return false;

      // 3. Color filter (OR within colors)
      if (selectedColors.length && !p.colors.some((c) => selectedColors.includes(c.name))) {
        return false;
      }

      // 4. Size filter (OR within sizes)
      if (selectedSizes.length) {
        const hasMatchingSize = selectedSizes.some((s) => p.sizes.includes(s));
        if (!hasMatchingSize) return false;
      }

      // 5. Fabric filter
      if (selectedFabrics.length && !selectedFabrics.includes(p.fabric)) return false;

      // 6. Occasion filter
      if (selectedOccasions.length && !selectedOccasions.includes(p.occasion)) return false;

      // 7. In stock only
      if (inStockOnly && p.stock <= 0) return false;

      return true;
    });
  }, [slug, selectedColors, selectedSizes, selectedFabrics, selectedOccasions, priceRange, inStockOnly]);

  // ── Sorting ─────────────────────────────────────────────────────────────
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'bestselling':
          return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
        case 'rating':
          return b.rating - a.rating;
        default:
          return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      }
    });
  }, [filteredProducts, sortBy]);

  const displayedProducts = sortedProducts.slice(0, visibleCount);

  // ── Category Sidebar Component ──────────────────────────────────────────
  const FilterSidebar = () => (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-champagne)]/60 shadow-soft-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-champagne)]">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[var(--color-dark)] flex items-center gap-2">
          <Filter size={14} className="text-[var(--color-primary-gold)]" /> Catalog Filters
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-[var(--color-primary-gold)] hover:underline font-semibold"
          >
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Official 6 Categories Selection */}
      <div className="pb-4 border-b border-[var(--color-champagne)]">
        <button
          onClick={() => setExpandedSections((prev) => ({ ...prev, category: !prev.category }))}
          className="flex items-center justify-between w-full text-left font-semibold text-xs uppercase tracking-wider text-[var(--color-dark)]"
        >
          <span>Official Categories</span>
          {expandedSections.category ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedSections.category && (
          <div className="mt-3 space-y-2 text-xs">
            {YEZBEE_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.path}
                className={`block py-1.5 px-2 rounded-lg transition-colors ${
                  slug === cat.slug
                    ? 'bg-[var(--color-dark)] text-white font-bold'
                    : 'text-[var(--color-dark)]/75 hover:bg-[var(--color-champagne)]/40 hover:text-[var(--color-dark)]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Color Palette Filter */}
      <div className="pb-4 border-b border-[var(--color-champagne)]">
        <button
          onClick={() => setExpandedSections((prev) => ({ ...prev, color: !prev.color }))}
          className="flex items-center justify-between w-full text-left font-semibold text-xs uppercase tracking-wider text-[var(--color-dark)]"
        >
          <span>Color Palette</span>
          {expandedSections.color ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedSections.color && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={`w-8 h-8 rounded-full border border-gray-300 transition-all ${
                  selectedColors.includes(color.name)
                    ? 'ring-2 ring-[var(--color-primary-gold)] ring-offset-2 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={`Filter by color ${color.name}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fabrics Filter */}
      <div className="pb-4 border-b border-[var(--color-champagne)]">
        <button
          onClick={() => setExpandedSections((prev) => ({ ...prev, fabric: !prev.fabric }))}
          className="flex items-center justify-between w-full text-left font-semibold text-xs uppercase tracking-wider text-[var(--color-dark)]"
        >
          <span>Fabrics</span>
          {expandedSections.fabric ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedSections.fabric && (
          <div className="mt-3 space-y-2">
            {FABRICS.map((fabric) => (
              <label
                key={fabric}
                className="flex items-center gap-2 text-xs text-[var(--color-dark)]/80 cursor-pointer hover:text-[var(--color-primary-gold)]"
              >
                <input
                  type="checkbox"
                  checked={selectedFabrics.includes(fabric)}
                  onChange={() => toggleFabric(fabric)}
                  className="rounded border-gray-300 text-[var(--color-primary-gold)] focus:ring-[var(--color-primary-gold)]"
                />
                <span>{fabric}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={clearAllFilters}
        className="w-full py-3 border border-[var(--color-primary-gold)] text-[var(--color-primary-gold)] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] transition-colors"
      >
        Reset All Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)]">
      {/* Contextual Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-[var(--color-dark)]/50 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--color-primary-gold)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/category/all" className="hover:text-[var(--color-primary-gold)] transition-colors">Categories</Link>
          <span>/</span>
          <span className="text-[var(--color-dark)] font-bold">{categoryConfig?.name || 'All Collections'}</span>
        </nav>
      </div>

      {/* Category Hero Banner */}
      <div className="relative h-[220px] sm:h-[300px] bg-[var(--color-darker)] overflow-hidden">
        <Image
          src={categoryConfig?.image || '/images/categories/maternity-kurtis.jpg'}
          alt={categoryConfig?.name || 'Category'}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent z-10" />

        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col justify-center text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[var(--color-gold-light)]" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-gold-light)]">
              YEZ BEE OFFICIAL COLLECTION
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
            {categoryConfig?.name || 'All Collections'}
          </h1>
          <p className="text-white/80 max-w-xl text-xs sm:text-sm font-sans leading-relaxed">
            {categoryConfig?.description || 'Discover our luxury collection of comfort-first maternity wear, nursing loungewear, kids clothing, and everyday fashion.'}
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0" aria-label="Product filters">
            <div className="sticky top-28">
              <FilterSidebar />
            </div>
          </aside>

          {/* Right Product Column */}
          <div className="flex-1 min-w-0">

            {/* 1. Size Filter Row (Centered 50px Circular Buttons at Top of Products Area) */}
            <div className="mb-6 flex flex-col items-center justify-center">
              <div
                className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
                role="group"
                aria-label="Filter products by size"
              >
                {availableSizeList.map((size) => {
                  const isActive = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      id={`size-filter-${size}`}
                      onClick={() => toggleSize(size)}
                      aria-pressed={isActive}
                      aria-label={`Filter by size ${size}`}
                      className={[
                        'relative flex items-center justify-center',
                        isKidsCategory ? 'px-3.5 h-[42px] rounded-xl' : 'w-[50px] h-[50px] rounded-full',
                        'text-xs font-bold font-sans border transition-all duration-200 cursor-pointer select-none',
                        isActive
                          ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] ring-2 ring-[var(--color-primary-gold)] scale-105 shadow-gold-sm'
                          : 'bg-white text-[var(--color-dark)] border-black/20 hover:border-[var(--color-primary-gold)] hover:scale-[1.06]',
                      ].join(' ')}
                    >
                      {size}
                      {isActive && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-primary-gold)] ring-2 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedSizes.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">Selected Size: {selectedSizes.join(', ')}</span>
                  <button
                    onClick={() => { setSelectedSizes([]); updateSizeUrl([]); }}
                    className="text-[var(--color-primary-gold)] font-bold hover:underline"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {/* 2. Controls & Count Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <p className="text-base font-semibold text-[var(--color-dark)]">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'style' : 'styles'} available
              </p>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-primary-gold)] text-[var(--color-dark)]' : 'text-gray-400 hover:text-[var(--color-dark)]'}`}
                    aria-label="Grid View"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[var(--color-primary-gold)] text-[var(--color-dark)]' : 'text-gray-400 hover:text-[var(--color-dark)]'}`}
                    aria-label="List View"
                  >
                    <List size={16} />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-semibold border border-gray-300 rounded-lg px-4 py-2 bg-white outline-none focus:border-[var(--color-primary-gold)] text-[var(--color-dark)] cursor-pointer"
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[var(--color-primary-gold)] rounded-lg text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] hover:bg-[var(--color-primary-gold)] transition-colors"
                  aria-label="Open filters"
                >
                  <Filter size={14} /> Filters
                </button>
              </div>
            </div>

            {/* 3. Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[var(--color-champagne)]">
                <Ruler size={32} className="text-gray-300 mb-3" />
                <h3 className="font-display text-xl font-bold text-[var(--color-dark)] mb-2">
                  No products matched your active filters
                </h3>
                <p className="text-gray-500 text-xs mb-6 text-center max-w-xs">
                  Try clearing your size or color filters to discover available styles.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-8 py-3 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-gold-light)] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                  <AnimatePresence mode="popLayout">
                    {displayedProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          category={product.categoryName}
                          price={product.price}
                          comparePrice={product.compareAtPrice}
                          rating={String(product.rating)}
                          reviews={product.reviewCount}
                          image={product.thumbnail}
                          hoverImage={product.images[1] || product.thumbnail}
                          colors={product.colors}
                          sizes={product.sizes}
                          discount={product.discountPercentage}
                          stock={product.stock}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {visibleCount < filteredProducts.length && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="px-10 py-3.5 border-2 border-[var(--color-dark)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[var(--color-dark)] hover:text-white transition-all"
                    >
                      Load More Styles ({filteredProducts.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Category SEO Content Footnote */}
            {categoryConfig && (
              <div className="mt-16 bg-white p-8 rounded-3xl border border-[var(--color-champagne)]/60 text-xs leading-relaxed text-gray-600 space-y-3">
                <h3 className="font-display font-bold text-base text-[var(--color-dark)]">
                  About YEZ BEE {categoryConfig.name}
                </h3>
                <p>{categoryConfig.description}</p>
                <p>
                  Every garment in our {categoryConfig.name.toLowerCase()} catalog is engineered with premium fabrics, reinforced stitching, and tailored silhouettes for everyday comfort and lasting elegance.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilter(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="fixed top-0 right-0 h-full w-[320px] max-w-[85vw] bg-[var(--color-warm-white)] z-50 overflow-y-auto lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
            >
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-[var(--color-champagne)]">
                <span className="font-display font-bold text-sm uppercase tracking-wider">
                  Category Filters
                </span>
                <button onClick={() => setShowMobileFilter(false)} className="p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-warm-white)] flex items-center justify-center">Loading Category...</div>}>
      <CategoryPageContent />
    </Suspense>
  );
}
