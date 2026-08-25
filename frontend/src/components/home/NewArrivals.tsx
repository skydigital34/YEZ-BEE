'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { YEZBEE_CATEGORIES } from '@/data/categories';
import { useProducts } from '@/hooks/useProducts';
import { matchesCategory, getSafeProductImage } from '@/lib/utils';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function NewArrivals() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [displayCount, setDisplayCount] = useState<number>(12);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const { data: items = [], isLoading: loading } = useProducts({ limit: 100 });

  const categories = useMemo(() => {
    return ['All', ...YEZBEE_CATEGORIES.map((c) => c.name)];
  }, []);

  const filteredProducts = useMemo(() => {
    return items.filter((p) => matchesCategory(p, selectedCategory));
  }, [items, selectedCategory]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  return (
    <section className="py-20 sm:py-28 bg-[var(--color-warm-white)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
                FRESH OFF THE ATELIER
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-dark)]">
              New Season Arrivals
            </h2>
            <div className="mt-3 h-0.5 w-16 bg-[var(--color-primary-gold)]" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setDisplayCount(12);
                }}
                suppressHydrationWarning
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[var(--color-dark)] text-white shadow-dark-sm scale-105'
                    : 'bg-white text-[var(--color-dark)]/70 hover:bg-[var(--color-champagne)]/40 hover:text-[var(--color-dark)] border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((skel) => (
              <ProductCardSkeleton key={skel} />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/60 p-8 shadow-soft-sm">
            <p className="text-sm font-semibold text-gray-500">No products found in "{selectedCategory}".</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-4 px-6 py-2.5 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] transition-all"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div
            ref={ref}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {visibleProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ delay: Math.min(i * 0.05, 0.5), duration: 0.4, ease: 'easeOut' }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  category={product.categoryName}
                  price={product.price}
                  comparePrice={product.compareAtPrice}
                  rating={String(product.rating)}
                  reviews={product.reviewCount}
                  image={getSafeProductImage(product, 0)}
                  hoverImage={getSafeProductImage(product, 1)}
                  colors={product.colors}
                  sizes={product.sizes}
                  discount={product.discountPercentage}
                  stock={product.stock}
                  isNew={Boolean(product.newArrival || product.isNewProduct || product.isNew)}
                  isBestSeller={Boolean(product.bestSeller || product.isBestSeller || product.bestseller)}
                />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          {filteredProducts.length > displayCount && (
            <button
              onClick={() => setDisplayCount((prev) => prev + 12)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-[var(--color-dark)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[var(--color-dark)] hover:text-white transition-all shadow-sm cursor-pointer"
            >
              Load More Products ({filteredProducts.length - displayCount} Left) <ChevronDown size={16} />
            </button>
          )}

          <Link
            href="/category/all"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] transition-all shadow-md group"
          >
            Explore Full Catalog ({items.length} Items) <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
