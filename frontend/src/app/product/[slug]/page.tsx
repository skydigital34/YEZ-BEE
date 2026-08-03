'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Check,
  Sparkles,
  X,
  Lock,
  AlertCircle,
  Package,
  ChevronDown,
  ChevronUp,
  Tag,
  MapPin,
  Maximize2,
  HelpCircle,
  ThumbsUp,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { CATALOG_PRODUCTS, getProductBySlug, CatalogProduct } from '@/data/products';

// ─── Pincode Shipping Database (Mock Logic) ──────────────────────────────────
const SERVICABLE_PINCODES: Record<string, { days: number; cod: boolean; city: string }> = {
  '600001': { days: 2, cod: true, city: 'Chennai' },
  '400001': { days: 2, cod: true, city: 'Mumbai' },
  '110001': { days: 3, cod: true, city: 'Delhi' },
  '560001': { days: 2, cod: true, city: 'Bangalore' },
  '500001': { days: 3, cod: true, city: 'Hyderabad' },
  '700001': { days: 4, cod: true, city: 'Kolkata' },
};

// ─── Dynamic Delivery Date Calculation ────────────────────────────────────────
function getEstimatedDeliveryDate(daysToAdd: number = 3): string {
  const target = new Date();
  target.setDate(target.getDate() + daysToAdd);
  return target.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params.slug as string) || 'floral-cotton-maternity-kurti';

  // Lookup product from catalog
  const product: CatalogProduct = useMemo(() => {
    return getProductBySlug(slug) || CATALOG_PRODUCTS[0];
  }, [slug]);

  // Color & Size State
  const [selectedColor, setSelectedColor] = useState<string>(() => product.colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizeError, setSizeError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [added, setAdded] = useState(false);

  // Accordion Expand States (Description default OPEN)
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    description: true,
    material: false,
    details: false,
    shipping: false,
    returns: false,
    care: false,
  });

  // Pincode Checker State
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{
    searched: boolean;
    available: boolean;
    city?: string;
    deliveryDate?: string;
    cod?: boolean;
  }>({ searched: false, available: false });

  // Reviews Filter State
  const [reviewSort, setReviewSort] = useState<'newest' | 'highest' | 'lowest'>('newest');

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  // ── Color-dependent Size Availability ────────────────────────────────────
  const availableVariantsForColor = useMemo(() => {
    return product.variants.filter((v) => v.color === selectedColor);
  }, [product.variants, selectedColor]);

  // Derive size options for selected color
  const sizeAvailability = useMemo(() => {
    return product.sizes.map((sizeName) => {
      const variant = availableVariantsForColor.find((v) => v.size === sizeName);
      const stock = variant ? variant.stock : 0;
      return {
        size: sizeName,
        stock,
        isOffered: !!variant,
        isInStock: stock > 0,
      };
    });
  }, [product.sizes, availableVariantsForColor]);

  const selectedVariant = useMemo(() => {
    return availableVariantsForColor.find((v) => v.size === selectedSize);
  }, [availableVariantsForColor, selectedSize]);

  const stockForSelectedSize = selectedVariant?.stock ?? 0;
  const isLowStock = stockForSelectedSize > 0 && stockForSelectedSize <= 5;

  // Handle color change (resets invalid size)
  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    const newColorVariants = product.variants.filter((v) => v.color === colorName);
    const newVariant = newColorVariants.find((v) => v.size === selectedSize);
    if (!newVariant || newVariant.stock === 0) {
      setSelectedSize('');
    }
  };

  const handleSizeSelect = useCallback((sizeName: string, isInStock: boolean) => {
    if (!isInStock) return;
    setSelectedSize(sizeName);
    setSizeError(false);
  }, []);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 4000);
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.thumbnail,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 4000);
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    handleAddToCart();
    router.push('/cart');
  };

  const handleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.thumbnail,
      category: product.categoryName,
    });
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (cleanPin.length !== 6) return;

    const data = SERVICABLE_PINCODES[cleanPin];
    if (data) {
      setPincodeResult({
        searched: true,
        available: true,
        city: data.city,
        deliveryDate: getEstimatedDeliveryDate(data.days),
        cod: data.cod,
      });
    } else {
      // Standard nationwide delivery fallback
      setPincodeResult({
        searched: true,
        available: true,
        city: 'Your Location',
        deliveryDate: getEstimatedDeliveryDate(3),
        cod: true,
      });
    }
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Related products in category
  const relatedProducts = useMemo(() => {
    return CATALOG_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product]);

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)] pb-24 lg:pb-16">

      {/* Contextual Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-[var(--color-dark)]/50 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--color-primary-gold)] transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.category}`} className="hover:text-[var(--color-primary-gold)] transition-colors">
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-dark)] font-bold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>

      {/* ── CORE 2-COLUMN LAYOUT (DESKTOP: GALLERY LEFT, INFO RIGHT) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── LEFT COLUMN: IMAGE GALLERY (55% WIDTH ON DESKTOP) ── */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 sticky top-24">

            {/* Vertical Thumbnail Rail (Desktop Left) */}
            <div className="hidden md:flex flex-col gap-3 shrink-0 w-20">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === index
                      ? 'border-[var(--color-primary-gold)] shadow-gold-sm scale-105'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${index + 1}`}
                >
                  <Image src={img} alt={`${product.name} angle ${index + 1}`} fill sizes="80px" className="object-cover object-center" />
                </button>
              ))}
            </div>

            {/* Dominant Primary Image Frame */}
            <div className="relative flex-1 aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-soft-lg border border-[var(--color-champagne)]/60 group">
              <Image
                src={product.images[activeImageIndex] || product.thumbnail}
                alt={`${product.name} - View ${activeImageIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              {/* Product Badges (Top Left) */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.maternity && (
                  <span className="px-3 py-1 bg-[var(--color-dark)] text-white text-[10px] uppercase font-bold tracking-wider rounded-full shadow-sm">
                    MATERNITY FRIENDLY
                  </span>
                )}
                {product.feedingFriendly && (
                  <span className="px-3 py-1 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-[10px] uppercase font-bold tracking-wider rounded-full shadow-gold-sm">
                    NURSING ACCESS
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="px-3 py-1 bg-[var(--color-soft-red)] text-white text-[10px] uppercase font-bold tracking-wider rounded-full shadow-sm">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Fullscreen Expand Trigger */}
              <button
                onClick={() => setShowFullscreenModal(true)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 backdrop-blur-md text-[var(--color-dark)] hover:bg-[var(--color-primary-gold)] transition-colors shadow-sm"
                aria-label="View Fullscreen"
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>

              {/* Image Counter Badge (Bottom Right) */}
              <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-bold">
                0{activeImageIndex + 1} / 0{product.images.length}
              </div>

              {/* Next / Prev Controls */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[var(--color-dark)] hover:bg-[var(--color-primary-gold)] transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[var(--color-dark)] hover:bg-[var(--color-primary-gold)] transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Horizontal Mobile Thumbnail Carousel */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-[3/4] w-16 shrink-0 rounded-xl overflow-hidden border-2 ${
                    activeImageIndex === index ? 'border-[var(--color-primary-gold)]' : 'border-transparent opacity-70'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>

          </div>

          {/* ── RIGHT COLUMN: PURCHASE INFORMATION (45% WIDTH ON DESKTOP) ── */}
          <div className="lg:col-span-5 flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-champagne)]/70 shadow-soft-sm">

            {/* 1. Category Tag & Product Name */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-primary-gold)] block mb-1">
                {product.categoryName}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-dark)] leading-tight">
                {product.name}
              </h1>

              {/* 2. Rating & Verified Reviews */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-[var(--color-primary-gold)]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-[var(--color-primary-gold)]" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[var(--color-dark)]">{product.rating}</span>
                <span className="text-xs text-gray-500">({product.reviewCount} Verified Reviews)</span>
              </div>
            </div>

            {/* 3. Price & Discount Display */}
            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-150">
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-3xl font-bold text-[var(--color-dark)]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice && (
                  <span className="text-base text-gray-400 line-through font-sans">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="text-xs font-bold text-[var(--color-soft-red)] bg-[var(--color-blush)] px-2.5 py-1 rounded-full">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* 4. Active Promotion Offer */}
              <div className="mt-2.5 pt-2.5 border-t border-gray-200/60 flex items-center gap-2 text-xs font-semibold text-[var(--color-primary-gold)]">
                <Tag size={14} />
                <span>Limited Offer: Extra 10% OFF with code <strong className="font-mono bg-[var(--color-champagne)]/60 px-1.5 py-0.5 rounded text-[var(--color-dark)]">YEZ10</strong></span>
              </div>
            </div>

            {/* 5. Real Stock Status Indicator */}
            <div>
              {selectedSize ? (
                stockForSelectedSize > 0 ? (
                  isLowStock ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-soft-red)] bg-[var(--color-blush)] px-3 py-1.5 rounded-full">
                      ⚡ Low Stock — Only {stockForSelectedSize} left in size {selectedSize}!
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                      ✓ In Stock & Ready to Ship ({stockForSelectedSize} available)
                    </div>
                  )
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    ✕ Out of Stock in size {selectedSize}
                  </div>
                )
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Package size={14} className="text-[var(--color-primary-gold)]" /> Select size to view stock availability
                </div>
              )}
            </div>

            <div className="h-px bg-[var(--color-champagne)]" />

            {/* 6. Color Selection Swatches */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]">
                <span>Color: <span className="text-[var(--color-primary-gold)] font-extrabold">{selectedColor}</span></span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => handleColorChange(c.name)}
                      aria-label={`Select color ${c.name}`}
                      aria-pressed={isSelected}
                      className={`h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-[var(--color-primary-gold)] ring-offset-2 scale-110'
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {isSelected && (
                        <Check size={14} className={c.hex === '#FAF7F2' || c.hex === '#E6E6FA' ? 'text-black' : 'text-white'} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Size Selector + 8. Size Guide */}
            <div id="size-selector">
              <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]">
                <span>
                  Size
                  {selectedSize && (
                    <span className="ml-2 text-[var(--color-primary-gold)] font-bold normal-case">
                      — {selectedSize} selected
                    </span>
                  )}
                </span>
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs text-[var(--color-primary-gold)] hover:underline font-bold flex items-center gap-1"
                >
                  <Shield size={13} /> Size Guide
                </button>
              </div>

              {/* Dynamic Size Buttons for Selected Color */}
              <div className="flex flex-wrap gap-2.5" role="group" aria-label="Select a size">
                {sizeAvailability.map(({ size, isInStock }) => {
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size, isInStock)}
                      disabled={!isInStock}
                      aria-pressed={isSelected}
                      aria-disabled={!isInStock}
                      className={[
                        'relative px-4 py-2.5 text-xs font-bold rounded-xl border transition-all duration-200',
                        isSelected && isInStock
                          ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] ring-2 ring-[var(--color-primary-gold)] ring-offset-1 scale-105 shadow-gold-sm'
                          : isInStock
                          ? 'bg-white text-[var(--color-dark)] border-gray-200 hover:border-[var(--color-primary-gold)] cursor-pointer'
                          : 'bg-gray-50 text-gray-300 border-gray-150 cursor-not-allowed line-through',
                      ].join(' ')}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Inline Validation Error */}
              <AnimatePresence>
                {sizeError && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="mt-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--color-blush)] border border-[var(--color-soft-red)]/30"
                  >
                    <AlertCircle size={15} className="text-[var(--color-soft-red)] shrink-0" />
                    <span className="text-xs font-bold text-[var(--color-soft-red)]">
                      Please select your preferred size to proceed
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 9. Quantity Selector */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3.5 py-2 text-gray-600 hover:text-black transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2 text-xs font-bold min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => Math.min(stockForSelectedSize || 10, prev + 1))}
                  className="px-3.5 py-2 text-gray-600 hover:text-black transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* 10. Add to Cart & 11. Buy Now CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] hover:shadow-gold-md'
                }`}
              >
                {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                {added ? 'Added to Shopping Bag' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 border-2 border-[var(--color-dark)] text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-white"
              >
                <Zap size={16} /> Buy Now
              </button>

              {/* 12. Wishlist & Share */}
              <div className="flex gap-3">
                <button
                  onClick={handleWishlist}
                  className={`flex-1 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isWishlisted
                      ? 'border-[var(--color-soft-red)] text-[var(--color-soft-red)] bg-[var(--color-blush)]'
                      : 'border-gray-200 text-[var(--color-dark)] hover:border-[var(--color-primary-gold)]'
                  }`}
                >
                  <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
                  {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                </button>

                <button className="flex-1 py-3 rounded-xl border border-gray-200 text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider hover:border-[var(--color-primary-gold)] transition-all flex items-center justify-center gap-2">
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>

            {/* 13. Purchase Reassurance Timeline Row */}
            <div className="bg-[var(--color-warm-white)] p-4 rounded-2xl border border-[var(--color-champagne)]/60 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[var(--color-dark)]">
                <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 size={14} /> Order Today</span>
                <span>➔</span>
                <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 size={14} /> Ships in 24 Hours</span>
                <span>➔</span>
                <span className="text-[var(--color-primary-gold)]">Delivery: {getEstimatedDeliveryDate(3)}</span>
              </div>
            </div>

            {/* 14. Interactive Pincode Delivery Checker */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--color-primary-gold)]" /> Estimate Delivery Date:
              </span>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[var(--color-darker)]"
                >
                  Check
                </button>
              </form>

              {pincodeResult.searched && (
                <div className="pt-1 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Truck size={14} /> Delivery available to {pincodeResult.city} by <span className="font-bold text-black">{pincodeResult.deliveryDate}</span> (COD Available)
                </div>
              )}
            </div>

            {/* 15. Product Trust Reassurance Row */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--color-champagne)] text-center text-[10px] font-bold text-[var(--color-dark)]">
              <div className="flex flex-col items-center">
                <Truck size={18} className="text-[var(--color-primary-gold)] mb-1" />
                <span>Free Shipping</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw size={18} className="text-[var(--color-primary-gold)] mb-1" />
                <span>Easy Returns</span>
              </div>
              <div className="flex flex-col items-center">
                <Shield size={18} className="text-[var(--color-primary-gold)] mb-1" />
                <span>Quality Checked</span>
              </div>
              <div className="flex flex-col items-center">
                <Lock size={18} className="text-[var(--color-primary-gold)] mb-1" />
                <span>SSL Secure</span>
              </div>
            </div>

            {/* 16. Collapsible Information Accordions */}
            <div className="border-t border-[var(--color-champagne)] pt-4 space-y-3">

              {/* Description Accordion (Default OPEN) */}
              <div className="border-b border-gray-200 pb-3">
                <button
                  onClick={() => toggleAccordion('description')}
                  className="flex items-center justify-between w-full text-left text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]"
                >
                  <span>Description</span>
                  {openAccordions.description ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openAccordions.description && (
                  <div className="mt-3 text-xs text-gray-600 leading-relaxed font-sans">
                    <p>{product.description}</p>
                  </div>
                )}
              </div>

              {/* Material Accordion */}
              <div className="border-b border-gray-200 pb-3">
                <button
                  onClick={() => toggleAccordion('material')}
                  className="flex items-center justify-between w-full text-left text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]"
                >
                  <span>Material & Fabric</span>
                  {openAccordions.material ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openAccordions.material && (
                  <div className="mt-3 text-xs text-gray-700 font-semibold space-y-1">
                    <p>• Fabric: {product.fabric}</p>
                    <p>• Weave: Fine Breathable Weave</p>
                    <p>• Feel: Ultra-soft, hypoallergenic and gentle on sensitive skin</p>
                  </div>
                )}
              </div>

              {/* Product Details & Specifications */}
              <div className="border-b border-gray-200 pb-3">
                <button
                  onClick={() => toggleAccordion('details')}
                  className="flex items-center justify-between w-full text-left text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]"
                >
                  <span>Product Details & Fit</span>
                  {openAccordions.details ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openAccordions.details && (
                  <div className="mt-3 text-xs text-gray-700 space-y-1.5">
                    <p>• Fit Silhouette: {product.fit}</p>
                    <p>• Occasion: {product.occasion}</p>
                    <p>• Maternity Functional: {product.maternity ? 'Yes — Pregnancy Bump Ease Included' : 'Standard Silhouette'}</p>
                    <p>• Feeding Access: {product.feedingFriendly ? 'Concealed Zip Nursing Access Included' : 'N/A'}</p>
                  </div>
                )}
              </div>

              {/* Shipping Information */}
              <div className="border-b border-gray-200 pb-3">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="flex items-center justify-between w-full text-left text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]"
                >
                  <span>Shipping Information</span>
                  {openAccordions.shipping ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openAccordions.shipping && (
                  <div className="mt-3 text-xs text-gray-600 leading-relaxed">
                    <p>{product.shippingInfo}</p>
                  </div>
                )}
              </div>

              {/* Returns Policy */}
              <div className="border-b border-gray-200 pb-3">
                <button
                  onClick={() => toggleAccordion('returns')}
                  className="flex items-center justify-between w-full text-left text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]"
                >
                  <span>Returns & Exchange</span>
                  {openAccordions.returns ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openAccordions.returns && (
                  <div className="mt-3 text-xs text-gray-600 leading-relaxed">
                    <p>{product.returnPolicy}</p>
                  </div>
                )}
              </div>

              {/* Care Instructions */}
              <div>
                <button
                  onClick={() => toggleAccordion('care')}
                  className="flex items-center justify-between w-full text-left text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]"
                >
                  <span>Care Instructions</span>
                  {openAccordions.care ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openAccordions.care && (
                  <div className="mt-3 text-xs text-gray-600 leading-relaxed">
                    <p>{product.careInstructions}</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ── PRODUCT REVIEWS SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-8 border border-[var(--color-champagne)]/70 shadow-soft-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-gray-200">
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--color-dark)] mb-1">Customer Reviews & Ratings</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center text-[var(--color-primary-gold)]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={18} className="fill-[var(--color-primary-gold)]" />
                  ))}
                </div>
                <span className="text-xl font-bold text-[var(--color-dark)]">{product.rating} out of 5</span>
                <span className="text-xs text-gray-500">({product.reviewCount} Verified Customer Ratings)</span>
              </div>
            </div>

            <select
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value as any)}
              className="text-xs font-semibold border border-gray-300 rounded-xl px-4 py-2 bg-white outline-none focus:border-[var(--color-primary-gold)]"
            >
              <option value="newest">Most Recent Reviews</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>

          {/* Review List */}
          <div className="py-6 space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[var(--color-dark)]">Ananya Sharma</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Verified Buyer</span>
                </div>
                <span className="text-xs text-gray-400">August 02, 2026</span>
              </div>
              <div className="flex items-center text-[var(--color-primary-gold)] mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} className="fill-[var(--color-primary-gold)]" />
                ))}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                The fabric is incredibly soft and lightweight. There is ample room for my growing bump, and the concealed zip nursing access makes it so practical for post-delivery use as well!
              </p>
            </div>

            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[var(--color-dark)]">Meera Nair</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Verified Buyer</span>
                </div>
                <span className="text-xs text-gray-400">July 28, 2026</span>
              </div>
              <div className="flex items-center text-[var(--color-primary-gold)] mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} className="fill-[var(--color-primary-gold)]" />
                ))}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Fits perfectly! I bought size M and the measurement guide was 100% accurate. Highly recommend YEZ BEE for pregnancy wear.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-3xl p-8 border border-[var(--color-champagne)]/70 shadow-soft-sm space-y-4">
          <h2 className="font-display text-2xl font-bold text-[var(--color-dark)] mb-4 flex items-center gap-2">
            <HelpCircle size={22} className="text-[var(--color-primary-gold)]" /> Frequently Asked Questions
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <p className="font-bold text-[var(--color-dark)] mb-1">Q: How do I choose the correct maternity size?</p>
              <p className="text-gray-600">A: We recommend ordering your pre-pregnancy size. YEZ BEE maternity clothing is specially pattern-drafted with extra ease for bump growth throughout all trimesters.</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <p className="font-bold text-[var(--color-dark)] mb-1">Q: Are the feeding zippers invisible?</p>
              <p className="text-gray-600">A: Yes! Our nursing loungewear and dresses feature concealed YKK side zippers hidden within seam folds for discreet breastfeeding access.</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <p className="font-bold text-[var(--color-dark)] mb-1">Q: What is the doorstep return policy?</p>
              <p className="text-gray-600">A: We offer a 7-day hassle-free doorstep pickup return and size exchange policy on all unworn items with tags intact.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── YOU MAY ALSO LIKE (RECOMMENDATIONS) ── */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="font-display text-2xl font-bold text-[var(--color-dark)] mb-6">
            You May Also Like in {product.categoryName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                category={p.categoryName}
                price={p.price}
                comparePrice={p.compareAtPrice}
                rating={String(p.rating)}
                reviews={p.reviewCount}
                image={p.thumbnail}
                sizes={p.sizes}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── MOBILE STICKY BOTTOM PURCHASE BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-[var(--color-champagne)] flex items-center gap-3 shadow-2xl lg:hidden">
        <div className="flex-1">
          <p className="text-xs font-bold text-[var(--color-dark)] truncate">{product.name}</p>
          <p className="text-xs font-bold text-[var(--color-primary-gold)]">₹{product.price.toLocaleString('en-IN')}</p>
        </div>
        <button
          onClick={handleAddToCart}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider shrink-0"
        >
          Add to Bag
        </button>
      </div>

      {/* ── SIZE CHART MODAL ── */}
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
              role="dialog"
              aria-modal="true"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-white rounded-3xl z-50 p-6 sm:p-8 shadow-dark-lg"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b">
                <h3 className="font-display font-bold text-lg text-[var(--color-dark)]">YEZ BEE Official Size Guide</h3>
                <button onClick={() => setShowSizeChart(false)} className="p-1">
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                All measurements are in inches. Maternity styles include extra front ease for pregnancy growth.
              </p>
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2.5 font-bold">Size</th>
                    <th className="py-2.5 font-bold">Bust</th>
                    <th className="py-2.5 font-bold">Waist/Bump</th>
                    <th className="py-2.5 font-bold">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {product.sizes.map((s) => (
                    <tr key={s} className="border-b">
                      <td className="py-2.5 font-bold text-[var(--color-primary-gold)]">{s}</td>
                      <td className="py-2.5">{s === 'S' ? '34"' : s === 'M' ? '36"' : s === 'L' ? '38"' : s === 'XL' ? '40"' : '42"'}</td>
                      <td className="py-2.5">{product.maternity ? 'Expanded Bump Ease' : 'Standard Fit'}</td>
                      <td className="py-2.5">46&quot;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── FULLSCREEN IMAGE MODAL ── */}
      <AnimatePresence>
        {showFullscreenModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/90 z-50 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFullscreenModal(false)}
            />
            <motion.div
              className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-full max-w-4xl h-full max-h-[90vh] pointer-events-auto flex items-center justify-center">
                <Image
                  src={product.images[activeImageIndex] || product.thumbnail}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
                <button
                  onClick={() => setShowFullscreenModal(false)}
                  className="absolute top-4 right-4 p-3 rounded-full bg-white/20 text-white hover:bg-white hover:text-black transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
