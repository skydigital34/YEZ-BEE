'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { useWishlist } from '@/providers/WishlistProvider';

const MOCK_FALLBACK_WISHLIST = [
  {
    id: 'wl-1',
    name: 'Embroidered Royal Zardozi Lehenga Set',
    category: 'Ethnic Luxe',
    price: 18999,
    comparePrice: 24999,
    rating: 4.9,
    reviews: 58,
    isNew: true,
    discount: 24,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop',
    colors: [{ name: 'Gold Zardozi', hex: '#C9A84C' }],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'wl-2',
    name: 'Midnight Sequin Evening Ball Gown',
    category: 'Haute Couture',
    price: 14499,
    comparePrice: 18999,
    rating: 4.8,
    reviews: 34,
    isNew: true,
    discount: 23,
    stock: 2,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    colors: [{ name: 'Obsidian Black', hex: '#0D0D0D' }],
    sizes: ['S', 'M'],
  },
  {
    id: 'wl-3',
    name: 'Hand-woven Pure Silk Banarasi Saree',
    category: 'Ethnic Luxe',
    price: 16999,
    comparePrice: 21999,
    rating: 5.0,
    reviews: 82,
    isNew: true,
    discount: 22,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    colors: [{ name: 'Ruby Red', hex: '#E74C3C' }],
    sizes: ['Free Size'],
  },
];

export default function WishlistPage() {
  const { items } = useWishlist();

  const wishlistProducts = items.length > 0
    ? items.map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category || 'Luxury Wear',
        price: i.price,
        image: i.image,
        hoverImage: i.image,
        colors: [{ name: 'Gold', hex: '#C9A84C' }],
        sizes: ['S', 'M', 'L'],
      }))
    : MOCK_FALLBACK_WISHLIST;

  const copyWishlistLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Your luxury wishlist link has been copied to your clipboard!');
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[var(--color-champagne)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary-gold)]">
                SAVED ATELIER PIECES
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-dark)]">
              My Luxury Wishlist ({wishlistProducts.length})
            </h1>
          </div>

          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <button
              onClick={copyWishlistLink}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] hover:border-[var(--color-primary-gold)] transition-colors"
            >
              <Share2 size={14} /> Share Wishlist
            </button>
            <Link
              href="/category/new-arrivals"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-primary-gold)] hover:underline"
            >
              <ArrowLeft size={14} /> Explore Catalogue
            </Link>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[var(--color-champagne)] shadow-soft-sm text-center">
            <div className="h-20 w-20 rounded-full bg-[var(--color-blush)] flex items-center justify-center text-[var(--color-soft-red)] mb-4">
              <Heart size={36} className="fill-[var(--color-soft-red)]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[var(--color-dark)] mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-[var(--color-dark)]/60 max-w-sm mb-8 font-sans">
              Save your favorite haute couture gowns, sarees, and accessories to revisit anytime.
            </p>
            <Link
              href="/category/new-arrivals"
              className="px-8 py-3.5 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:shadow-gold-md transition-all scale-105"
            >
              Discover Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <AnimatePresence>
              {wishlistProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
