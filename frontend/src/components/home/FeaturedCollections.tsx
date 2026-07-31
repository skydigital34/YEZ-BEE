'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const collections = [
  {
    name: 'The Royal Festival Edit',
    slug: '/category/ethnic-wear',
    subtitle: 'Zardozi Embroideries & Hand-woven Silks',
    itemCount: '64 Couture Pieces',
    image: '/images/luxury_featured_collection.jpg',
    span: 'col-span-1 lg:col-span-2 lg:row-span-2',
    height: 'h-[440px] lg:h-[560px]',
  },
  {
    name: 'Western Evening Glamour',
    slug: '/category/western-wear',
    subtitle: 'Sequin Ball Gowns & Satin Cocktails',
    itemCount: '48 Couture Pieces',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop',
    span: 'col-span-1',
    height: 'h-[270px] lg:h-[268px]',
  },
  {
    name: 'Tailored Power Suits',
    slug: '/category/western-wear',
    subtitle: 'Precision Tailoring & Luxe Blazers',
    itemCount: '32 Couture Pieces',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=1000&auto=format&fit=crop',
    span: 'col-span-1',
    height: 'h-[270px] lg:h-[268px]',
  },
  {
    name: 'High Jewellery & Fine Leather',
    slug: '/category/accessories',
    subtitle: 'Statement Kundan & Italian Bags',
    itemCount: '56 Items',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
    span: 'col-span-1 lg:col-span-2',
    height: 'h-[270px] lg:h-[268px]',
  },
];

export default function FeaturedCollections() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
              SEASONAL EDITS
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold text-[var(--color-dark)] sm:text-4xl lg:text-5xl">
            Featured Collections
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-16 bg-[var(--color-primary-gold)]" />
          <p className="mt-4 text-sm text-[var(--color-dark)]/60 sm:text-base">
            Curated haute couture edits designed to celebrate elegance and individuality
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {collections.map((col, i) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: 'easeOut' }}
              className={cn('relative group overflow-hidden rounded-2xl shadow-soft-sm', col.span, col.height)}
            >
              <Link href={col.slug} className="block h-full w-full">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-500 group-hover:from-black/90" />

                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-gold-light)] mb-1">
                    {col.itemCount}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1 group-hover:text-[var(--color-gold-light)] transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/75 mb-4 line-clamp-1">
                    {col.subtitle}
                  </p>

                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-primary-gold)] group-hover:translate-x-1 transition-transform">
                    Explore Collection <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
