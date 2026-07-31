'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Search,
  Grid3X3,
  List,
  Star,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

const FASHION_PHOTOS = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
];

const MOCK_RESULTS = Array.from({ length: 16 }, (_, i) => ({
  id: `search-${i + 1}`,
  name: `Luxe ${['Royal Zardozi Gown', 'Banarasi Silk Saree', 'Sequin Cocktail Dress', 'Structured Satin Blazer', 'Pearl Choker Set', 'Velvet Evening Gown', 'Designer Anarkali', 'Italian Leather Clutch'][i % 8]}`,
  category: ['Ethnic Luxe', 'Western Chic', 'Accessories', 'Haute Couture'][i % 4],
  price: 4999 + i * 1500,
  comparePrice: 7999 + i * 1500,
  rating: (4.2 + (i % 8) * 0.1).toFixed(1),
  reviews: Math.floor(Math.random() * 120) + 15,
  image: FASHION_PHOTOS[i % FASHION_PHOTOS.length],
  hoverImage: FASHION_PHOTOS[(i + 1) % FASHION_PHOTOS.length],
  isNew: i < 4,
  discount: 20 + (i % 3) * 5,
  colors: [{ name: 'Gold', hex: '#C9A84C' }],
  sizes: ['S', 'M', 'L'],
}));

const TRENDING_SEARCHES = ['Evening Gowns', 'Silk Sarees', 'Velvet Blazers', 'Zardozi Lehengas', 'Gold Jewellery', 'Designer Kurtas'];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(query);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header Form */}
        <form onSubmit={handleSearch} className="relative mb-8 max-w-2xl mx-auto">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary-gold)]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for gowns, sarees, blazers, accessories..."
            className="w-full pl-12 pr-28 py-4 bg-white border border-[var(--color-champagne)] rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:border-[var(--color-primary-gold)] shadow-soft-sm text-[var(--color-dark)]"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-gold-sm transition-all"
          >
            Search
          </button>
        </form>

        {/* Results Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[var(--color-champagne)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary-gold)]">
                ATELIER SEARCH RESULTS
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-dark)]">
              {query ? `Results for "${query}"` : 'Explore Catalogue'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-semibold">{MOCK_RESULTS.length} Items Found</span>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {MOCK_RESULTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
