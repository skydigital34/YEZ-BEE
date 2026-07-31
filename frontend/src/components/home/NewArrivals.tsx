'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Haute Couture', 'Ethnic Luxe', 'Western Chic', 'Jewellery & Bags'];

const NEW_ARRIVALS_DATA = [
  {
    id: 'na-1',
    name: 'Embroidered Royal Zardozi Lehenga Set',
    category: 'Ethnic Luxe',
    price: 18999,
    comparePrice: 24999,
    rating: 4.9,
    reviews: 58,
    isNew: true,
    isBestSeller: true,
    discount: 24,
    stock: 4,
    image: '/images/ethnic_luxe.jpg',
    hoverImage: '/images/luxury_featured_collection.jpg',
    colors: [{ name: 'Gold Zardozi', hex: '#C9A84C' }, { name: 'Royal Crimson', hex: '#8B1A1A' }],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 'na-2',
    name: 'Midnight Sequin Evening Ball Gown',
    category: 'Haute Couture',
    price: 14499,
    comparePrice: 18999,
    rating: 4.8,
    reviews: 34,
    isNew: true,
    discount: 23,
    stock: 2,
    image: '/images/flash_sale.jpg',
    hoverImage: '/images/western_chic.jpg',
    colors: [{ name: 'Obsidian Black', hex: '#0D0D0D' }, { name: 'Emerald Green', hex: '#2D6A4F' }],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'na-3',
    name: 'Bespoke Structured Satin Blazer & Trouser Set',
    category: 'Western Chic',
    price: 9999,
    comparePrice: 12999,
    rating: 4.9,
    reviews: 47,
    isNew: true,
    isBestSeller: true,
    stock: 5,
    image: '/images/western_chic.jpg',
    hoverImage: '/images/ethnic_luxe.jpg',
    colors: [{ name: 'Champagne Gold', hex: '#F5E6C8' }, { name: 'Charcoal Gray', hex: '#2D2D2D' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'na-4',
    name: 'Hand-woven Pure Silk Banarasi Saree',
    category: 'Ethnic Luxe',
    price: 16999,
    comparePrice: 21999,
    rating: 5.0,
    reviews: 82,
    isNew: true,
    discount: 22,
    stock: 3,
    image: '/images/luxury_featured_collection.jpg',
    hoverImage: '/images/ethnic_luxe.jpg',
    colors: [{ name: 'Ruby Red', hex: '#E74C3C' }, { name: 'Deep Gold', hex: '#C9A84C' }],
    sizes: ['Free Size'],
  },
  {
    id: 'na-5',
    name: 'Crafted Kundan & Polki Bridal Necklace Set',
    category: 'Jewellery & Bags',
    price: 7999,
    comparePrice: 10999,
    rating: 4.9,
    reviews: 29,
    isNew: true,
    discount: 27,
    stock: 6,
    image: '/images/haute_accessories.jpg',
    hoverImage: '/images/luxury_featured_collection.jpg',
    colors: [{ name: 'Pure Gold', hex: '#C9A84C' }],
    sizes: ['One Size'],
  },
  {
    id: 'na-6',
    name: 'Cascading Tiered Silk Chiffon Maxi Dress',
    category: 'Western Chic',
    price: 6999,
    comparePrice: 8999,
    rating: 4.7,
    reviews: 31,
    isNew: true,
    stock: 8,
    image: '/images/flash_sale.jpg',
    hoverImage: '/images/western_chic.jpg',
    colors: [{ name: 'Blush Pink', hex: '#FDE8E8' }, { name: 'Sage Emerald', hex: '#2D6A4F' }],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'na-7',
    name: 'Couture Hand-Embellished Corset Top',
    category: 'Western Chic',
    price: 4599,
    comparePrice: 5999,
    rating: 4.8,
    reviews: 19,
    isNew: true,
    discount: 23,
    stock: 5,
    image: '/images/western_chic.jpg',
    hoverImage: '/images/ethnic_luxe.jpg',
    colors: [{ name: 'Gold Dust', hex: '#C9A84C' }, { name: 'Black Velvet', hex: '#1A1A1A' }],
    sizes: ['XS', 'S', 'M'],
  },
  {
    id: 'na-8',
    name: 'Quilted Italian Leather Envelope Clutch',
    category: 'Jewellery & Bags',
    price: 5499,
    comparePrice: 7499,
    rating: 4.9,
    reviews: 41,
    isNew: true,
    discount: 26,
    stock: 3,
    image: '/images/haute_accessories.jpg',
    hoverImage: '/images/flash_sale.jpg',
    colors: [{ name: 'Obsidian Black', hex: '#0D0D0D' }, { name: 'Warm Cream', hex: '#F8F4ED' }],
    sizes: ['One Size'],
  },
];

export default function NewArrivals() {
  const [activeTab, setActiveTab] = useState('All');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const filteredProducts = activeTab === 'All'
    ? NEW_ARRIVALS_DATA
    : NEW_ARRIVALS_DATA.filter((p) => p.category === activeTab);

  return (
    <section className="py-20 sm:py-28 bg-[var(--color-warm-white)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary-gold)]">
                CURATED DROPS
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold text-[var(--color-dark)] sm:text-4xl lg:text-5xl">
              New Arrivals
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-champagne)] pb-2 md:border-b-0 md:pb-0">
            {CATEGORIES.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300',
                  activeTab === tab
                    ? 'bg-[var(--color-primary-gold)] text-[var(--color-dark)] shadow-gold-sm'
                    : 'text-[var(--color-dark)]/60 hover:text-[var(--color-dark)] hover:bg-[var(--color-champagne)]/40'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>

        {/* View All CTA Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/category/new-arrivals"
            className={cn(
              'inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300',
              'border border-[var(--color-dark)] text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-white',
              'shadow-soft-sm hover:shadow-dark-sm'
            )}
          >
            Explore Complete Collection
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
