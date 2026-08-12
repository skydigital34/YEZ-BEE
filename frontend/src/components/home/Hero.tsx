'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    eyebrow: 'CASUALS & FEEDING',
    heading: 'Comfort That Celebrates Every Curve',
    description: 'Thoughtfully designed casual kurtis and feeding dresses that keep you comfortable, confident and effortlessly stylish.',
    mobileDescription: 'Thoughtful casual kurtis designed for comfort and style.',
    primaryCta: 'SHOP CASUALS FEEDING',
    primaryHref: '/category/casuals/feeding',
    secondaryCta: 'EXPLORE ALL CASUALS',
    secondaryHref: '/category/casuals',
    image: '/images/maternity/slide1.jpg',
    alt: 'Woman wearing an elegant YEZ BEE casual feeding dress',
    align: 'left',
  },
  {
    id: 2,
    eyebrow: 'LOUNGE WEAR COLLECTION',
    heading: 'Made For Your Everyday Relaxation',
    description: 'Soft pure cotton loungewear, night suits and relaxed feeding lounge sets.',
    mobileDescription: 'Soft pure cotton loungewear and feeding night suits.',
    primaryCta: 'SHOP LOUNGE WEAR',
    primaryHref: '/category/lounge-wear',
    secondaryCta: null,
    secondaryHref: null,
    image: '/images/maternity/slide2.jpg',
    alt: 'Woman in comfortable YEZ BEE lounge wear',
    align: 'right',
  },
  {
    id: 3,
    eyebrow: 'PARTY WEAR COLLECTION',
    heading: 'Beautiful Moments Deserve Beautiful Dresses',
    description: 'Elegant party gowns and festive dresses designed to make every celebration feel special.',
    mobileDescription: 'Elegant party gowns designed for celebrations.',
    primaryCta: 'SHOP PARTY WEAR',
    primaryHref: '/category/party-wear',
    secondaryCta: null,
    secondaryHref: null,
    image: '/images/maternity/slide3.jpg',
    alt: 'Woman wearing an opulent YEZ BEE party gown',
    align: 'left',
  },
  {
    id: 4,
    eyebrow: 'PEPLUM TOPS',
    heading: 'Designed For You. Made To Move With You.',
    description: 'Discover flattering peplum tops and tunics created for style and comfort.',
    mobileDescription: 'Flattering peplum tunics created for style and comfort.',
    primaryCta: 'EXPLORE PEPLUM TOPS',
    primaryHref: '/category/peplum-tops',
    secondaryCta: null,
    secondaryHref: null,
    image: '/images/maternity/slide4.jpg',
    alt: 'Stylish woman wearing a modern YEZ BEE peplum top',
    align: 'right',
  },
];

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  const slide = slides[currentSlide];

  return (
    <section
      className="relative h-[580px] sm:h-[650px] lg:h-[720px] w-full overflow-hidden bg-black text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Maternity Dress Campaign"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority
            loading="eager"
            sizes="100vw"
            className="object-cover object-center sm:object-[center_20%]"
          />

          <div
            className={cn(
              'absolute inset-0 z-10',
              slide.align === 'left'
                ? 'bg-gradient-to-r from-black/90 via-black/60 to-transparent'
                : 'bg-gradient-to-l from-black/90 via-black/60 to-transparent'
            )}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/30 sm:hidden" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center">
          <div
            className={cn(
              'w-full max-w-2xl',
              slide.align === 'right' ? 'ml-auto text-left' : 'text-left'
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col items-start"
              >
                <motion.div custom={0} variants={textVariants} className="inline-flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold-light)]">
                    {slide.eyebrow}
                  </span>
                </motion.div>

                <motion.h1
                  custom={1}
                  variants={textVariants}
                  className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] mb-4"
                >
                  {slide.heading}
                </motion.h1>

                <motion.p
                  custom={2}
                  variants={textVariants}
                  className="text-sm sm:text-base lg:text-lg text-white/80 font-sans leading-relaxed mb-8 max-w-xl"
                >
                  <span className="hidden sm:inline">{slide.description}</span>
                  <span className="sm:hidden">{slide.mobileDescription}</span>
                </motion.p>

                <motion.div custom={3} variants={textVariants} className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link
                    href={slide.primaryHref}
                    className={cn(
                      'group inline-flex items-center gap-2.5 rounded-full px-7 sm:px-8 py-3.5 sm:py-4 text-xs font-bold uppercase tracking-[0.16em] transition-all duration-300 min-h-[44px]',
                      'bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)]',
                      'hover:shadow-gold-md hover:scale-105 active:scale-95'
                    )}
                  >
                    {slide.primaryCta}
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>

                  {slide.secondaryCta && (
                    <Link
                      href={slide.secondaryHref!}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-6 sm:px-7 py-3.5 sm:py-4 text-xs font-bold uppercase tracking-[0.16em] transition-all duration-300 min-h-[44px]',
                        'border border-white/40 text-white backdrop-blur-sm',
                        'hover:bg-white hover:text-[var(--color-dark)] hover:border-white'
                      )}
                    >
                      {slide.secondaryCta}
                    </Link>
                  )}
                </motion.div>

                <motion.div custom={4} variants={textVariants} className="mt-8 pt-4 border-t border-white/15 flex items-center gap-2 text-[11px] text-white/60 font-medium">
                  <HeartHandshake size={14} className="text-[var(--color-primary-gold)] shrink-0" />
                  <span>Comfort-first silhouettes • Easy movement • Thoughtful fits</span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Prev / Next Slide Controls */}
      <button
        type="button"
        onClick={prevSlide}
        suppressHydrationWarning
        className="absolute left-4 sm:left-6 top-1/2 z-20 -translate-y-1/2 rounded-full p-3 text-white/70 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:text-white cursor-pointer"
        aria-label="Previous maternity slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        suppressHydrationWarning
        className="absolute right-4 sm:right-6 top-1/2 z-20 -translate-y-1/2 rounded-full p-3 text-white/70 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:text-white cursor-pointer"
        aria-label="Next maternity slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Indicators & Counter */}
      <div className="absolute bottom-6 left-4 sm:left-8 z-20 flex items-center gap-4">
        <span className="font-mono text-xs font-bold text-white/80 tracking-wider">
          0{currentSlide + 1} <span className="text-white/40">/</span> 0{slides.length}
        </span>
        <div className="flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              suppressHydrationWarning
              className={cn(
                'h-2 rounded-full transition-all duration-300 cursor-pointer',
                currentSlide === idx
                  ? 'w-6 bg-[var(--color-primary-gold)]'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              )}
              aria-label={`Go to slide ${idx + 1}`}
              aria-pressed={currentSlide === idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
