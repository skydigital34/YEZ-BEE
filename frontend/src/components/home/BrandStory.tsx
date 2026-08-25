'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BrandStory() {
  return (
    <section className="py-20 sm:py-28 bg-[var(--color-cream)] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none overflow-hidden rounded-2xl shadow-soft-xl">
              <Image
                src="/images/hero/hero2.png"
                alt="YEZ BEE Heritage Craftsmanship"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-gold-light)] block mb-1">
                  ESTABLISHED 2024
                </span>
                <p className="font-display text-xl font-semibold italic">
                  &ldquo;Preserving comfort and elegance through thoughtful maternity & everyday fashion.&rdquo;
                </p>
              </div>
            </div>

            <div className="hidden sm:block absolute -bottom-8 -right-4 w-52 h-64 overflow-hidden rounded-xl shadow-gold-lg border-2 border-white">
              <Image
                src="/images/hero/hero1.png"
                alt="Artisan Detail"
                fill
                sizes="200px"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2">
              <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
                HAUTE COUTURE HERITAGE
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-dark)] leading-tight">
              Crafting Timeless Elegance for the Modern Connoisseur
            </h2>

            <div className="h-0.5 w-16 bg-[var(--color-primary-gold)]" />

            <div className="space-y-4 font-sans text-sm sm:text-base text-[var(--color-dark)]/75 leading-relaxed">
              <p>
                YEZ BEE Fashion was founded on a singular philosophy: to bridge the gap between ancient royal Indian textile mastery and contemporary global fashion statements.
              </p>
              <p>
                Every hand-woven saree, bespoke zardozi lehenga, and tailored velvet gown is crafted by master artisans with decades of inherited expertise. We source only pure mulberry silk, organic linens, and ethically harvested embellishments.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-[var(--color-champagne)]">
              <div>
                <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-primary-gold)] block">
                  500+
                </span>
                <span className="text-[11px] font-medium text-[var(--color-dark)]/60 uppercase tracking-wider">
                  Master Artisans
                </span>
              </div>
              <div>
                <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-primary-gold)] block">
                  100%
                </span>
                <span className="text-[11px] font-medium text-[var(--color-dark)]/60 uppercase tracking-wider">
                  Pure Silk & Fabrics
                </span>
              </div>
              <div>
                <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-primary-gold)] block">
                  50k+
                </span>
                <span className="text-[11px] font-medium text-[var(--color-dark)]/60 uppercase tracking-wider">
                  Patrons Globally
                </span>
              </div>
            </div>

            <div>
              <Link
                href="/about"
                className={cn(
                  'inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-dark)] transition-all',
                  'hover:text-[var(--color-primary-gold)] group'
                )}
              >
                Discover Our Artisanal Atelier
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
