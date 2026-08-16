'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRENDS = [
  {
    id: 1,
    title: 'Peplum Tops & Waist Tunics',
    description: 'Sculpted silhouettes redefining modern casual glam',
    slug: '/category/peplum-tops',
    image: '/images/western_chic.jpg',
  },
  {
    id: 2,
    title: 'Casuals & Feeding Edit',
    description: 'Effortlessly fluid matching ensembles with hidden nursing zips',
    slug: '/category/casuals/feeding',
    image: '/images/categories/maternity-kurtis.jpg',
  },
  {
    id: 3,
    title: 'Party Wear & Festive Gowns',
    description: 'Sharp tailoring & gold embellishments for celebrations',
    slug: '/category/party-wear',
    image: '/images/maternity/slide3.jpg',
  },
  {
    id: 4,
    title: 'Hand-Woven Ethnic Sarees',
    description: 'Ethereal sheer drapes embellished with gold zari motifs',
    slug: '/category/ethnic-wear',
    image: '/images/ethnic_luxe.jpg',
  },
];

export default function TrendingSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
            SEASONAL TREND RADAR
          </span>
        </div>
        <h2 className="font-display text-3xl font-bold text-[var(--color-dark)] sm:text-4xl lg:text-5xl">
          Trending Now
        </h2>
        <div className="mt-3 h-0.5 w-16 bg-[var(--color-primary-gold)]" />
      </div>

      <div className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4">
        {TRENDS.map((trend) => (
          <Link
            key={trend.id}
            href={trend.slug}
            className={cn(
              'group relative flex h-[420px] w-[82vw] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-2xl sm:h-[460px] sm:w-[60vw] lg:h-[500px] lg:w-[38vw]',
              'shadow-soft-lg hover:shadow-gold-md transition-all duration-500'
            )}
          >
            <Image
              src={trend.image}
              alt={trend.title}
              fill
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 60vw, 40vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            <div className="relative z-10 p-8 sm:p-10 text-white">
              <span className="mb-2 inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-gold-light)]">
                TREND REPORT
              </span>
              <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {trend.title}
              </h3>
              <p className="mt-2 text-sm text-white/75 line-clamp-2">
                {trend.description}
              </p>
              <span
                className={cn(
                  'mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] transition-transform duration-300',
                  'text-[var(--color-primary-gold)] group-hover:translate-x-1'
                )}
              >
                Shop The Trend <ChevronRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
