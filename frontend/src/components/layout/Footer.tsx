import Link from 'next/link';
import Image from 'next/image';
import {
  Instagram,
  Youtube,
  Facebook,
  MessageCircle,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { FaPinterestP as Pinterest } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const footerColumns = [
  {
    title: 'Shop',
    links: [
      { label: 'New Arrivals', href: '/category/new-arrivals' },
      { label: 'Western Wear', href: '/category/western-wear' },
      { label: 'Ethnic Wear', href: '/category/ethnic-wear' },
      { label: 'Active Wear', href: '/category/active-wear' },
      { label: 'Accessories', href: '/category/accessories' },
      { label: 'Sale', href: '/category/sale' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' },
      { label: 'Sustainability', href: '/sustainability' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns & Exchanges', href: '/returns' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'Track Order', href: '/track-order' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Refund Policy', href: '/refund' },
    ],
  },
];

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Pinterest, href: '#', label: 'Pinterest' },
  { icon: MessageCircle, href: '#', label: 'WhatsApp' },
];

const paymentMethods = [
  { name: 'Visa', gradient: 'from-blue-700 to-blue-500' },
  { name: 'Mastercard', gradient: 'from-orange-600 to-red-500' },
  { name: 'UPI', gradient: 'from-green-700 to-green-500' },
  { name: 'COD', gradient: 'from-purple-700 to-purple-500' },
  { name: 'Razorpay', gradient: 'from-blue-600 to-cyan-500' },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <div className="mb-4">
                <Link href="/" className="inline-block">
                  <Image
                    src="/images/yezbee-logo.png"
                    alt="YEZ BEE Fashion"
                    width={240}
                    height={80}
                    className="h-16 sm:h-20 w-auto object-contain brightness-0 invert"
                  />
                </Link>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-white/60">
                India&apos;s premier luxury fashion destination. Curating
                elegance, celebrating individuality — because you deserve
                nothing less than extraordinary.
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200',
                      'border border-white/10 text-white/50 hover:border-[var(--color-primary-gold)] hover:text-[var(--color-primary-gold)]'
                    )}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-gold)]">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
                      >
                        {link.label}
                        <ChevronRight
                          size={12}
                          className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 py-10">
          <div className="mb-6">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-gold)]">
              Join the Community
            </h4>
            <div className="flex max-w-md gap-3">
              <div className="relative flex-1">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={cn(
                    'w-full rounded-full border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white',
                    'placeholder:text-white/30 outline-none transition-colors focus:border-[var(--color-primary-gold)]'
                  )}
                  aria-label="Email for newsletter"
                />
              </div>
              <button
                className={cn(
                  'rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-200',
                  'bg-[var(--color-primary-gold)] text-[var(--color-dark)]',
                  'hover:bg-[var(--color-gold-light)]'
                )}
              >
                Subscribe
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-gold)]">
              We Accept
            </h4>
            <div className="flex flex-wrap gap-3">
              {paymentMethods.map((method) => (
                <span
                  key={method.name}
                  className={cn(
                    'rounded-lg px-4 py-2 text-xs font-medium text-white',
                    `bg-gradient-to-r ${method.gradient}`
                  )}
                >
                  {method.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} YEZ BEE Fashion. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <Link href="/privacy" className="hover:text-white/60">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white/60">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-white/60">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
