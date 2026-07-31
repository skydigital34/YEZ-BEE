'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  X,
  ChevronDown,
  Heart,
  ShoppingBag,
  User,
  Instagram,
  Youtube,
  Facebook,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'New Arrivals',
    href: '/category/new-arrivals',
    children: [
      { label: 'Western Couture', href: '/category/western-wear' },
      { label: 'Ethnic Lehengas & Sarees', href: '/category/ethnic-wear' },
      { label: 'Festival Edit', href: '/category/ethnic-wear' },
      { label: 'Nightwear Luxe', href: '/category/western-wear' },
    ],
  },
  {
    label: 'Collections',
    href: '/category/ethnic-wear',
    children: [
      { label: 'Royal Zardozi Silk', href: '/category/ethnic-wear' },
      { label: 'Cocktail & Evening Gowns', href: '/category/western-wear' },
      { label: 'Structured Blazer Suits', href: '/category/western-wear' },
      { label: 'Resort & Summer Wear', href: '/category/western-wear' },
    ],
  },
  {
    label: 'Trending',
    href: '/category/trending-now',
    children: [
      { label: 'Best Sellers', href: '/category/best-sellers' },
      { label: "Editor's Choice", href: '/category/editors-pick' },
      { label: 'New This Week', href: '/category/new-arrivals' },
    ],
  },
  {
    label: 'Flash Sale (50% OFF)',
    href: '/category/sale',
    children: [
      { label: 'Up to 50% Off Gowns', href: '/category/sale' },
      { label: 'Festive Clearance', href: '/category/sale' },
    ],
  },
  {
    label: 'Jewellery & Accessories',
    href: '/category/accessories',
    children: [
      { label: 'Fine Kundan Jewellery', href: '/category/accessories' },
      { label: 'Handcrafted Clutches', href: '/category/accessories' },
      { label: 'Embellished Heels', href: '/category/accessories' },
    ],
  },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const toggleAccordion = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Side Drawer */}
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed left-0 top-0 z-50 flex h-full w-full max-w-xs sm:max-w-sm flex-col',
              'bg-[var(--color-warm-white)] shadow-2xl border-r border-[var(--color-champagne)]'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-champagne)] px-6 py-5">
              <div>
                <Link
                  href="/"
                  className="inline-block"
                  onClick={onClose}
                >
                  <Image
                    src="/images/yezbee-logo.png"
                    alt="YEZ BEE Fashion"
                    width={200}
                    height={64}
                    className="h-14 sm:h-16 w-auto object-contain"
                  />
                </Link>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-[var(--color-champagne)]/60 text-[var(--color-dark)]"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
              {navItems.filter((item) => !(isHomepage && item.href === '/')).map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleAccordion(item.label)}
                        className={cn(
                          'flex w-full items-center justify-between py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]',
                          'transition-colors hover:text-[var(--color-primary-gold)]'
                        )}
                      >
                        {item.label}
                        <ChevronDown
                          size={16}
                          className={cn(
                            'transition-transform duration-300 text-gray-400',
                            expandedItems.includes(item.label) && 'rotate-180 text-[var(--color-primary-gold)]'
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedItems.includes(item.label) && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden pl-4 space-y-1 pb-2 border-l border-[var(--color-champagne)] ml-2"
                          >
                            {item.children.map((child) => (
                              <li key={child.label}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className="block py-1.5 text-xs font-medium text-gray-600 hover:text-[var(--color-primary-gold)] transition-colors"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] hover:text-[var(--color-primary-gold)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <div className="my-4 border-t border-[var(--color-champagne)]" />

              {/* Utility Quick Links */}
              <div className="space-y-1">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center gap-3 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] hover:text-[var(--color-primary-gold)] transition-colors"
                >
                  <User size={16} /> My Account
                </Link>
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center justify-between py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] hover:text-[var(--color-primary-gold)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart size={16} /> Saved Wishlist
                  </div>
                  {wishlistCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary-gold)] text-[9px] font-bold text-[var(--color-dark)]">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-between py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] hover:text-[var(--color-primary-gold)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={16} /> Shopping Bag
                  </div>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary-gold)] text-[9px] font-bold text-[var(--color-dark)]">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Social Footer */}
            <div className="border-t border-[var(--color-champagne)] px-6 py-4 bg-white/50">
              <div className="flex items-center justify-around text-gray-400">
                <a href="#" className="hover:text-[var(--color-primary-gold)] transition-colors"><Instagram size={18} /></a>
                <a href="#" className="hover:text-[var(--color-primary-gold)] transition-colors"><Youtube size={18} /></a>
                <a href="#" className="hover:text-[var(--color-primary-gold)] transition-colors"><Facebook size={18} /></a>
                <a href="#" className="hover:text-[var(--color-primary-gold)] transition-colors"><MessageCircle size={18} /></a>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
