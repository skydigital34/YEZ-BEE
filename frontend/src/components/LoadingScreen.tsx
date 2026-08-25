'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setIsLoading(false), 500)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)

    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF7F2]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold text-[#1A1A1A] tracking-[0.15em]">
              YEZ
              <span className="text-[#C9A84C]"> BEE</span>
            </h1>
            <p className="font-sans text-[10px] md:text-xs text-[#9C9380] tracking-[0.5em] mt-2 uppercase">
              Fashion
            </p>
          </motion.div>

          <div className="mt-12 w-48 md:w-64 h-[2px] bg-[#E8E4DC] overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-[#C9A84C] via-[#E8D48B] to-[#C9A84C] rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <p className="mt-4 font-sans text-xs text-[#B8B0A0] tracking-[0.2em] uppercase">
            {Math.min(Math.floor(progress), 100)}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
