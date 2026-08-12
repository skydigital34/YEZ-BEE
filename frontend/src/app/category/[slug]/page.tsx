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
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import {
  YEZBEE_CATEGORIES,
  getCategoryBySlug,
  getCategoryWithSubcategory,
  hasFeedingSplit,
  CategoryConfig,
} from '@/data/categories';
import { CATALOG_PRODUCTS, CatalogProduct, getProductsByCategory, getDeletedProductIds } from '@/data/products';
import { api } from '@/lib/api';
import { getSafeImageUrl } from '@/lib/utils';

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

const FABRICS = ['100% Pure Cotton', 'Soft Premium Rayon', 'Modal Cotton Knit', 'Microfiber Nylon', 'Combed Cotton', 'Silk Georgette Blend', 'Schiffli Cotton'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'bestselling', label: 'Bestselling Patrons Choice' },
  { value: 'rating', label: 'Highest Rated' },
];

// ─── Inner Category Component ────────────────────────────────────────────────

export function CategoryPageContent({ subSlug }: { subSlug?: string }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = (params.slug as string) || 'all';

  // Support subSlug from props (for /category/[slug]/[sub]) or searchParams (type=FEEDING)
  const queryProductType = searchParams.get('type') || searchParams.get('productType');
  const initialTypeFilter = subSlug
    ? subSlug.toUpperCase() === 'FEEDING' ? 'FEEDING' : subSlug.toUpperCase() === 'NON-FEEDING' ? 'NON-FEEDING' : 'all'
    : queryProductType ? queryProductType.toUpperCase() as 'FEEDING' | 'NON-FEEDING' | 'all' : 'all';

  const categoryConfig = getCategoryBySlug(slug);
  const showProductTypeFilter = categoryConfig ? categoryConfig.hasFeedingSplit : (slug === 'all');

  const isKidsCategory = slug === 'kids-wear' || slug === 'kids-clothing';
  const availableSizeList = isKidsCategory ? KIDS_SIZES : WOMEN_SIZES;

  // ── UI State ───────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProductType, setSelectedProductType] = useState<string>(initialTypeFilter);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    productType: true,
    color: true,
    fabric: true,
    size: true,
  });

  // Keep type filter in sync with route subSlug
  useEffect(() => {
    if (subSlug) {
      const upper = subSlug.toUpperCase();
      if (upper === 'FEEDING' || upper === 'NON-FEEDING') {
        setSelectedProductType(upper);
      }
    }
  }, [subSlug]);

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
    setSelectedProductType('all');
    setInStockOnly(false);
    setSelectedSizes([]);
    updateSizeUrl([]);
  }, [updateSizeUrl]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeFilterCount =
    (selectedProductType !== 'all' ? 1 : 0) +
    selectedColors.length +
    selectedSizes.length +
    selectedFabrics.length +
    (inStockOnly ? 1 : 0);

  const [dbProducts, setDbProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live published products from MongoDB backend
  useEffect(() => {
    let isMounted = true;
    const fetchLiveProducts = async () => {
      setLoading(true);
      try {
        const response = await api.getProducts({
          category: slug !== 'all' ? slug : undefined,
          productType: selectedProductType !== 'all' ? selectedProductType : undefined,
          sizes: selectedSizes.length ? selectedSizes.join(',') : undefined,
          colors: selectedColors.length ? selectedColors.join(',') : undefined,
          sortBy,
        });

        if (response && response.data && isMounted) {
          const mapped = response.data.map((p: any) => {
            const minPrice = p.price || (p.variants || []).reduce((min: number, v: any) => Math.min(min, v.price || Infinity), Infinity) || 0;
            const maxCompare = p.compareAtPrice || (p.variants || []).reduce((max: number, v: any) => Math.max(max, v.compareAtPrice || 0), 0);
            const discountPct = p.discount || (maxCompare > minPrice && maxCompare > 0 ? Math.round(((maxCompare - minPrice) / maxCompare) * 100) : 0);
            const totalStock = (p.variants || []).reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

            return {
              id: p._id || p.id,
              name: p.name,
              slug: p.slug,
              description: p.description || '',
              shortDescription: p.shortDescription || '',
              price: minPrice,
              compareAtPrice: maxCompare > minPrice ? maxCompare : undefined,
              discountPercentage: discountPct,
              category: p.category?.slug || p.category || 'casuals',
              categoryName: p.category?.name || p.subcategory || 'CASUALS',
              productType: p.productType || null,
              fabric: p.fabric || 'Cotton',
              fit: p.fit || 'Regular Fit',
              pattern: p.pattern || 'Printed',
              occasion: p.occasion || 'Casual',
              careInstructions: p.careInstructions || [],
              status: (p.status || 'published').toLowerCase() as any,
              stock: totalStock,
              image: getSafeImageUrl(p.images?.[0] || p.thumbnail),
              thumbnail: getSafeImageUrl(p.images?.[0] || p.thumbnail),
              hoverImage: getSafeImageUrl(p.images?.[1] || p.images?.[0] || p.thumbnail),
              galleryImages: p.images?.map((img: any) => getSafeImageUrl(img)) || [],
              colors: p.variants ? Array.from(new Set(p.variants.map((v: any) => v.color))) : ['Standard'],
              sizes: p.variants ? Array.from(new Set(p.variants.map((v: any) => v.size))) : ['S', 'M', 'L'],
              variants: p.variants || [],
              featured: Boolean(p.featured || p.isFeatured),
              bestseller: Boolean(p.bestSeller || p.isBestSeller),
              newArrival: Boolean(p.newArrival || p.isNewProduct),
              tags: p.tags || [],
              seo: p.seo || { title: p.name, description: p.shortDescription },
            } as unknown as CatalogProduct;
          });

          const typeFilter = selectedProductType !== 'all' ? selectedProductType : undefined;
          const deletedIds = getDeletedProductIds();
          const localProds = getProductsByCategory(slug, typeFilter);
          const combined = mapped.filter((p: any) => p.status === 'published' && !deletedIds.includes(p.id) && !deletedIds.includes(p.slug));

          for (const lp of localProds) {
            if (!deletedIds.includes(lp.id) && !deletedIds.includes(lp.slug) && !combined.some((p) => p.id === lp.id || p.slug === lp.slug)) {
              combined.unshift(lp);
            }
          }

          setDbProducts(combined);
        }
      } catch (err) {
        console.warn('Backend API connection warning, using fallback category data:', err);
        const typeFilter = selectedProductType !== 'all' ? selectedProductType : undefined;
        setDbProducts(getProductsByCategory(slug, typeFilter));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLiveProducts();
    if (typeof window !== 'undefined') {
      window.addEventListener('yezbee_products_updated', fetchLiveProducts);
    }
    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('yezbee_products_updated', fetchLiveProducts);
      }
    };
  }, [slug, selectedProductType, selectedSizes, selectedColors, sortBy]);

  // ── Category Products Filtering ─────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return dbProducts.filter((p) => {
      // Color filter
      if (selectedColors.length && !p.colors.some((c) => selectedColors.includes(typeof c === 'string' ? c : c.name))) {
        return false;
      }

      // Size filter
      if (selectedSizes.length) {
        const hasMatchingSize = selectedSizes.some((s) => p.sizes.includes(s));
        if (!hasMatchingSize) return false;
      }

      // Fabric filter
      if (selectedFabrics.length && !selectedFabrics.includes(p.fabric)) return false;

      // In stock only
      if (inStockOnly && p.stock <= 0) return false;

      return true;
    });
  }, [dbProducts, selectedColors, selectedSizes, selectedFabrics, inStockOnly]);

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
          <Filter size={14} className="text-[var(--color-primary-gold)]" /> Filters
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
          <span>Categories</span>
          {expandedSections.category ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedSections.category && (
          <div className="mt-3 space-y-1.5 text-xs font-sans">
            {YEZBEE_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.path}
                className={`block py-2 px-3 rounded-xl transition-all ${
                  slug === cat.slug
                    ? 'bg-[var(--color-dark)] text-white font-bold shadow-sm'
                    : 'text-[var(--color-dark)]/80 hover:bg-[var(--color-champagne)]/40 hover:text-[var(--color-dark)] font-semibold'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FEEDING / NON-FEEDING Product Type Filter (ONLY shown for categories with split) */}
      {showProductTypeFilter && (
        <div className="pb-4 border-b border-[var(--color-champagne)]">
          <button
            onClick={() => setExpandedSections((prev) => ({ ...prev, productType: !prev.productType }))}
            className="flex items-center justify-between w-full text-left font-semibold text-xs uppercase tracking-wider text-[var(--color-dark)]"
          >
            <span>Product Type</span>
            {expandedSections.productType ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {expandedSections.productType && (
            <div className="mt-3 space-y-2 text-xs font-sans">
              <button
                onClick={() => {
                  setSelectedProductType('all');
                  if (subSlug) router.push(`/category/${slug}`);
                }}
                className={`w-full text-left py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedProductType === 'all'
                    ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                }`}
              >
                All {categoryConfig ? categoryConfig.name : 'Products'}
              </button>
              <button
                onClick={() => {
                  setSelectedProductType('FEEDING');
                  router.push(`/category/${slug}/feeding`);
                }}
                className={`w-full text-left py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedProductType === 'FEEDING'
                    ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                }`}
              >
                FEEDING
              </button>
              <button
                onClick={() => {
                  setSelectedProductType('NON-FEEDING');
                  router.push(`/category/${slug}/non-feeding`);
                }}
                className={`w-full text-left py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedProductType === 'NON-FEEDING'
                    ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                }`}
              >
                NON-FEEDING
              </button>
            </div>
          )}
        </div>
      )}

      {/* Size Filter */}
      <div className="pb-4 border-b border-[var(--color-champagne)]">
        <button
          onClick={() => setExpandedSections((prev) => ({ ...prev, size: !prev.size }))}
          className="flex items-center justify-between w-full text-left font-semibold text-xs uppercase tracking-wider text-[var(--color-dark)]"
        >
          <span>Size</span>
          {expandedSections.size ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedSections.size && (
          <div className="mt-3 flex flex-wrap gap-2">
            {availableSizeList.map((sz) => (
              <button
                key={sz}
                onClick={() => toggleSize(sz)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedSizes.includes(sz)
                    ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                }`}
              >
                {sz}
              </button>
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
                className="flex items-center gap-2 text-xs text-[var(--color-dark)]/80 cursor-pointer hover:text-[var(--color-primary-gold)] font-medium"
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

      {/* In Stock Only Toggle */}
      <div>
        <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--color-dark)] cursor-pointer">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary-gold)] focus:ring-[var(--color-primary-gold)] h-4 w-4"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)] font-sans" suppressHydrationWarning>
      {/* ── CATEGORY BANNER ── */}
      <div className="relative bg-black text-white overflow-hidden py-16 sm:py-24 border-b border-[var(--color-primary-gold)]/40">
        <Image
          src={categoryConfig?.banner || '/images/categories/maternity-kurtis.jpg'}
          alt={categoryConfig?.name || 'Category'}
          fill
          priority
          className="object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs text-white/60 mb-4 font-sans uppercase tracking-widest">
              <Link href="/" className="hover:text-[var(--color-primary-gold)] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/category/all" className="hover:text-[var(--color-primary-gold)] transition-colors">Categories</Link>
              <span>/</span>
              <span className="text-[var(--color-primary-gold)] font-bold">
                {categoryConfig?.name || 'Catalog'}
              </span>
              {selectedProductType !== 'all' && (
                <>
                  <span>/</span>
                  <span className="text-white font-bold">{selectedProductType}</span>
                </>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight uppercase">
              {categoryConfig?.name || 'All Products'}
              {selectedProductType !== 'all' && (
                <span className="text-[var(--color-primary-gold)] ml-3 text-2xl sm:text-4xl">· {selectedProductType}</span>
              )}
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-white/80 leading-relaxed font-sans max-w-xl">
              {categoryConfig?.description || 'Explore our exclusive fashion collection handcrafted for elegance and comfort.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Toolbar Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[var(--color-champagne)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-dark)] text-white text-xs font-bold uppercase rounded-xl"
            >
              <Filter size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            <p className="text-xs text-gray-500 font-semibold" suppressHydrationWarning>
              Showing <span className="font-bold text-black" suppressHydrationWarning>{displayedProducts.length}</span> of{' '}
              <span className="font-bold text-black" suppressHydrationWarning>{sortedProducts.length}</span> styles
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase text-gray-500 hidden sm:block">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-xs font-bold border border-gray-300 rounded-xl bg-white outline-none focus:border-[var(--color-primary-gold)] cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="hidden sm:flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-dark)] text-white' : 'text-gray-400 hover:text-black'}`}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[var(--color-dark)] text-white' : 'text-gray-400 hover:text-black'}`}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <FilterSidebar />
          </div>

          {/* Product Listing Section */}
          <div className="lg:col-span-9">
            {!isMounted || loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((skel) => (
                  <div key={skel} className="aspect-[3/4] bg-gray-200/60 animate-pulse rounded-2xl border border-gray-100" />
                ))}
              </div>
            ) : displayedProducts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
                }
              >
                {displayedProducts.map((prod) => (
                  <ProductCard key={prod.id} {...(prod as any)} />
                ))}
              </div>
            ) : (
              /* EMPTY STATE: Requirement 19 */
              <div className="text-center py-20 px-6 bg-white rounded-3xl border border-gray-200 shadow-soft-sm max-w-lg mx-auto">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <ShoppingBag size={28} className="text-[var(--color-primary-gold)]" />
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                  No products available in this category yet.
                </h3>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                  We are updating our catalog with fresh couture drops. Explore other categories or reset your active filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-2.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-full hover:bg-gray-200 transition-all"
                    >
                      Clear Active Filters
                    </button>
                  )}
                  <Link
                    href="/category/casuals"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black transition-all shadow-md"
                  >
                    Continue Shopping <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Load More Button */}
            {displayedProducts.length < sortedProducts.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-8 py-3 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black transition-all shadow-md"
                >
                  Load More Styles ({sortedProducts.length - displayedProducts.length} remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Filter */}
      <AnimatePresence>
        {showMobileFilter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-xs bg-white h-full overflow-y-auto p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
                  <h3 className="font-bold text-sm uppercase tracking-wider">Filters</h3>
                  <button onClick={() => setShowMobileFilter(false)} className="p-1">
                    <X size={20} />
                  </button>
                </div>
                <FilterSidebar />
              </div>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full py-3 bg-[var(--color-dark)] text-white text-xs font-bold uppercase rounded-xl mt-6"
              >
                Apply Filters
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-warm-white)] flex items-center justify-center"><p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary-gold)]">Loading YEZ BEE Catalog...</p></div>}>
      <CategoryPageContent />
    </Suspense>
  );
}
