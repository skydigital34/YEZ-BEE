'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';

const FLASH_DEALS = [
  {
    id: 'fs-1',
    name: 'Couture Embroidered Silk Kurta Set',
    category: 'Ethnic Luxe',
    price: 6499,
    comparePrice: 12999,
    rating: 4.9,
    reviews: 74,
    discount: 50,
    stock: 3,
    image: '/images/ethnic_luxe.jpg',
    hoverImage: '/images/luxury_featured_collection.jpg',
    colors: [{ name: 'Royal Gold', hex: '#C9A84C' }, { name: 'Obsidian', hex: '#0D0D0D' }],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'fs-2',
    name: 'Plunging Satin Evening Cocktail Dress',
    category: 'Western Chic',
    price: 4999,
    comparePrice: 9999,
    rating: 4.8,
    reviews: 53,
    discount: 50,
    stock: 2,
    image: '/images/western_chic.jpg',
    hoverImage: '/images/flash_sale.jpg',
    colors: [{ name: 'Crimson Red', hex: '#E74C3C' }, { name: 'Pure White', hex: '#FAF7F2' }],
    sizes: ['XS', 'S', 'M'],
  },
  {
    id: 'fs-3',
    name: 'Handcrafted Polki Choker Necklace Set',
    category: 'Jewellery & Bags',
    price: 3499,
    comparePrice: 6999,
    rating: 5.0,
    reviews: 91,
    discount: 50,
    stock: 4,
    image: '/images/haute_accessories.jpg',
    hoverImage: '/images/luxury_featured_collection.jpg',
    colors: [{ name: 'Polki Gold', hex: '#C9A84C' }],
    sizes: ['One Size'],
  },
  {
    id: 'fs-4',
    name: 'Velvet Tailored Blazer & Trouser Set',
    category: 'Western Chic',
    price: 5999,
    comparePrice: 11999,
    rating: 4.9,
    reviews: 62,
    discount: 50,
    stock: 1,
    image: '/images/western_chic.jpg',
    hoverImage: '/images/ethnic_luxe.jpg',
    colors: [{ name: 'Velvet Navy', hex: '#1B2A4A' }, { name: 'Emerald', hex: '#2D6A4F' }],
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-[var(--color-darker)] via-[var(--color-dark)] to-[var(--color-darker)] text-white relative overflow-hidden">
      {/* Background Subtle Shimmer Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--color-primary-gold)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Flash Sale Header & Timer Banner */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-soft-red)] text-white shadow-lg animate-pulse">
              <Zap size={24} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-gold-light)]">
                  LIMITED TIME COUTURE SALE
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Flash Offer: Flat 50% Off
              </h2>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-[var(--color-primary-gold)]" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider hidden sm:inline">Ending In:</span>
            <div className="flex items-center gap-2 text-center font-mono">
              <div className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border border-[var(--color-primary-gold)]/30 min-w-[52px]">
                <span className="text-lg font-bold text-[var(--color-gold-light)]">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase tracking-wider text-white/50">Hours</span>
              </div>
              <span className="text-xl font-bold text-[var(--color-primary-gold)]">:</span>
              <div className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border border-[var(--color-primary-gold)]/30 min-w-[52px]">
                <span className="text-lg font-bold text-[var(--color-gold-light)]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase tracking-wider text-white/50">Mins</span>
              </div>
              <span className="text-xl font-bold text-[var(--color-primary-gold)]">:</span>
              <div className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border border-[var(--color-primary-gold)]/30 min-w-[52px]">
                <span className="text-lg font-bold text-[var(--color-gold-light)]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase tracking-wider text-white/50">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {FLASH_DEALS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
