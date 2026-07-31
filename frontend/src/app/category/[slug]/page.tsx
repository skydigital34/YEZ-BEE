'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

const COLORS = [
  { name: 'Black', hex: '#0D0D0D' },
  { name: 'White', hex: '#FAF7F2' },
  { name: 'Gold', hex: '#C9A84C' },
  { name: 'Champagne', hex: '#F5E6C8' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Red', hex: '#E74C3C' },
  { name: 'Blush', hex: '#FDE8E8' },
  { name: 'Emerald', hex: '#2D6A4F' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const FABRICS = ['Pure Silk', 'Banarasi Silk', 'Chiffon', 'Velvet', 'Italian Wool', 'Linen', 'Organza', 'Satin'];
const OCCASIONS = ['Royal Wedding', 'Festival Edit', 'Cocktail & Party', 'Formal Office', 'Resort Vacation', 'Evening Gala'];

const MOCK_PRODUCTS = Array.from({ length: 24 }, (_, i) => {
  const images = [
    '/images/ethnic_luxe.jpg',
    '/images/western_chic.jpg',
    '/images/luxury_featured_collection.jpg',
    '/images/haute_accessories.jpg',
    '/images/flash_sale.jpg',
    '/images/ethnic_luxe.jpg',
    '/images/western_chic.jpg',
    '/images/luxury_featured_collection.jpg',
  ];

  return {
    id: `cat-prod-${i + 1}`,
    name: `Couture ${['Zardozi Lehenga', 'Silk Evening Gown', 'Structured Blazer Set', 'Banarasi Silk Saree', 'Chiffon Maxi Dress', 'Embellished Corset Top', 'Satin Co-ord Set', 'Quilted Leather Clutch'][i % 8]}`,
    category: ['Haute Couture', 'Ethnic Luxe', 'Western Chic', 'Jewellery & Bags'][i % 4],
    price: 3999 + i * 800,
    comparePrice: i % 2 === 0 ? 5999 + i * 900 : null,
    rating: (4.5 + (i % 5) * 0.1).toFixed(1),
    reviews: Math.floor(Math.random() * 150) + 20,
    image: images[i % images.length],
    hoverImage: images[(i + 1) % images.length],
    colors: COLORS.slice(0, (i % 4) + 2),
    sizes: SIZES.slice(0, (i % 4) + 2),
    fabric: FABRICS[i % FABRICS.length],
    occasion: OCCASIONS[i % OCCASIONS.length],
    isNew: i < 6,
    isBestSeller: i >= 6 && i < 12,
    discount: i % 2 === 0 ? 25 : 0,
    stock: (i % 5) + 1,
  };
});

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Couture Drops' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'bestselling', label: 'Bestselling Patrons Choice' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = (params.slug as string) || 'all';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    color: true,
    size: true,
    fabric: true,
    occasion: true,
  });

  const toggleSection = (key: string) => setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const activeFilterCount =
    selectedColors.length + selectedSizes.length + selectedFabrics.length + selectedOccasions.length +
    (priceRange[0] > 0 || priceRange[1] < 30000 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setPriceRange([0, 30000]);
  };

  const loadMore = useCallback(() => setVisibleCount((prev) => prev + 12), []);

  const toggleColor = (color: string) =>
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));

  const toggleFabric = (fabric: string) =>
    setSelectedFabrics((prev) => (prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]));

  const toggleOccasion = (occasion: string) =>
    setSelectedOccasions((prev) => (prev.includes(occasion) ? prev.filter((o) => o !== occasion) : [...prev, occasion]));

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    if (priceRange[0] > 0 && p.price < priceRange[0]) return false;
    if (priceRange[1] < 30000 && p.price > priceRange[1]) return false;
    if (selectedColors.length && !p.colors.some((c) => selectedColors.includes(c.name))) return false;
    if (selectedSizes.length && !p.sizes.some((s) => selectedSizes.includes(s))) return false;
    if (selectedFabrics.length && !selectedFabrics.includes(p.fabric)) return false;
    if (selectedOccasions.length && !selectedOccasions.includes(p.occasion)) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'bestselling': return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      case 'rating': return parseFloat(b.rating) - parseFloat(a.rating);
      default: return b.id.localeCompare(a.id);
    }
  });

  const displayedProducts = sortedProducts.slice(0, visibleCount);

  const categoryName = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const FilterSidebar = () => (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-champagne)]/60 shadow-soft-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-champagne)]">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[var(--color-dark)] flex items-center gap-2">
          <Filter size={14} className="text-[var(--color-primary-gold)]" /> Filters
        </h3>
        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters} className="text-xs text-[var(--color-primary-gold)] hover:underline font-semibold">
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Category Links */}
      <div className="pb-4 border-b border-[var(--color-champagne)]">
        <button onClick={() => toggleSection('category')} className="flex items-center justify-between w-full text-left font-semibold text-xs uppercase tracking-wider text-[var(--color-dark)]">
          <span>Categories</span>
          {expandedSections.category ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedSections.category && (
          <div className="mt-3 space-y-2 text-xs">
            {['Ethnic Luxe', 'Haute Couture', 'Western Chic', 'Jewellery & Bags', 'Festival Edit', 'Workwear'].map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className={`block py-1 transition-colors ${
                  slug === cat.toLowerCase().replace(/\s+/g, '-') ? 'text-[var(--color-primary-gold)] font-bold' : 'text-[var(--color-dark)]/70 hover:text-[var(--color-primary-gold)]'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Colors Filter */}
      <div className="pb-4 border-b border-[var(--color-champagne)]">
        <button onClick={() => toggleSection('color')} className="flex items-center justify-between w-full text-left font-semibold text-xs uppercase tracking-wider text-[var(--color-dark)]">
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
                  selectedColors.includes(color.name) ? 'ring-2 ring-[var(--color-primary-gold)] ring-offset-2 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sizes Filter */}
      <div className="pb-4 border-b border-[var(--color-champagne)]">
        <button onClick={() => toggleSection('size')} className="flex items-center justify-between w-full text-left font-semibold text-xs uppercase tracking-wider text-[var(--color-dark)]">
          <span>Couture Sizes</span>
          {expandedSections.size ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedSections.size && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  selectedSizes.includes(size)
                    ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)]'
                    : 'border-gray-200 text-[var(--color-dark)]/70 hover:border-[var(--color-primary-gold)]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fabrics Filter */}
      <div className="pb-4 border-b border-[var(--color-champagne)]">
        <button onClick={() => toggleSection('fabric')} className="flex items-center justify-between w-full text-left font-semibold text-xs uppercase tracking-wider text-[var(--color-dark)]">
          <span>Fabrics</span>
          {expandedSections.fabric ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedSections.fabric && (
          <div className="mt-3 space-y-2">
            {FABRICS.map((fabric) => (
              <label key={fabric} className="flex items-center gap-2 text-xs text-[var(--color-dark)]/80 cursor-pointer hover:text-[var(--color-primary-gold)]">
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
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)]">
      {/* Category Hero Banner */}
      <div className="relative h-[260px] md:h-[360px] bg-[var(--color-darker)] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
        
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col justify-center text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[var(--color-gold-light)]" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-gold-light)]">
              HAUTE COUTURE CATALOGUE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-2">
            {categoryName}
          </h1>
          <p className="text-white/80 max-w-lg text-sm sm:text-base font-sans">
            Discover our curated collection of luxury {categoryName.toLowerCase()} handcrafted by master artisans.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-[var(--color-champagne)]/60 shadow-soft-sm">
          <p className="text-xs text-[var(--color-dark)]/60 font-medium">
            Showing <span className="text-[var(--color-dark)] font-bold">{displayedProducts.length}</span> of{' '}
            <span className="text-[var(--color-dark)] font-bold">{filteredProducts.length}</span> luxury creations
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
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
              className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-transparent outline-none focus:border-[var(--color-primary-gold)] text-[var(--color-dark)]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[var(--color-primary-gold)] rounded-lg text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] hover:bg-[var(--color-primary-gold)] transition-colors"
            >
              <Filter size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-28">
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid / Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[var(--color-champagne)]">
              <Search size={48} className="text-gray-300 mb-4" />
              <h3 className="font-display text-2xl font-bold text-[var(--color-dark)] mb-2">No Products Matched</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your color, price, or category filter parameters.</p>
              <button onClick={clearAllFilters} className="px-8 py-3 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-gold-light)] transition-colors shadow-gold-sm">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="flex-1">
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                {displayedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={loadMore}
                    className="px-10 py-3.5 border-2 border-[var(--color-dark)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[var(--color-dark)] hover:text-white transition-all shadow-sm"
                  >
                    Load More Couture ({filteredProducts.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
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
              className="fixed top-0 right-0 h-full w-[320px] max-w-[85vw] bg-[var(--color-warm-white)] z-50 overflow-y-auto lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-[var(--color-champagne)]">
                <span className="font-display font-bold text-sm uppercase tracking-wider">Couture Filters</span>
                <button onClick={() => setShowMobileFilter(false)} className="p-1 text-gray-500 hover:text-black">
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
