'use client'

import { motion } from 'framer-motion'
import Hero from '@/components/home/Hero'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import FeaturedCollections from '@/components/home/FeaturedCollections'
import NewArrivals from '@/components/home/NewArrivals'
import FlashSale from '@/components/home/FlashSale'
import TrendingSection from '@/components/home/TrendingSection'
import BestSellers from '@/components/home/BestSellers'
import BrandStory from '@/components/home/BrandStory'
import EditorsPick from '@/components/home/EditorsPick'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import Testimonials from '@/components/home/Testimonials'
import InstagramFeed from '@/components/home/InstagramFeed'
import Newsletter from '@/components/home/Newsletter'
import StatsSection from '@/components/home/StatsSection'
import TrustBadges from '@/components/home/TrustBadges'

const fadeIn = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.7, ease: 'easeOut' },
}

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Hero />
      <motion.div {...fadeIn}>
        <FeaturedCollections />
      </motion.div>
      <motion.div {...fadeIn}>
        <NewArrivals />
      </motion.div>
      <motion.div {...fadeIn}>
        <FlashSale />
      </motion.div>
      <motion.div {...fadeIn}>
        <TrendingSection />
      </motion.div>
      <motion.div {...fadeIn}>
        <BestSellers />
      </motion.div>
      <motion.div {...fadeIn}>
        <BrandStory />
      </motion.div>
      <motion.div {...fadeIn}>
        <EditorsPick />
      </motion.div>
      <motion.div {...fadeIn}>
        <WhyChooseUs />
      </motion.div>
      <motion.div {...fadeIn}>
        <Testimonials />
      </motion.div>
      <motion.div {...fadeIn}>
        <InstagramFeed />
      </motion.div>
      <motion.div {...fadeIn}>
        <Newsletter />
      </motion.div>
      <motion.div {...fadeIn}>
        <StatsSection />
      </motion.div>
      <TrustBadges />
    </>
  )
}
