'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MegaMenuItem {
  label: string;
  href: string;
  columns: {
    title: string;
    links: { label: string; href: string }[];
  }[];
  featured?: {
    image: string;
    title: string;
    subtitle: string;
    cta: string;
    href: string;
  };
}

const MENU_ITEMS: MegaMenuItem[] = [
  {
    label: 'Home',
    href: '/',
    columns: [],
  },
  {
    label: 'New Arrivals',
    href: '/category/new-arrivals',
    columns: [
      {
        title: 'Haute Couture Drops',
        links: [
          { label: 'Zardozi Lehengas', href: '/category/ethnic-wear' },
          { label: 'Silk Evening Gowns', href: '/category/western-wear' },
          { label: 'Structured Blazer Sets', href: '/category/western-wear' },
          { label: 'Banarasi Sarees', href: '/category/ethnic-wear' },
        ],
      },
      {
        title: 'Curated Collections',
        links: [
          { label: 'Royal Festival Edit', href: '/category/ethnic-wear' },
          { label: 'Cocktail & Party Wear', href: '/category/western-wear' },
          { label: "Editor's Runway Choice", href: '/category/editors-pick' },
          { label: 'Flash Sale (50% OFF)', href: '/category/sale' },
        ],
      },
    ],
    featured: {
      image: '/images/luxury_featured_collection.jpg',
      title: 'The Royal Festival Edit',
      subtitle: 'Hand-woven zardozi embroideries & royal silks',
      cta: 'Explore Edit',
      href: '/category/ethnic-wear',
    },
  },
  {
    label: 'Ethnic Luxe',
    href: '/category/ethnic-wear',
    columns: [
      {
        title: 'Traditional Couture',
        links: [
          { label: 'Bridal Lehengas', href: '/category/ethnic-wear' },
          { label: 'Pure Silk Sarees', href: '/category/ethnic-wear' },
          { label: 'Anarkali Suits', href: '/category/ethnic-wear' },
          { label: 'Embroidered Kurtas', href: '/category/ethnic-wear' },
        ],
      },
      {
        title: 'Occasions',
        links: [
          { label: 'Sangeet & Mehendi', href: '/category/ethnic-wear' },
          { label: 'Wedding Reception', href: '/category/ethnic-wear' },
          { label: 'Festive Celebrations', href: '/category/ethnic-wear' },
        ],
      },
    ],
    featured: {
      image: '/images/ethnic_luxe.jpg',
      title: 'Handcrafted Heritage',
      subtitle: 'Made by 500+ master artisans',
      cta: 'View Heritage',
      href: '/category/ethnic-wear',
    },
  },
  {
    label: 'Western Chic',
    href: '/category/western-wear',
    columns: [
      {
        title: 'Modern Silhouettes',
        links: [
          { label: 'Sequin Evening Gowns', href: '/category/western-wear' },
          { label: 'Structured Blazers', href: '/category/western-wear' },
          { label: 'Satin Corset Tops', href: '/category/western-wear' },
          { label: 'Co-ord Trouser Sets', href: '/category/western-wear' },
        ],
      },
      {
        title: 'Trending Styles',
        links: [
          { label: 'Power Tailoring 2026', href: '/category/western-wear' },
          { label: 'Red Carpet Glamour', href: '/category/western-wear' },
          { label: 'Resort & Summer Luxe', href: '/category/western-wear' },
        ],
      },
    ],
    featured: {
      image: '/images/western_chic.jpg',
      title: 'Power Tailoring',
      subtitle: 'Italian wool blazers & satin separates',
      cta: 'Shop Western',
      href: '/category/western-wear',
    },
  },
  {
    label: 'Jewellery & Accessories',
    href: '/category/accessories',
    columns: [
      {
        title: 'Fine Jewellery',
        links: [
          { label: 'Kundan & Polki Sets', href: '/category/accessories' },
          { label: 'Statement Chokers', href: '/category/accessories' },
          { label: 'Pearl Earrings', href: '/category/accessories' },
        ],
      },
      {
        title: 'Luxury Bags',
        links: [
          { label: 'Italian Leather Clutches', href: '/category/accessories' },
          { label: 'Embellished Evening Bags', href: '/category/accessories' },
          { label: 'Silk Potlis', href: '/category/accessories' },
        ],
      },
    ],
    featured: {
      image: '/images/haute_accessories.jpg',
      title: 'Haute Accessories',
      subtitle: 'Artisanal finishing touches',
      cta: 'Explore Accessories',
      href: '/category/accessories',
    },
  },
  {
    label: 'Sale',
    href: '/category/sale',
    columns: [
      {
        title: 'Exclusive Deals',
        links: [
          { label: 'Flat 50% OFF Flash Sale', href: '/category/sale' },
          { label: 'Clearance Couture', href: '/category/sale' },
          { label: 'Special Festive Offers', href: '/category/sale' },
        ],
      },
    ],
    featured: {
      image: '/images/flash_sale.jpg',
      title: 'Flash Sale Live',
      subtitle: 'Up to 50% off on haute couture',
      cta: 'Grab Offers',
      href: '/category/sale',
    },
  },
];

interface MegaMenuProps {
  scrolled: boolean;
  onActiveChange?: (active: boolean) => void;
}

export function MegaMenu({ scrolled, onActiveChange }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
    if (onActiveChange) onActiveChange(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
      if (onActiveChange) onActiveChange(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const activeItem = MENU_ITEMS.find((item) => item.label === activeMenu);

  return (
    <nav
      className="hidden lg:flex items-center"
      onMouseLeave={handleMouseLeave}
      role="navigation"
      aria-label="Main navigation"
    >
      <ul className="flex items-center gap-1">
        {MENU_ITEMS.filter((item) => !(isHomepage && item.href === '/')).map((item) => (
          <li
            key={item.label}
            className="relative py-1"
            onMouseEnter={() => handleMouseEnter(item.label)}
          >
            <Link
              href={item.href}
              className={cn(
                'relative px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-200',
                scrolled
                  ? 'text-[var(--color-dark)] hover:text-[var(--color-primary-gold)]'
                  : 'text-white hover:text-[var(--color-gold-light)]',
                activeMenu === item.label && 'text-[var(--color-primary-gold)] font-extrabold'
              )}
            >
              {item.label}
              <span
                className={cn(
                  'absolute bottom-0 left-3 right-3 h-[2px] origin-left scale-x-0 transition-transform duration-300',
                  'bg-[var(--color-primary-gold)]',
                  activeMenu === item.label && 'scale-x-100'
                )}
              />
            </Link>
          </li>
        ))}
      </ul>

      {/* Full-Width Solid Opaque Dropdown Container */}
      <AnimatePresence>
        {activeItem && activeItem.columns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-0 right-0 top-full z-50 w-full bg-[#0D0D0D] border-b border-[var(--color-primary-gold)]/40 shadow-2xl text-white overflow-hidden"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="mx-auto max-w-7xl px-8 py-6">
              <div className="grid grid-cols-12 gap-8 items-center">
                {/* Category Links Columns */}
                <div className="col-span-8 grid grid-cols-2 gap-8">
                  {activeItem.columns.map((col) => (
                    <div key={col.title}>
                      <div className="flex items-center gap-2 mb-3 pb-1.5 border-b border-[var(--color-primary-gold)]/30">
                        <Sparkles size={12} className="text-[var(--color-primary-gold)]" />
                        <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-gold-light)]">
                          {col.title}
                        </h4>
                      </div>
                      <ul className="space-y-1.5">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              href={link.href}
                              onClick={() => {
                                setActiveMenu(null);
                                if (onActiveChange) onActiveChange(false);
                              }}
                              className="group flex items-center justify-between text-xs font-medium text-white/90 hover:text-[var(--color-primary-gold)] transition-all py-1 px-2.5 rounded-lg hover:bg-white/10"
                            >
                              <span>{link.label}</span>
                              <ChevronRight
                                size={12}
                                className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-[var(--color-primary-gold)]"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Featured Lookbook Card */}
                {activeItem.featured && (
                  <div className="col-span-4 relative overflow-hidden rounded-2xl border border-[var(--color-primary-gold)]/40 h-[175px] group shadow-gold-sm">
                    <Image
                      src={activeItem.featured.image}
                      alt={activeItem.featured.title}
                      fill
                      sizes="350px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                    <div className="relative z-10 p-4 flex flex-col justify-end h-full">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold-light)] mb-0.5">
                        FEATURED COLLECTION
                      </span>
                      <h3 className="font-display text-sm font-bold text-white mb-0.5">
                        {activeItem.featured.title}
                      </h3>
                      <p className="text-[11px] text-white/70 mb-2 line-clamp-1">
                        {activeItem.featured.subtitle}
                      </p>
                      <Link
                        href={activeItem.featured.href}
                        onClick={() => {
                          setActiveMenu(null);
                          if (onActiveChange) onActiveChange(false);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary-gold)] hover:text-[var(--color-gold-light)] transition-colors"
                      >
                        {activeItem.featured.cta} <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
