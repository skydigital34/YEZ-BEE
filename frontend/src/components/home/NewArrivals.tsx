'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { YEZBEE_CATEGORIES } from '@/data/categories';
import { CATALOG_PRODUCTS, CatalogProduct } from '@/data/products';
import { api } from '@/lib/api';
import { getSafeProductImage, getSafeImageUrl } from '@/lib/utils';

import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function NewArrivals() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getProducts({ isNew: true, limit: 12 })
      .then((res) => {
        if (res && res.data && res.data.length > 0 && isMounted) {
          const mapped = res.data.map((p: any) => {
            const sortedRaw = Array.isArray(p.images)
              ? [...p.images].sort((a: any, b: any) => {
                  const orderA = typeof a?.order === 'number' ? a.order : (typeof a?.sortOrder === 'number' ? a.sortOrder : 9999);
                  const orderB = typeof b?.order === 'number' ? b.order : (typeof b?.sortOrder === 'number' ? b.sortOrder : 9999);
                  return orderA - orderB;
                })
              : [];
            const rawImages = sortedRaw.map((i: any) => getSafeImageUrl(i, '')).filter((u: string) => Boolean(u && u.trim()));
            const primaryObj = sortedRaw.find((i: any) => Boolean(i?.isPrimary));
            const thumbnail = primaryObj ? getSafeImageUrl(primaryObj, '') : getSafeImageUrl(p.thumbnail || rawImages[0], '');
            const imagesList = rawImages.length > 0 ? rawImages : (thumbnail ? [thumbnail] : []);
            const variantsList = Array.isArray(p.variants) ? p.variants : [];
            const minPrice = p.price || (variantsList.length > 0 ? variantsList.reduce((min: number, v: any) => Math.min(min, v.price || Infinity), Infinity) : 0) || 0;
            const maxCompare = p.compareAtPrice || (variantsList.length > 0 ? variantsList.reduce((max: number, v: any) => Math.max(max, v.compareAtPrice || 0), 0) : undefined);
            const totalStock = variantsList.length > 0 ? variantsList.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) : (p.stock || 0);

            return {
              id: p._id || p.id,
              name: p.name || 'YEZ BEE Item',
              slug: p.slug || p._id || p.id,
              description: p.description || '',
              shortDescription: p.shortDescription || '',
              price: minPrice,
              compareAtPrice: maxCompare && maxCompare > minPrice ? maxCompare : undefined,
              discountPercentage: p.discount || (maxCompare && maxCompare > minPrice ? Math.round(((maxCompare - minPrice) / maxCompare) * 100) : 0),
              category: p.category?.slug || p.category || 'casuals',
              categoryName: p.category?.name || p.subcategory || 'CASUALS',
              productType: p.productType || null,
              fabric: p.fabric || 'Cotton',
              fit: p.fit || 'Regular',
              pattern: p.pattern || 'Printed',
              occasion: p.occasion || 'Casual',
              careInstructions: Array.isArray(p.careInstructions) ? p.careInstructions : [],
              status: (p.status || 'published').toLowerCase(),
              stock: totalStock,
              sku: variantsList[0]?.sku || p._id,
              thumbnail,
              images: imagesList,
              galleryImages: imagesList,
              colors: variantsList.length > 0
                ? Array.from(new Set(variantsList.map((v: any) => v.color).filter(Boolean))).map(name => ({ name, hex: '#000000' })) as any
                : [{ name: 'Default', hex: '#000000' }],
              sizes: variantsList.length > 0
                ? Array.from(new Set(variantsList.map((v: any) => v.size).filter(Boolean))) as any
                : ['S', 'M', 'L'],
              variants: variantsList,
              featured: Boolean(p.featured),
              bestseller: Boolean(p.bestSeller),
              newArrival: true,
              tags: Array.isArray(p.tags) ? p.tags : [],
              seo: p.seo || { title: p.name, description: p.shortDescription },
            } as unknown as CatalogProduct;
          });
          setItems(mapped);
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

  const categories = useMemo(() => {
    return ['All', ...YEZBEE_CATEGORIES.map((c) => c.name)];
  }, []);

  const allProducts = items;

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return allProducts;
    }
    return allProducts.filter((p) => p.categoryName === selectedCategory);
  }, [allProducts, selectedCategory]);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((skel) => (
              <ProductCardSkeleton key={skel} />
            ))}
          </div>
        ) : (
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
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] transition-all shadow-md group"
          >
            Explore Full Catalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
