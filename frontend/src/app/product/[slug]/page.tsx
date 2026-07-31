'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Maximize2,
  Check,
  Sparkles,
  X,
  Lock,
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
];

const COLORS = [
  { name: 'Royal Gold', hex: '#C9A84C', inStock: true },
  { name: 'Obsidian Black', hex: '#0D0D0D', inStock: true },
  { name: 'Crimson Red', hex: '#8B1A1A', inStock: true },
  { name: 'Emerald Green', hex: '#2D6A4F', inStock: false },
];

const SIZES = [
  { label: 'XS', inStock: true },
  { label: 'S', inStock: true },
  { label: 'M', inStock: true },
  { label: 'L', inStock: true },
  { label: 'XL', inStock: false },
];

const SPECS = [
  { label: 'Craft Fabric', value: '100% Pure Mulberry Crepe Silk' },
  { label: 'Embroidery', value: 'Handcrafted Royal Zardozi & Sequins' },
  { label: 'Silhouette', value: 'Bespoke A-Line Royal Gown' },
  { label: 'Closure', value: 'Concealed YKK Back Zipper & Hooks' },
  { label: 'Lining', value: '100% Breathable Viscose Satin' },
  { label: 'Origin', value: 'Made in Atelier Jaipur, India' },
];

const RELATED_PRODUCTS = [
  {
    id: 'rel-1',
    name: 'Midnight Sequin Evening Gown',
    category: 'Haute Couture',
    price: 14499,
    comparePrice: 18999,
    rating: 4.8,
    reviews: 34,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'rel-2',
    name: 'Hand-woven Pure Silk Saree',
    category: 'Ethnic Luxe',
    price: 16999,
    comparePrice: 21999,
    rating: 5.0,
    reviews: 82,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'rel-3',
    name: 'Bespoke Satin Blazer Set',
    category: 'Western Chic',
    price: 9999,
    comparePrice: 12999,
    rating: 4.9,
    reviews: 47,
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'rel-4',
    name: 'Kundan Bridal Necklace Set',
    category: 'Jewellery & Bags',
    price: 7999,
    comparePrice: 10999,
    rating: 4.9,
    reviews: 29,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = (params.slug as string) || 'luxe-gown';

  const [selectedColor, setSelectedColor] = useState(COLORS[0].name);
  const [selectedSize, setSelectedSize] = useState('S');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care'>('desc');
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const productId = `prod-${slug}`;
  const isWishlisted = isInWishlist(productId);

  const handleAddToCart = () => {
    addToCart({
      id: productId,
      name: 'Embroidered Royal Zardozi Silk Gown',
      price: 18999,
      image: PRODUCT_IMAGES[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleWishlist = () => {
    toggleWishlist({
      id: productId,
      name: 'Embroidered Royal Zardozi Silk Gown',
      price: 18999,
      image: PRODUCT_IMAGES[0],
      category: 'Haute Couture',
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)] pt-4 lg:pt-6">
      {/* Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs text-[var(--color-dark)]/50 font-medium">
          <Link href="/" className="hover:text-[var(--color-primary-gold)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/category/ethnic-wear" className="hover:text-[var(--color-primary-gold)] transition-colors">Ethnic Luxe</Link>
          <span>/</span>
          <span className="text-[var(--color-dark)] font-bold">Royal Zardozi Silk Gown</span>
        </nav>
      </div>

      {/* Main Product Hero Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left - Photography Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Featured Photo */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-white shadow-soft-lg border border-[var(--color-champagne)]/60">
              <Image
                src={PRODUCT_IMAGES[activeImage]}
                alt="Royal Zardozi Silk Gown"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center"
              />
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span className="px-3 py-1 bg-[var(--color-dark)] text-white text-[10px] uppercase font-bold tracking-wider rounded">
                  Haute Couture 2026
                </span>
                <span className="px-3 py-1 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-[10px] uppercase font-bold tracking-wider rounded">
                  24% OFF
                </span>
              </div>

              {/* Prev / Next Image Control Arrows */}
              <button
                onClick={() => setActiveImage((prev) => (prev === 0 ? PRODUCT_IMAGES.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[var(--color-dark)] hover:bg-[var(--color-primary-gold)] transition-colors shadow-sm"
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setActiveImage((prev) => (prev === PRODUCT_IMAGES.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[var(--color-dark)] hover:bg-[var(--color-primary-gold)] transition-colors shadow-sm"
                aria-label="Next photo"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3">
              {PRODUCT_IMAGES.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === index ? 'border-[var(--color-primary-gold)] shadow-gold-sm scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${index + 1}`} fill sizes="20vw" className="object-cover object-center" />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Details & Purchase Form */}
          <div className="lg:col-span-5 flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-champagne)]/60 shadow-soft-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary-gold)]">
                  ROYAL HERITAGE EDITION
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-dark)] leading-tight mb-2">
                Embroidered Royal Zardozi Silk Gown
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-[var(--color-primary-gold)]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} className="fill-[var(--color-primary-gold)]" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[var(--color-dark)]">4.9</span>
                <span className="text-xs text-[var(--color-dark)]/50">(58 Verified Patron Reviews)</span>
              </div>

              {/* Price Breakdown */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-sans text-3xl font-bold text-[var(--color-dark)]">
                  ₹18,999
                </span>
                <span className="text-base text-[var(--color-dark)]/40 line-through font-sans">
                  ₹24,999
                </span>
                <span className="text-xs font-bold text-[var(--color-soft-red)] bg-[var(--color-blush)] px-2.5 py-1 rounded-full">
                  Save ₹6,000 (24% OFF)
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-dark)]/50 font-medium">
                Inclusive of all custom taxes. Free express white-glove shipping.
              </p>
            </div>

            <div className="h-px bg-[var(--color-champagne)]" />

            {/* Color Swatches Selector */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]">
                <span>Color: <span className="text-[var(--color-primary-gold)]">{selectedColor}</span></span>
              </div>
              <div className="flex items-center gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => c.inStock && setSelectedColor(c.name)}
                    disabled={!c.inStock}
                    className={`h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === c.name ? 'ring-2 ring-[var(--color-primary-gold)] ring-offset-2 scale-110' : 'border-gray-200 hover:scale-105'
                    } ${!c.inStock && 'opacity-40 cursor-not-allowed'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.name && <Check size={14} className={c.hex === '#FAF7F2' ? 'text-black' : 'text-white'} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]">
                <span>Size (IN)</span>
                <button onClick={() => setShowSizeChart(true)} className="text-xs text-[var(--color-primary-gold)] hover:underline font-semibold flex items-center gap-1">
                  <Shield size={13} /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size.label}
                    onClick={() => size.inStock && setSelectedSize(size.label)}
                    disabled={!size.inStock}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedSize === size.label
                        ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-dark-sm'
                        : size.inStock
                        ? 'border-gray-200 text-[var(--color-dark)]/80 hover:border-[var(--color-primary-gold)]'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Urgency Badge */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3.5 py-2.5 text-gray-600 hover:text-black transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2.5 text-xs font-bold min-w-[36px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                  className="px-3.5 py-2.5 text-gray-600 hover:text-black transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <span className="text-xs font-bold text-[var(--color-soft-red)] animate-pulse">
                ⚡ Only 3 left in stock!
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-[var(--color-emerald)] text-white shadow-soft-md'
                    : 'bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] hover:shadow-gold-md hover:scale-[1.01]'
                }`}
              >
                {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                {added ? 'Added to Luxury Bag' : 'Add to Bag'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleWishlist}
                  className={`flex-1 py-3.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isWishlisted
                      ? 'border-[var(--color-soft-red)] text-[var(--color-soft-red)] bg-[var(--color-blush)]'
                      : 'border-gray-200 text-[var(--color-dark)] hover:border-[var(--color-primary-gold)]'
                  }`}
                >
                  <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                  {isWishlisted ? 'Saved' : 'Wishlist'}
                </button>

                <button className="flex-1 py-3.5 rounded-xl border border-gray-200 text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider hover:border-[var(--color-primary-gold)] transition-all flex items-center justify-center gap-2">
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>

            {/* Trust Micro Features */}
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-[var(--color-champagne)] text-center">
              <div className="flex flex-col items-center">
                <Truck size={18} className="text-[var(--color-primary-gold)] mb-1" />
                <span className="text-[10px] font-bold text-[var(--color-dark)]">Free Express Delivery</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw size={18} className="text-[var(--color-primary-gold)] mb-1" />
                <span className="text-[10px] font-bold text-[var(--color-dark)]">7-Day Doorstep Return</span>
              </div>
              <div className="flex flex-col items-center">
                <Lock size={18} className="text-[var(--color-primary-gold)] mb-1" />
                <span className="text-[10px] font-bold text-[var(--color-dark)]">256-Bit SSL Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Product Specifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[var(--color-champagne)]/60 shadow-soft-sm">
          <div className="flex border-b border-[var(--color-champagne)] gap-8 mb-6">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'desc' ? 'border-[var(--color-primary-gold)] text-[var(--color-primary-gold)]' : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              Description & Craft
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'specs' ? 'border-[var(--color-primary-gold)] text-[var(--color-primary-gold)]' : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'care' ? 'border-[var(--color-primary-gold)] text-[var(--color-primary-gold)]' : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              Care & Handling
            </button>
          </div>

          {activeTab === 'desc' && (
            <div className="space-y-4 text-sm text-[var(--color-dark)]/80 leading-relaxed font-sans">
              <p>
                Handcrafted at our Jaipur atelier, the Royal Zardozi Silk Gown is the epitome of timeless Indian luxury fashion. Every seam is cut from 100% pure mulberry crepe silk, providing a fluid drape that moves gracefully with every step.
              </p>
              <p>
                Intricate zardozi embroidery featuring gold threads, cutdana beads, and hand-stitched sequins adorns the bodice and sleeve cuffs. Designed for grand weddings, royal galas, and red-carpet appearances.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPECS.map((s) => (
                <div key={s.label} className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-500">{s.label}</span>
                  <span className="font-bold text-black">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'care' && (
            <div className="text-xs text-gray-600 space-y-2">
              <p>• Dry clean only with specialized silk garment care professionals.</p>
              <p>• Cool steam iron on reverse side with protective cloth overlay.</p>
              <p>• Store hung inside breathable cotton garment cover away from direct sunlight.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Recommendations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-dark)] mb-8">
          You May Also Admire
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RELATED_PRODUCTS.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {showSizeChart && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeChart(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-white rounded-3xl z-50 p-6 sm:p-8 shadow-dark-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b">
                <h3 className="font-display font-bold text-lg">Atelier Size Guide (Inches)</h3>
                <button onClick={() => setShowSizeChart(false)} className="p-1 hover:text-[var(--color-primary-gold)]">
                  <X size={20} />
                </button>
              </div>
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2.5 font-bold">Size</th>
                    <th className="py-2.5 font-bold">Bust</th>
                    <th className="py-2.5 font-bold">Waist</th>
                    <th className="py-2.5 font-bold">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: 'XS', bust: '32"', waist: '26"', hip: '35"' },
                    { size: 'S', bust: '34"', waist: '28"', hip: '37"' },
                    { size: 'M', bust: '36"', waist: '30"', hip: '39"' },
                    { size: 'L', bust: '38"', waist: '32"', hip: '41"' },
                    { size: 'XL', bust: '40"', waist: '34"', hip: '43"' },
                  ].map((row) => (
                    <tr key={row.size} className="border-b">
                      <td className="py-2.5 font-bold text-[var(--color-primary-gold)]">{row.size}</td>
                      <td className="py-2.5">{row.bust}</td>
                      <td className="py-2.5">{row.waist}</td>
                      <td className="py-2.5">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
