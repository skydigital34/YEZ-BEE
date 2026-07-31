'use client';

import { Instagram } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const INSTA_POSTS = [
  {
    id: 1,
    image: '/images/luxury_featured_collection.jpg',
    tag: '#YEZBEELookbook',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600&auto=format&fit=crop',
    tag: '#HauteCouture',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    tag: '#FestivalGlam',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=600&auto=format&fit=crop',
    tag: '#PowerDressing',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
    tag: '#SilkElegance',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    tag: '#FineJewellery',
  },
];

export default function InstagramFeed() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <Instagram size={16} className="text-[var(--color-primary-gold)]" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
            @YEZBEEFASHION
          </span>
        </div>
        <h2 className="font-display text-3xl font-bold text-[var(--color-dark)] sm:text-4xl">
          Follow Our Instagram Atelier
        </h2>
        <p className="text-sm text-[var(--color-dark)]/60 mt-2">
          Tag #YEZBEELookbook to be featured in our seasonal magazine
        </p>
      </div>

      {/* 6-Photo Editorial Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 px-2">
        {INSTA_POSTS.map((post) => (
          <a
            key={post.id}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square overflow-hidden bg-gray-100 rounded-lg"
          >
            <Image
              src={post.image}
              alt={post.tag}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/50 flex flex-col items-center justify-center p-3 text-center">
              <Instagram
                size={24}
                className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
              />
              <span className="text-[10px] font-bold text-[var(--color-gold-light)] opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2 uppercase tracking-wider">
                {post.tag}
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-xs font-bold uppercase tracking-[0.15em] border border-[var(--color-primary-gold)] text-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] transition-all shadow-sm"
        >
          <Instagram size={16} /> Follow Us On Instagram
        </a>
      </div>
    </section>
  );
}
