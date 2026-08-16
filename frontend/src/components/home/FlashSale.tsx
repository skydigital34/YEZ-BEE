'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { CatalogProduct } from '@/data/products';
import { api } from '@/lib/api';
import { getSafeProductImage, getSafeImageUrl } from '@/lib/utils';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function FlashSale() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // 24 Hour Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getProducts({ limit: 10 })
      .then((res) => {
        if (res && res.data && res.data.length > 0 && isMounted) {
          const mapped = res.data
            .map((p: any) => {
              const rawImages = p.images?.map((i: any) => getSafeImageUrl(i)).filter((u: string) => Boolean(u && u.trim())) || [];
              const thumbnail = getSafeImageUrl(p.thumbnail || rawImages[0], '');
              const imagesList = rawImages.length > 0 ? rawImages : (thumbnail ? [thumbnail] : []);
              const minPrice = p.price || (p.variants || []).reduce((min: number, v: any) => Math.min(min, v.price || Infinity), Infinity) || 0;
              const maxCompare = p.compareAtPrice || (p.variants || []).reduce((max: number, v: any) => Math.max(max, v.compareAtPrice || 0), 0);
              const discountPct = p.discount || (maxCompare > minPrice && maxCompare > 0 ? Math.round(((maxCompare - minPrice) / maxCompare) * 100) : 0);

              return {
                id: p._id || p.id,
                name: p.name,
                slug: p.slug,
                description: p.description || '',
                shortDescription: p.shortDescription || '',
                price: minPrice,
                compareAtPrice: maxCompare > minPrice ? maxCompare : undefined,
                discountPercentage: discountPct,
                category: p.category?.slug || 'casuals',
                categoryName: p.category?.name || 'CASUALS',
                productType: p.productType,
                fabric: p.fabric || 'Cotton',
                fit: p.fit || 'Regular',
                pattern: p.pattern || 'Printed',
                occasion: p.occasion || 'Casual',
                careInstructions: p.careInstructions || [],
                status: (p.status || 'published').toLowerCase(),
                stock: (p.variants || []).reduce((acc: number, v: any) => acc + (v.stock || 0), 0),
                sku: p.variants?.[0]?.sku || p._id,
                thumbnail,
                images: imagesList,
                galleryImages: imagesList,
                colors: p.variants ? Array.from(new Set(p.variants.map((v: any) => v.color))).map(name => ({ name, hex: '#000000' })) as any : [],
                sizes: p.variants ? Array.from(new Set(p.variants.map((v: any) => v.size))) as any : [],
                variants: p.variants || [],
                featured: Boolean(p.featured),
                bestseller: Boolean(p.bestSeller),
                newArrival: Boolean(p.newArrival),
                tags: p.tags || [],
                seo: p.seo || { title: p.name, description: p.shortDescription },
              } as unknown as CatalogProduct;
            });

          const discounted = mapped.filter((p) => p.discountPercentage > 0).slice(0, 4);
          setItems(discounted.length > 0 ? discounted : mapped.slice(0, 4));
        } else if (isMounted) {
          setItems([]);
        }
      })
      .catch(() => {
        if (isMounted) setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const flashSaleProducts = items;

  return (
    <section className="py-20 sm:py-28 bg-[var(--color-dark)] text-white relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary-gold)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Zap size={14} className="text-[var(--color-primary-gold)] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
                LIMITED HOUR EXCLUSIVE OFFER
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Flash Clearance Sale
            </h2>
            <div className="mt-3 h-0.5 w-16 bg-[var(--color-primary-gold)]" />
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-[var(--color-primary-gold)]/30">
            <Clock size={18} className="text-[var(--color-primary-gold)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Ends In:</span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-[var(--color-gold-light)]">
              <span className="bg-white/10 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="bg-white/10 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="bg-white/10 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((skel) => (
              <ProductCardSkeleton key={skel} />
            ))}
          </div>
        ) : (
          <div
            ref={ref}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {flashSaleProducts.map((product, i) => (
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
            href="/sale"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:shadow-gold-md transition-all"
          >
            Explore All Sale Deals <Zap size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
