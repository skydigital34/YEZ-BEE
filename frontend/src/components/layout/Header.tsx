'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { SearchModal } from './SearchModal';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const pathname = usePathname();

  const isHomepage = pathname === '/';
  const isSolidHeader = !isHomepage || scrolled || menuActive;

  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 left-0 right-0 z-40 transition-all duration-500',
          isSolidHeader
            ? 'bg-white/95 backdrop-blur-xl shadow-soft-lg border-b border-[var(--color-champagne)]/80 py-1'
            : 'bg-gradient-to-b from-black/90 via-black/55 to-transparent backdrop-blur-[3px] border-b border-[var(--color-primary-gold)]/20 py-1.5'
        )}
      >
        <div className="mx-auto flex min-h-[52px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Official Image Logo Branding */}
          <div className="flex items-center">
            <Link href="/" className="shrink-0 group flex items-center">
              <Image
                src="/images/yezbee-logo.png"
                alt="YEZ BEE Fashion"
                width={220}
                height={70}
                priority
                className="h-12 sm:h-14 lg:h-16 max-h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Mega Navigation Shifted Right */}
            <div className="ml-8 lg:ml-16 xl:ml-24">
              <MegaMenu scrolled={isSolidHeader} onActiveChange={setMenuActive} />
            </div>
          </div>

          {/* Action Icon Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                'rounded-full p-2 transition-all duration-300 hover:scale-105',
                isSolidHeader
                  ? 'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]/50'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Search Catalogue"
            >
              <Search size={18} />
            </button>

            <Link
              href="/wishlist"
              className={cn(
                'relative hidden rounded-full p-2 transition-all duration-300 hover:scale-105 sm:block',
                isSolidHeader
                  ? 'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]/50'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Saved Wishlist"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary-gold)] text-[9px] font-bold text-[var(--color-dark)] shadow-gold-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className={cn(
                'relative rounded-full p-2 transition-all duration-300 hover:scale-105',
                isSolidHeader
                  ? 'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]/50'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary-gold)] text-[9px] font-bold text-[var(--color-dark)] shadow-gold-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              className={cn(
                'hidden rounded-full p-2 transition-all duration-300 hover:scale-105 sm:block',
                isSolidHeader
                  ? 'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]/50'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="User Account"
            >
              <User size={18} />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className={cn(
                'rounded-full p-2 transition-all duration-300 lg:hidden',
                isSolidHeader
                  ? 'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]/50'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
