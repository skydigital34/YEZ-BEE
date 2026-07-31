'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';

const BEST_SELLERS_DATA = [
  {
    id: 'bs-1',
    name: 'Hand-embroidered Gold Zari Saree',
    category: 'Ethnic Luxe',
    price: 15999,
    comparePrice: 21999,
    rating: 4.9,
    reviews: 234,
    isBestSeller: true,
    discount: 27,
    stock: 3,
    image: '/images/ethnic_luxe.jpg',
    hoverImage: '/images/luxury_featured_collection.jpg',
    colors: [{ name: 'Royal Gold', hex: '#C9A84C' }, { name: 'Deep Crimson', hex: '#8B1A1A' }],
    sizes: ['Free Size'],
  },
  {
    id: 'bs-2',
    name: 'Obsidian Velvet Sequin Gown',
    category: 'Haute Couture',
    price: 12999,
    comparePrice: 16999,
    rating: 4.8,
    reviews: 189,
    isBestSeller: true,
    discount: 23,
    stock: 4,
    image: '/images/flash_sale.jpg',
    hoverImage: '/images/western_chic.jpg',
    colors: [{ name: 'Obsidian Black', hex: '#0D0D0D' }, { name: 'Emerald', hex: '#2D6A4F' }],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'bs-3',
    name: 'Pastel Satin Co-ord Crop Set',
    category: 'Western Chic',
    price: 5999,
    comparePrice: 7999,
    rating: 4.9,
    reviews: 312,
    isBestSeller: true,
    discount: 25,
    stock: 5,
    image: '/images/western_chic.jpg',
    hoverImage: '/images/ethnic_luxe.jpg',
    colors: [{ name: 'Champagne', hex: '#F5E6C8' }, { name: 'Blush Pink', hex: '#FDE8E8' }],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 'bs-4',
    name: 'Italian Quilted Leather Shoulder Bag',
    category: 'Jewellery & Bags',
    price: 8499,
    comparePrice: 11999,
    rating: 4.8,
    reviews: 156,
    isBestSeller: true,
    discount: 29,
    stock: 2,
    image: '/images/haute_accessories.jpg',
    hoverImage: '/images/luxury_featured_collection.jpg',
    colors: [{ name: 'Obsidian Black', hex: '#0D0D0D' }, { name: 'Tan Leather', hex: '#A8882E' }],
    sizes: ['One Size'],
  },
];

export default function BestSellers() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-20 sm:py-28 bg-[var(--color-cream)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary-gold)]">
                MOST LOVED CREATIONS
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold text-[var(--color-dark)] sm:text-4xl lg:text-5xl">
              Best Sellers
            </h2>
          </div>

          <Link
            href="/category/best-sellers"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-dark)] hover:text-[var(--color-primary-gold)] transition-colors"
          >
            View All Bestsellers <ArrowRight size={14} />
          </Link>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {BEST_SELLERS_DATA.map((product, i) => (
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
