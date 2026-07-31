'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    tagline: 'HAUTE COUTURE 2026',
    headline: 'Redefining Modern Elegance',
    subtext: 'Step into a world of timeless sophistication with our master-crafted silk sarees, designer gowns, and bespoke evening wear.',
    cta: 'Explore Collection',
    secondaryCta: 'View Lookbook',
    href: '/category/new-arrivals',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 2,
    tagline: 'ROYAL FESTIVAL EDIT',
    headline: 'Opulence in Every Thread',
    subtext: 'Handcrafted zardozi embroidery, rich royal velvets, and fluid silhouettes designed for grand celebrations.',
    cta: 'Shop Festival Edit',
    secondaryCta: 'Curated Outfits',
    href: '/category/ethnic-wear',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 3,
    tagline: 'CONTEMPORARY LUXURY',
    headline: 'Statement Tailoring & Silk Gowns',
    subtext: 'Uncompromising craftsmanship meets modern minimalism for the discerning fashion connoisseur.',
    cta: 'Shop Trending',
    secondaryCta: 'Exclusive Drops',
    href: '/category/western-wear',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop',
  },
];

const textVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative h-[90vh] min-h-[640px] max-h-[960px] w-full overflow-hidden bg-[var(--color-darker)]">
      {/* Background Image Carousel with Smooth Fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[currentSlide].id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 h-full w-full"
        >
          <Image
            src={slides[currentSlide].image}
            alt={slides[currentSlide].headline}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Multi-layered Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-darker)] via-transparent to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Container */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`hero-content-${slides[currentSlide].id}`}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {/* Gold Tagline */}
                <motion.div custom={0} variants={textVariants} className="mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
                    {slides[currentSlide].tagline}
                  </span>
                </motion.div>

                {/* Hero Headline (64px typography scale) */}
                <motion.h1
                  custom={1}
                  variants={textVariants}
                  className="mb-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[64px]"
                >
                  {slides[currentSlide].headline}
                </motion.h1>

                {/* Subtext */}
                <motion.p
                  custom={2}
                  variants={textVariants}
                  className="mb-8 max-w-lg font-sans text-base leading-relaxed text-white/80 sm:text-lg"
                >
                  {slides[currentSlide].subtext}
                </motion.p>

                {/* CTA Action Buttons */}
                <motion.div custom={3} variants={textVariants} className="flex flex-wrap gap-4 items-center">
                  <Link
                    href={slides[currentSlide].href}
                    className={cn(
                      'group inline-flex items-center gap-3 rounded-full px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300',
                      'bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)]',
                      'hover:shadow-gold-lg hover:scale-105 active:scale-95'
                    )}
                  >
                    {slides[currentSlide].cta}
                    <ChevronRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="/category/editors-pick"
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-7 py-4 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300',
                      'border border-white/40 text-white backdrop-blur-sm',
                      'hover:bg-white hover:text-[var(--color-dark)] hover:border-white'
                    )}
                  >
                    {slides[currentSlide].secondaryCta}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slide Navigation Arrow Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 rounded-full p-3.5 text-white/70 backdrop-blur-md transition-all duration-300 sm:block hover:bg-white/20 hover:text-white"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 rounded-full p-3.5 text-white/70 backdrop-blur-md transition-all duration-300 sm:block hover:bg-white/20 hover:text-white"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3 items-center">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-500',
              i === currentSlide
                ? 'w-10 bg-[var(--color-primary-gold)] shadow-gold-sm'
                : 'w-2 bg-white/40 hover:bg-white/70'
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
