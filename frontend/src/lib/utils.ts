import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  if (!showSymbol) return formatted;
  return formatted;
}

export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat('en-IN', options).format(d);
}

export function formatDateShort(date: Date | string | number): string {
  return formatDate(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateRelative(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(date);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength).trimEnd();
  return `${truncated}...`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

export function generateId(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function getInitials(name: string, maxLetters: number = 2): string {
  if (!name.trim()) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, maxLetters).toUpperCase();
  }

  return parts
    .slice(0, maxLetters)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export function getImageUrl(
  path: string | null | undefined,
  size?: 'sm' | 'md' | 'lg'
): string {
  if (!path || typeof path !== 'string' || path.trim() === '') return '/images/categories/maternity-kurtis.jpg';
  if (path.startsWith('http') || path.startsWith('/')) return path;

  const sizes = { sm: '150x150', md: '400x400', lg: '800x800' };
  const dimension = size ? sizes[size] : 'original';
  return `${process.env.NEXT_PUBLIC_IMAGE_URL || ''}/uploads/${dimension}/${path}`;
}

export function getSafeImageUrl(
  url?: any,
  fallback: string = '/images/categories/maternity-kurtis.jpg'
): string {
  if (!url) return fallback;

  // Extract string if passed an object { secure_url, url, publicId, public_id }
  let raw: any = url;
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.secure_url || raw.url || raw.publicId || raw.public_id || fallback;
  }

  if (typeof raw !== 'string' || !raw.trim()) {
    return fallback;
  }

  let trimmed = raw.trim();

  // Revoked blob URLs from previous page sessions cannot be loaded; use fallback
  if (trimmed.startsWith('blob:')) {
    return fallback;
  }

  // If http://res.cloudinary.com or http://*.cloudinary.com, upgrade to https://
  if (trimmed.startsWith('http://') && trimmed.includes('cloudinary.com')) {
    trimmed = trimmed.replace('http://', 'https://');
  }

  // If it's a Cloudinary public ID without protocol or slash prefix
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('blob:') &&
    !trimmed.startsWith('data:')
  ) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'smpyi8aw';
    trimmed = `https://res.cloudinary.com/${cloudName}/image/upload/${trimmed}`;
  }

  return trimmed;
}

export function getSafeProductImage(
  input: any,
  index: number = 0,
  fallback: string = '/images/categories/maternity-kurtis.jpg'
): string {
  if (!input) return fallback;

  // Case 1: Input is a Product object
  if (typeof input === 'object' && !Array.isArray(input)) {
    const imagesArray = Array.isArray(input.images)
      ? input.images
      : Array.isArray(input.galleryImages)
      ? input.galleryImages
      : [];

    if (imagesArray.length > index) {
      return getSafeImageUrl(imagesArray[index], fallback);
    }

    if (input.thumbnail) {
      return getSafeImageUrl(input.thumbnail, fallback);
    }

    if (imagesArray.length > 0) {
      return getSafeImageUrl(imagesArray[0], fallback);
    }

    return fallback;
  }

  // Case 2: Input is an Array
  if (Array.isArray(input)) {
    if (input.length > index) {
      return getSafeImageUrl(input[index], fallback);
    }
    if (input.length > 0) {
      return getSafeImageUrl(input[0], fallback);
    }
    return fallback;
  }

  // Case 3: Input is a string or object URL
  return getSafeImageUrl(input, fallback);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i);
}
