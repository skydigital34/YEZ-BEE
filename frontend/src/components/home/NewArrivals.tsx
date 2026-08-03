'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { YEZBEE_CATEGORIES } from '@/data/categories';
import { CATALOG_PRODUCTS } from '@/data/products';

export default function NewArrivals() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const categories = useMemo(() => {
    return ['All', ...YEZBEE_CATEGORIES.map((c) => c.name)];
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return CATALOG_PRODUCTS;
    }
    return CATALOG_PRODUCTS.filter((p) => p.categoryName === selectedCategory);
  }, [selectedCategory]);

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
                onClick={() => setSelectedCategory(cat)}
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

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProducts.slice(0, 6).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
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
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/category/all"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] transition-all shadow-md group"
          >
            Explore Full Catalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
