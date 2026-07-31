'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';

export interface ProductCardProps {
  id: string | number;
  name: string;
  category?: string;
  price: number;
  comparePrice?: number | null;
  rating?: number | string;
  reviews?: number;
  image: string;
  hoverImage?: string;
  colors?: Array<{ name: string; hex: string }>;
  sizes?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  discount?: number;
  stock?: number;
  onQuickView?: (id: string | number) => void;
  className?: string;
}

export default function ProductCard({
  id,
  name,
  category = 'Luxury Wear',
  price,
  comparePrice,
  rating = 4.8,
  reviews = 42,
  image,
  hoverImage,
  colors = [],
  sizes = ['S', 'M', 'L', 'XL'],
  isNew = false,
  isBestSeller = false,
  discount,
  stock = 8,
  onQuickView,
  className,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isWishlisted = isInWishlist(id);
  const secondaryImage = hoverImage || image;
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  const calcDiscount = discount || (comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id,
      name,
      price,
      image,
      color: colors[selectedColor]?.name || 'Default',
      size: sizes[0] || 'M',
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id,
      name,
      price,
      image,
      category,
    });
  };

  const [imgError, setImgError] = useState(false);
  const defaultImage = '/images/luxury_featured_collection.jpg';
  const displayImage = imgError
    ? defaultImage
    : (isHovered ? secondaryImage : image) || defaultImage;

  return (
    <div
      className={cn('group relative flex flex-col h-full overflow-hidden rounded-xl bg-white transition-all duration-500 hover:shadow-gold-md hover:-translate-y-1 border border-[var(--color-champagne)]/40', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with 3:4 Luxury Portrait Aspect Ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-warm-white)]">
        <Link href={`/product/${id}`} className="block h-full w-full">
          <Image
            src={displayImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {isNew && (
            <span className="inline-block rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-dark)] text-white shadow-sm">
              New Arrival
            </span>
          )}
          {isBestSeller && (
            <span className="inline-block rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-primary-gold)] text-[var(--color-dark)] shadow-sm">
              Bestseller
            </span>
          )}
          {calcDiscount > 0 && (
            <span className="inline-block rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-soft-red)] text-white shadow-sm">
              -{calcDiscount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            'absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 shadow-sm',
            isWishlisted
              ? 'bg-[var(--color-soft-red)] text-white scale-110'
              : 'bg-white/80 text-[var(--color-dark)] hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)]'
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick View & Size Hover Bar Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full transition-transform duration-300 group-hover:translate-y-0 p-3 bg-gradient-to-t from-[var(--color-dark)]/90 via-[var(--color-dark)]/60 to-transparent flex flex-col gap-2">
          {sizes.length > 0 && (
            <div className="flex justify-center items-center gap-1.5 text-white/90 text-[11px] font-medium">
              <span className="text-white/60 mr-1">Quick Sizes:</span>
              {sizes.slice(0, 5).map((size) => (
                <span key={size} className="px-1.5 py-0.5 rounded bg-white/20 hover:bg-[var(--color-primary-gold)] hover:text-dark transition-colors">
                  {size}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(id);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/20 text-white text-xs font-semibold backdrop-blur-md hover:bg-white hover:text-[var(--color-dark)] transition-colors"
              >
                <Eye size={14} /> Quick View
              </button>
            )}
            <button
              onClick={handleAddToCart}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-300',
                addedToCart
                  ? 'bg-[var(--color-emerald)] text-white'
                  : 'bg-[var(--color-primary-gold)] text-[var(--color-dark)] hover:bg-[var(--color-gold-light)]'
              )}
            >
              {addedToCart ? (
                <>
                  <Check size={14} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={14} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="flex flex-col flex-1 p-4 bg-white">
        <div className="flex items-center justify-between text-[11px] text-[var(--color-dark)]/50 font-medium uppercase tracking-wider mb-1">
          <span>{category}</span>
          {stock <= 5 && stock > 0 && (
            <span className="text-[var(--color-soft-red)] font-semibold">Only {stock} left!</span>
          )}
        </div>

        <Link href={`/product/${id}`} className="group-hover:text-[var(--color-primary-gold)] transition-colors">
          <h3 className="font-display text-base font-semibold text-[var(--color-dark)] line-clamp-1 mb-1">
            {name}
          </h3>
        </Link>

        {/* Rating Stars & Review Count */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center text-[var(--color-primary-gold)]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={star <= Math.round(numRating) ? 'fill-[var(--color-primary-gold)] text-[var(--color-primary-gold)]' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-[var(--color-dark)]/60">
            {numRating.toFixed(1)} ({reviews})
          </span>
        </div>

        {/* Price & Color Variant Swatches */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--color-champagne)]/40">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-bold text-[var(--color-dark)]">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-[var(--color-dark)]/40 line-through">
                ₹{comparePrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {colors.length > 0 && (
            <div className="flex items-center gap-1">
              {colors.slice(0, 3).map((c, i) => (
                <button
                  key={c.name}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColor(i);
                  }}
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border border-gray-300 transition-transform',
                    selectedColor === i && 'ring-2 ring-[var(--color-primary-gold)] ring-offset-1 scale-110'
                  )}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              {colors.length > 3 && (
                <span className="text-[10px] text-[var(--color-dark)]/50 font-medium">
                  +{colors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
