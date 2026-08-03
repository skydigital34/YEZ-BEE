'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Sparkles, Filter, ChevronRight, Clock, Percent } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { CountdownTimer } from '@/components/ui/CountdownTimer';

const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const;

// 24 hours from now for live urgency countdown
const SALE_TARGET_DATE = new Date(Date.now() + 24 * 60 * 60 * 1000);

const SALE_CATEGORIES = [
  { id: 'all', label: 'All Sale' },
  { id: '50-off', label: 'Flat 50% OFF' },
  { id: 'under-10k', label: 'Under ₹10,000' },
  { id: 'clearance', label: 'Last Chance Clearance' },
];

const MOCK_SALE_PRODUCTS = Array.from({ length: 16 }, (_, i) => {
  const images = [
    '/images/flash_sale.jpg',
    '/images/ethnic_luxe.jpg',
    '/images/western_chic.jpg',
    '/images/luxury_featured_collection.jpg',
    '/images/haute_accessories.jpg',
  ];

  const originalPrice = 12999 + i * 1500;
  const discountPercent = i % 2 === 0 ? 50 : 35;
  const salePrice = Math.round(originalPrice * (1 - discountPercent / 100));
  const savings = originalPrice - salePrice;

  const sizeVariants = [
    ['S', 'M', 'L', 'XL'],
    ['M', 'L', 'XL', '2XL'],
    ['S', 'M', 'XL', '3XL'],
    ['M', 'L', '2XL'],
  ][i % 4];

  return {
    id: `sale-prod-${i + 1}`,
    name: `Luxe ${['Royal Zardozi Lehenga', 'Silk Evening Gown', 'Structured Satin Blazer', 'Handwoven Banarasi Saree', 'Embellished Corset Set', 'Pure Silk Anarkali'][i % 6]}`,
    category: ['Ethnic Luxe', 'Haute Couture', 'Western Chic', 'Jewellery & Bags'][i % 4],
    price: salePrice,
    comparePrice: originalPrice,
    discount: discountPercent,
    savings,
    rating: (4.7 + (i % 3) * 0.1).toFixed(1),
    reviews: Math.floor(30 + i * 8),
    image: images[i % images.length],
    hoverImage: images[(i + 1) % images.length],
    sizes: sizeVariants,
    stock: i % 3 === 0 ? 2 : Math.floor(3 + i % 6),
    isClearance: i % 4 === 0,
    isFlat50: discountPercent === 50,
  };
});

function SalePageContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(30000);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const filteredProducts = useMemo(() => {
    return MOCK_SALE_PRODUCTS.filter((p) => {
      if (p.price > maxPrice) return false;
      if (selectedCategory === '50-off' && !p.isFlat50) return false;
      if (selectedCategory === 'under-10k' && p.price >= 10000) return false;
      if (selectedCategory === 'clearance' && !p.isClearance) return false;
      if (selectedSizes.length && !p.sizes.some((s) => selectedSizes.includes(s))) return false;
      return true;
    });
  }, [selectedCategory, selectedSizes, maxPrice]);

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)]">

      {/* Contextual Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-[var(--color-dark)]/50 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--color-primary-gold)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--color-soft-red)] font-bold">Sale & Limited Time Offers</span>
        </nav>
      </div>

      {/* Sale Hero Banner */}
      <div className="relative bg-[var(--color-darker)] text-white overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[var(--color-soft-red)] text-white text-[10px] uppercase font-bold tracking-[0.25em] rounded-full flex items-center gap-1.5 shadow-sm">
                <Tag size={12} /> THE LUXURY SALE
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold-light)]">
                UP TO 50% OFF
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-3">
              Haute Couture at Exceptional Value
            </h1>

            <p className="text-white/80 text-sm sm:text-base font-sans leading-relaxed">
              Explore our curated selection of handcrafted zardozi lehengas, silk sarees, and contemporary evening gowns with complimentary express shipping.
            </p>
          </div>

          {/* Countdown Card */}
          <div className="bg-white/10 backdrop-blur-md border border-[var(--color-primary-gold)]/40 p-6 rounded-3xl flex flex-col items-center text-center shadow-gold-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-gold-light)] mb-3">
              <Clock size={14} className="animate-pulse" /> Flash Sale Ends In:
            </div>
            <CountdownTimer targetDate={SALE_TARGET_DATE} size="md" />
            <p className="mt-3 text-[11px] text-white/60">
              Limited inventory. Prices revert after timer expires.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Quick Discount Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 border-b border-[var(--color-champagne)] pb-4">
          {SALE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[var(--color-dark)] text-white shadow-dark-sm scale-105'
                  : 'bg-white text-[var(--color-dark)]/70 border border-gray-200 hover:border-[var(--color-primary-gold)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Circular Size Filter Strip */}
        <div className="mb-8 bg-white p-5 rounded-2xl border border-[var(--color-champagne)]/60 shadow-soft-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] flex items-center gap-1.5">
                <Percent size={14} className="text-[var(--color-soft-red)]" /> Filter by Size:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {ALL_SIZES.map((size) => {
                  const isActive = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`w-10 h-10 rounded-full text-xs font-bold border transition-all ${
                        isActive
                          ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] ring-2 ring-[var(--color-primary-gold)] scale-105'
                          : 'bg-white text-[var(--color-dark)] border-gray-200 hover:border-[var(--color-primary-gold)]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSizes.length > 0 && (
              <button
                onClick={() => setSelectedSizes([])}
                className="text-xs font-bold text-[var(--color-primary-gold)] hover:underline"
              >
                Clear Size Filter ({selectedSizes.length})
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-[var(--color-dark)]">
            Showing <span className="font-bold text-[var(--color-soft-red)]">{filteredProducts.length}</span> sale styles available
          </p>
          <span className="text-xs text-[var(--color-dark)]/50 font-medium">
            ✓ Genuine Discounts & Instant Delivery
          </span>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[var(--color-champagne)]">
            <Tag size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-display text-xl font-bold text-[var(--color-dark)] mb-2">No Sale Items Matched</h3>
            <p className="text-xs text-gray-500 mb-4">Try clearing your size or category filters to view all discounted styles.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedSizes([]); setMaxPrice(30000); }}
              className="px-6 py-2.5 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase rounded-full"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    comparePrice={product.comparePrice}
                    rating={product.rating}
                    reviews={product.reviews}
                    image={product.image}
                    hoverImage={product.hoverImage}
                    sizes={product.sizes}
                    discount={product.discount}
                    stock={product.stock}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}

export default function SalePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-warm-white)] flex items-center justify-center">Loading Sale...</div>}>
      <SalePageContent />
    </Suspense>
  );
}
