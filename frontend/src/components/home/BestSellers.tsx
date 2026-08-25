'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { api } from '@/lib/api';
import { extractProducts, normalizeProduct, getSafeProductImage } from '@/lib/utils';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function Bestsellers() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getProducts({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const raw = extractProducts(res);
        const normalized = raw.map(normalizeProduct).filter(Boolean);
        const best = normalized.filter((p) => p.bestseller || p.featured || p.discountPercentage > 0);
        setItems(best.length > 0 ? best.slice(0, 8) : normalized.slice(0, 8));
      })
      .catch((err) => {
        console.error('[BestSellers] error fetching products:', err);
        if (isMounted) setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
              PATRONS MOST LOVED
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold text-[var(--color-dark)] sm:text-4xl lg:text-5xl">
            Bestselling Creations
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-16 bg-[var(--color-primary-gold)]" />
          <p className="mt-4 text-sm text-[var(--color-dark)]/60 sm:text-base">
            Our most sought-after maternity styles, nursing lounge sets, and everyday comfort fashion
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((skel) => (
              <ProductCardSkeleton key={skel} />
            ))}
          </div>
        ) : (
          <div
            ref={ref}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {items.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ delay: Math.min(i * 0.06, 0.4), duration: 0.5, ease: 'easeOut' }}
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
                />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/category/all"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[var(--color-dark)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[var(--color-dark)] hover:text-white transition-all shadow-sm group"
          >
            View All Bestsellers <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
