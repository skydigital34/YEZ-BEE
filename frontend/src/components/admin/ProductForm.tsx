'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Layers,
  Tag,
  Shield,
  HelpCircle,
  X,
  Check,
  Grid,
  Link as LinkIcon,
  RefreshCw,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Search,
  ChevronRight,
} from 'lucide-react';
import { YEZBEE_CATEGORIES } from '@/data/categories';
import { slugify, saveOrUpdateProduct } from '@/data/products';
import { api } from '@/lib/api';
import { getSafeImageUrl } from '@/lib/utils';
import ProductPreviewModal, { ProductPreviewData } from './ProductPreviewModal';

const PRESET_COLORS = [
  { name: 'Peach Floral', hex: '#FFDAB9' },
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Sage Green', hex: '#8FBC8F' },
  { name: 'Blush Pink', hex: '#FFB6C1' },
  { name: 'Wine Red', hex: '#800000' },
  { name: 'Teal Blue', hex: '#008080' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Indigo Blue', hex: '#3F51B5' },
  { name: 'Mustard Yellow', hex: '#FFC107' },
  { name: 'Coral Pink', hex: '#FF6F61' },
  { name: 'Emerald Green', hex: '#046307' },
  { name: 'Midnight Black', hex: '#1A1A1A' },
];

const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const KIDS_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'];

export interface FormVariant {
  id: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
}

export interface FormImage {
  id: string;
  url: string;
  publicId?: string;
  alt?: string;
  isPrimary: boolean;
  colorAssigned?: string;
  uploading?: boolean;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  initialData?: any;
}

export default function ProductForm({ mode, productId, initialData }: ProductFormProps) {
  const router = useRouter();

  // Active Section Tab
  const [activeTab, setActiveTab] = useState<
    'basic' | 'category' | 'description' | 'pricing' | 'colors' | 'sizes' | 'variants' | 'images' | 'seo'
  >('basic');

  // Categories list from backend or fallback
  const [categoriesList, setCategoriesList] = useState<any[]>(YEZBEE_CATEGORIES);

  // 1. BASIC INFORMATION
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [brand, setBrand] = useState('YEZ BEE');
  const [tagsInput, setTagsInput] = useState('casuals, feeding, cotton');

  // 2. CATEGORY
  const [selectedCategory, setSelectedCategory] = useState('casuals');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [productType, setProductType] = useState<'FEEDING' | 'NON-FEEDING' | null>('FEEDING');
  const [subcategory, setSubcategory] = useState('Feeding');

  // 3. DESCRIPTION & ATTRIBUTES
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [fabric, setFabric] = useState('100% Pure Cotton');
  const [fit, setFit] = useState('Relaxed Fit');
  const [pattern, setPattern] = useState('Printed');
  const [occasion, setOccasion] = useState('Casual Wear');
  const [careInstructions, setCareInstructions] = useState('Hand wash cold with gentle detergent');
  const [highlights, setHighlights] = useState<string[]>([
    'Dual vertical concealed feeding zips for discrete nursing',
    'Breathable soft pure cotton fabric for max comfort',
  ]);
  const [newHighlight, setNewHighlight] = useState('');

  // 4. PRICING
  const [price, setPrice] = useState<number | ''>(1899);
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>(2499);
  const [costPrice, setCostPrice] = useState<number | ''>(950);

  // 5. COLORS
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    PRESET_COLORS[0],
    PRESET_COLORS[1],
  ]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#C9A84C');

  // 6. SIZES
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);

  // 7 & 8. VARIANTS & INVENTORY
  const [variants, setVariants] = useState<FormVariant[]>([
    {
      id: 'v1',
      sku: 'YZB-CAS-PCH-S',
      color: 'Peach Floral',
      colorHex: '#FFDAB9',
      size: 'S',
      price: 1899,
      compareAtPrice: 2499,
      stock: 10,
      lowStockThreshold: 5,
      isActive: true,
    },
    {
      id: 'v2',
      sku: 'YZB-CAS-PCH-M',
      color: 'Peach Floral',
      colorHex: '#FFDAB9',
      size: 'M',
      price: 1899,
      compareAtPrice: 2499,
      stock: 15,
      lowStockThreshold: 5,
      isActive: true,
    },
  ]);

  // 9, 10, 11. IMAGES & UX
  const [images, setImages] = useState<FormImage[]>([
    {
      id: 'img1',
      url: '/images/categories/maternity-kurtis.jpg',
      alt: 'Peach Floral Feeding Kurti Front',
      isPrimary: true,
      colorAssigned: 'Peach Floral',
    },
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // 12. SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Status & Flags
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [newArrival, setNewArrival] = useState(true);

  // Preview & Validation
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fetch categories dynamically from Backend API on mount
  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setCategoriesList(res.data);
          const firstCat = res.data[0];
          if (firstCat) {
            setSelectedCategory(firstCat.slug);
            setSelectedCategoryId(firstCat._id || firstCat.id);
            if (firstCat.hasFeedingSplit) setProductType('FEEDING');
            else setProductType(null);
          }
        }
      })
      .catch(() => {
        // Fallback to static YEZBEE_CATEGORIES taxonomy
        setCategoriesList(YEZBEE_CATEGORIES);
      });
  }, []);

  // Populate data if in Edit Mode or initialData provided
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || slugify(initialData.name || ''));
      setBrand(initialData.brand || 'YEZ BEE');
      if (initialData.tags) {
        setTagsInput(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags);
      }
      if (initialData.category) {
        const catSlug = typeof initialData.category === 'object' ? initialData.category.slug : initialData.category;
        setSelectedCategory(catSlug);
        setSelectedCategoryId(typeof initialData.category === 'object' ? initialData.category._id : '');
      }
      setProductType(initialData.productType || null);
      setShortDescription(initialData.shortDescription || '');
      setDescription(initialData.description || '');
      setFabric(initialData.fabric || 'Pure Cotton');
      setFit(initialData.fit || 'Regular');
      setPattern(initialData.pattern || 'Printed');
      setOccasion(initialData.occasion || 'Casual');
      setCareInstructions(
        Array.isArray(initialData.careInstructions)
          ? initialData.careInstructions.join(', ')
          : initialData.careInstructions || ''
      );
      setPrice(initialData.price || 0);
      setCompareAtPrice(initialData.compareAtPrice || '');
      setStatus(initialData.status || 'PUBLISHED');
      setFeatured(Boolean(initialData.featured));
      setBestSeller(Boolean(initialData.bestSeller));
      setNewArrival(Boolean(initialData.newArrival));

      if (initialData.images && initialData.images.length > 0) {
        setImages(
          initialData.images.map((img: any, idx: number) => ({
            id: `img-${idx}`,
            url: typeof img === 'string' ? img : img.url,
            publicId: img.publicId,
            alt: img.alt || initialData.name,
            isPrimary: img.isPrimary || idx === 0,
            colorAssigned: img.color,
          }))
        );
      }

      if (initialData.variants && initialData.variants.length > 0) {
        setVariants(
          initialData.variants.map((v: any, idx: number) => ({
            id: v._id || `v-${idx}`,
            sku: v.sku || `YZB-${idx}`,
            color: v.color || 'Default',
            colorHex: v.colorHex || '#000000',
            size: v.size || 'M',
            price: v.price || initialData.price || 0,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock || 0,
            lowStockThreshold: v.lowStockThreshold || 5,
            isActive: v.isActive !== false,
          }))
        );
      }
    }
  }, [initialData]);

  // Current category config
  const currentCategoryConfig = useMemo(() => {
    return categoriesList.find((c) => c.slug === selectedCategory) || categoriesList[0];
  }, [categoriesList, selectedCategory]);

  // Handle Name change -> Auto Generate Slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isCustomSlug) {
      setSlug(slugify(val));
    }
  };

  // Matrix Variant Generator: Color × Size
  const handleGenerateVariantMatrix = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      alert('Please select at least one color and one size to generate variants.');
      return;
    }

    const baseCode = (slug || 'PROD').toUpperCase().slice(0, 6);
    const newVariants: FormVariant[] = [];

    selectedColors.forEach((colorObj) => {
      const colorShort = colorObj.name.slice(0, 3).toUpperCase();
      selectedSizes.forEach((sz) => {
        const sku = `YZB-${baseCode}-${colorShort}-${sz}`;
        newVariants.push({
          id: `v-${Date.now()}-${Math.random().toString().slice(-4)}`,
          sku,
          color: colorObj.name,
          colorHex: colorObj.hex,
          size: sz,
          price: Number(price) || 0,
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
          stock: 10,
          lowStockThreshold: 5,
          isActive: true,
        });
      });
    });

    setVariants(newVariants);
  };

  // Add Custom Color Preset
  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    const newCol = { name: customColorName.trim(), hex: customColorHex };
    if (!selectedColors.some((c) => c.name === newCol.name)) {
      setSelectedColors((prev) => [...prev, newCol]);
    }
    setCustomColorName('');
  };

  // Image Upload via Backend API -> Cloudinary
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) {
      setErrors((prev) => ({ ...prev, images: 'Please select an image file to upload.' }));
      return;
    }

    setUploadProgress(10);
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      // Validate MIME type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(`Unsupported image format for "${file.name}". Please upload JPEG, PNG, or WEBP.`);
        continue;
      }

      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image "${file.name}" is too large. Maximum allowed size is 5MB.`);
        continue;
      }

      // Step 1: Read and compress file as Data URI for lightweight preview & storage
      const tempId = `temp-${Date.now()}-${i}`;
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxWidth = 800;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            } else {
              resolve((e.target?.result as string) || '/images/categories/maternity-kurtis.jpg');
            }
          };
          img.onerror = () => resolve((e.target?.result as string) || '/images/categories/maternity-kurtis.jpg');
          img.src = (e.target?.result as string) || '';
        };
        reader.onerror = () => resolve('/images/categories/maternity-kurtis.jpg');
        reader.readAsDataURL(file);
      });

      setImages((prev) => [
        ...prev,
        {
          id: tempId,
          url: dataUrl,
          alt: name || 'YEZ BEE Product Image',
          isPrimary: prev.length === 0,
          uploading: true,
        },
      ]);

      try {
        setUploadProgress(30 + i * 20);
        // Step 2: Upload FormData to Backend API -> Cloudinary with category folder
        const res = await api.uploadProductImage(file, selectedCategory);
        if (res && res.data) {
          const cloudUrl = res.data.secure_url || res.data.url;
          const cloudPublicId = res.data.public_id || res.data.publicId;

          // Replace temporary preview with permanent Cloudinary URL & publicId
          setImages((prev) =>
            prev.map((img) =>
              img.id === tempId
                ? {
                  ...img,
                  url: cloudUrl,
                  publicId: cloudPublicId,
                  uploading: false,
                }
                : img
            )
          );
        }
      } catch (err: any) {
        console.warn('Backend API upload offline, using Data URI preview:', err);
        setImages((prev) =>
          prev.map((img) => (img.id === tempId ? { ...img, url: dataUrl, uploading: false } : img))
        );
      }
    }

    setUploadProgress(100);
    setTimeout(() => setUploadProgress(null), 800);
  };

  // Delete Image (including Cloudinary cleanup)
  const handleDeleteImage = async (id: string) => {
    const target = images.find((i) => i.id === id);
    if (target?.publicId) {
      try {
        await api.deleteProductImage(target.publicId);
      } catch (err) {
        console.warn('Failed to delete asset from Cloudinary:', err);
      }
    }
    setImages((prev) => {
      const filtered = prev.filter((i) => i.id !== id);
      if (filtered.length > 0 && !filtered.some((i) => i.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  // Set Primary Image
  const handleSetPrimaryImage = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === id })));
  };

  // Total Stock calculation
  const totalStock = useMemo(() => {
    return variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }, [variants]);

  // Discount percentage auto-calc
  const calcDiscountPercent = useMemo(() => {
    if (compareAtPrice && price && Number(compareAtPrice) > Number(price)) {
      return Math.round(((Number(compareAtPrice) - Number(price)) / Number(compareAtPrice)) * 100);
    }
    return 0;
  }, [price, compareAtPrice]);

  // Form Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Product name is required';
    if (!selectedCategory) errs.category = 'Category selection is required';
    if (!price || Number(price) <= 0) errs.price = 'Selling price must be greater than 0';
    if (compareAtPrice && Number(compareAtPrice) < Number(price)) {
      errs.compareAtPrice = 'Compare-at price cannot be lower than selling price';
    }
    if (images.length === 0) errs.images = 'At least one product image is required';
    if (variants.length === 0) errs.variants = 'At least one product variant is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler: Save Draft or Publish
  const handleSubmit = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
    if (loading || uploadProgress !== null) return; // Prevent duplicate submissions

    if (targetStatus === 'PUBLISHED' && !validateForm()) {
      alert('Please correct the validation errors before publishing.');
      return;
    }

    setLoading(true);

    const tagsArray = tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

    // Format variants payload
    const formattedVariants = variants.map((v) => ({
      sku: v.sku,
      color: v.color,
      colorHex: v.colorHex,
      size: v.size,
      price: Number(v.price) || Number(price) || 0,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : (compareAtPrice ? Number(compareAtPrice) : undefined),
      stock: Number(v.stock) || 0,
      lowStockThreshold: v.lowStockThreshold || 5,
      isActive: v.isActive,
    }));

    // Format images payload
    const formattedImages = images.map((img, idx) => ({
      url: img.url,
      publicId: img.publicId,
      alt: img.alt || name,
      isPrimary: img.isPrimary,
      color: img.colorAssigned,
      sortOrder: idx + 1,
    }));

    const apiPayload = {
      name,
      slug: slug || slugify(name),
      category: selectedCategoryId || selectedCategory,
      categorySlug: selectedCategory,
      categoryName: currentCategoryConfig?.name || selectedCategory.toUpperCase(),
      productType: currentCategoryConfig?.hasFeedingSplit ? productType : null,
      subcategory: productType === 'FEEDING' ? 'Feeding' : 'General',
      shortDescription,
      description: description || shortDescription,
      brand,
      price: Number(price) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      discount: calcDiscountPercent,
      status: targetStatus,
      featured,
      bestSeller,
      newArrival,
      tags: tagsArray,
      fabric,
      fit,
      pattern,
      occasion,
      careInstructions: careInstructions.split(',').map((c) => c.trim()).filter(Boolean),
      images: formattedImages,
      variants: formattedVariants,
      seo: {
        title: seoTitle || `${name} | YEZ BEE Fashion`,
        description: seoDescription || shortDescription || name,
        ogImage: images[0]?.url || '',
      },
      isActive: targetStatus === 'PUBLISHED',
    };

    try {
      if (mode === 'edit' && productId) {
        await api.updateProduct(productId, apiPayload);
        saveOrUpdateProduct({
          id: productId,
          ...apiPayload,
          categoryName: currentCategoryConfig?.name || 'CASUALS',
          status: targetStatus.toLowerCase(),
          stock: totalStock,
          thumbnail: images[0]?.url || '/images/categories/maternity-kurtis.jpg',
        } as any);
        alert(`Product updated & saved successfully to MongoDB Atlas!`);
      } else {
        const res = await api.createProduct(apiPayload);
        const createdId = res?.data?._id || res?.data?.id || `PRD-${Date.now()}`;
        saveOrUpdateProduct({
          id: createdId,
          ...apiPayload,
          categoryName: currentCategoryConfig?.name || 'CASUALS',
          status: targetStatus.toLowerCase(),
          stock: totalStock,
          thumbnail: images[0]?.url || '/images/categories/maternity-kurtis.jpg',
        } as any);
        alert(`Product published successfully to MongoDB Atlas!`);
      }
      setLoading(false);
      router.push('/admin/products');
    } catch (err: any) {
      console.error('API MongoDB operation error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      alert(`API Error: ${errorMsg}. Local fallback saved.`);
      saveOrUpdateProduct({
        id: productId,
        ...apiPayload,
        categoryName: currentCategoryConfig?.name || 'CASUALS',
        status: targetStatus.toLowerCase(),
        stock: totalStock,
        thumbnail: images[0]?.url || '/images/categories/maternity-kurtis.jpg',
      } as any);
      setLoading(false);
      router.push('/admin/products');
    }
  };

  // Preview Data
  const previewProductData: ProductPreviewData = {
    name: name || 'Untitled YEZ BEE Product',
    categoryName: currentCategoryConfig?.name || 'CASUALS',
    price: Number(price) || 0,
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
    discount: calcDiscountPercent,
    images: images.map((i) => ({ url: i.url, alt: i.alt, color: i.colorAssigned })),
    colors: selectedColors,
    sizes: selectedSizes,
    description: description || shortDescription || 'No description provided.',
    shortDescription,
    highlights,
    fabric,
    fit,
    pattern,
    occasion,
    careInstructions,
    status,
    totalStock,
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-6 pb-28 font-sans">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 font-display">
                {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'DRAFT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Complete multi-section form synchronized with MongoDB Atlas and Cloudinary
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Eye size={16} /> Preview Product
          </button>

          <button
            type="button"
            disabled={loading || uploadProgress !== null}
            onClick={() => handleSubmit('DRAFT')}
            className="px-4 py-2.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={loading || uploadProgress !== null}
            onClick={() => handleSubmit('PUBLISHED')}
            className="px-6 py-2.5 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-gold-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {uploadProgress !== null
              ? 'Uploading...'
              : loading
              ? 'Publishing...'
              : 'Publish Product'}
          </button>
        </div>
      </div>

      {/* Navigation Section Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { key: 'basic', label: '1. Basic Info', icon: FileText },
          { key: 'category', label: '2. Category', icon: Layers },
          { key: 'description', label: '3. Description & Details', icon: FileText },
          { key: 'pricing', label: '4. Pricing', icon: DollarSign },
          { key: 'colors', label: '5. Colors', icon: Grid },
          { key: 'sizes', label: '6. Sizes', icon: Tag },
          { key: 'variants', label: '7. Variants & Stock', icon: Layers },
          { key: 'images', label: '8. Images & Gallery', icon: ImageIcon },
          { key: 'seo', label: '9. SEO & Metadata', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2.5 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.key
                  ? 'bg-[var(--color-dark)] text-white font-bold shadow-sm'
                  : 'text-gray-500 hover:text-black hover:bg-gray-100'
                }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: BASIC INFORMATION */}
      {activeTab === 'basic' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Floral Cotton Anarkali Nursing Kurti"
                className={`w-full px-4 py-2.5 text-xs font-semibold rounded-xl border outline-none ${errors.name ? 'border-rose-500 bg-rose-50' : 'border-gray-300 focus:border-[var(--color-primary-gold)]'
                  }`}
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">URL Slug</label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(slugify(e.target.value));
                    setIsCustomSlug(true);
                  }}
                  placeholder="floral-cotton-anarkali-nursing-kurti"
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-gray-50 font-mono"
                />
              </div>
              <span className="text-[10px] text-gray-400 block mt-1">Live Route: /product/{slug || 'product-slug'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="YEZ BEE"
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Search Tags (Comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="casuals, feeding, cotton, anarkali"
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CATEGORY */}
      {activeTab === 'category' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            2. Category Taxonomy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Primary Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const catSlug = e.target.value;
                  setSelectedCategory(catSlug);
                  const matched = categoriesList.find((c) => c.slug === catSlug);
                  if (matched) {
                    setSelectedCategoryId(matched._id || matched.id);
                    if (matched.hasFeedingSplit) setProductType('FEEDING');
                    else setProductType(null);
                  }
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-white cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.slug || cat._id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional Product Type (FEEDING / NON-FEEDING) */}
            {currentCategoryConfig?.hasFeedingSplit && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Product Type (Feeding Split) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setProductType('FEEDING')}
                    className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border transition-all ${productType === 'FEEDING'
                        ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                      }`}
                  >
                    FEEDING
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductType('NON-FEEDING')}
                    className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border transition-all ${productType === 'NON-FEEDING'
                        ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                      }`}
                  >
                    NON-FEEDING
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: PRODUCT DESCRIPTION */}
      {activeTab === 'description' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            3. Product Description & Specifications
          </h2>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Short Description</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-line summary for product card hover previews"
              className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Full Detailed Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description covering silhouette, drape, nursing access mechanism, and styling recommendations..."
              className="w-full p-4 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Fabric Material</label>
              <input type="text" value={fabric} onChange={(e) => setFabric(e.target.value)} className="w-full px-4 py-2 text-xs border rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Fit Type</label>
              <input type="text" value={fit} onChange={(e) => setFit(e.target.value)} className="w-full px-4 py-2 text-xs border rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Pattern</label>
              <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full px-4 py-2 text-xs border rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Occasion</label>
              <input type="text" value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full px-4 py-2 text-xs border rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PRICING */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            4. Pricing & Discount Calculation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Compare-at Price (MRP ₹)</label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Cost Price (Admin Internal ₹)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-gray-50"
              />
            </div>
          </div>

          {calcDiscountPercent > 0 && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <Sparkles size={16} /> Automated Customer Discount: {calcDiscountPercent}% OFF (Savings: ₹
              {(Number(compareAtPrice) - Number(price)).toLocaleString('en-IN')})
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: COLORS */}
      {activeTab === 'colors' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            5. Color Swatches & Options
          </h2>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-3">Select Colors for this Product</label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((col) => {
                const isSelected = selectedColors.some((c) => c.name === col.name);
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedColors((prev) => prev.filter((c) => c.name !== col.name));
                      } else {
                        setSelectedColors((prev) => [...prev, col]);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${isSelected
                        ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                      }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: col.hex }} />
                    {col.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="pt-4 border-t border-gray-100 flex items-center gap-3 max-w-md">
            <input
              type="text"
              placeholder="Custom color name (e.g. Royal Maroon)"
              value={customColorName}
              onChange={(e) => setCustomColorName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border rounded-xl outline-none"
            />
            <input
              type="color"
              value={customColorHex}
              onChange={(e) => setCustomColorHex(e.target.value)}
              className="h-9 w-12 rounded border p-0.5 cursor-pointer"
            />
            <button
              type="button"
              onClick={handleAddCustomColor}
              className="px-4 py-2 bg-[var(--color-dark)] text-white text-xs font-bold rounded-xl"
            >
              + Add Color
            </button>
          </div>
        </div>
      )}

      {/* SECTION 6: SIZES */}
      {activeTab === 'sizes' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            6. Available Sizes Selection
          </h2>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-3">
              Select Sizes for {selectedCategory === 'kids-wear' ? 'Kids' : 'Women'} Taxonomy
            </label>
            <div className="flex flex-wrap gap-2.5">
              {(selectedCategory === 'kids-wear' ? KIDS_SIZES : ADULT_SIZES).map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSizes((prev) => prev.filter((s) => s !== sz));
                      } else {
                        setSelectedSizes((prev) => [...prev, sz]);
                      }
                    }}
                    className={`min-w-[48px] h-11 px-4 rounded-xl border text-xs font-bold transition-all ${isSelected
                        ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                      }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7 & 8: VARIANTS & INVENTORY */}
      {activeTab === 'variants' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              7. Product Variant Matrix & Inventory ({variants.length} Variants)
            </h2>

            <button
              type="button"
              onClick={handleGenerateVariantMatrix}
              className="px-5 py-2 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-gold-md transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} /> Regenerate Color x Size Matrix
            </button>
          </div>

          {variants.length > 0 ? (
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    <th className="p-3">Color</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">SKU Code</th>
                    <th className="p-3">Price (₹)</th>
                    <th className="p-3">Stock Quantity</th>
                    <th className="p-3">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {variants.map((v, idx) => (
                    <tr key={v.id || idx} className="hover:bg-gray-50">
                      <td className="p-3 font-bold flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: v.colorHex }} />
                        {v.color}
                      </td>
                      <td className="p-3 font-bold text-[var(--color-primary-gold)]">{v.size}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].sku = e.target.value;
                            setVariants(updated);
                          }}
                          className="px-2 py-1 text-xs border rounded font-mono w-40"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].price = Number(e.target.value) || 0;
                            setVariants(updated);
                          }}
                          className="px-2 py-1 text-xs border rounded font-bold w-24"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].stock = Number(e.target.value) || 0;
                            setVariants(updated);
                          }}
                          className="px-2 py-1 text-xs border rounded font-bold w-20"
                        />
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase ${v.stock > 5
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.stock > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                        >
                          {v.stock > 5 ? 'In Stock' : v.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No variants generated yet. Click Regenerate Matrix above.</p>
          )}
        </div>
      )}

      {/* SECTION 9, 10, 11: IMAGES */}
      {activeTab === 'images' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            8. Product Media & Cloudinary Storage
          </h2>

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-gray-300 p-8 rounded-2xl text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-xs font-bold text-gray-700">Drag & Drop Product Images Here</p>
            <p className="text-[10px] text-gray-400 mt-1">Supports JPG, PNG, WEBP up to 5MB (Uploaded directly to Cloudinary)</p>

            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="mt-4 inline-block px-4 py-2 bg-[var(--color-dark)] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Browse Image Files
            </label>
          </div>

          {uploadProgress !== null && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[var(--color-primary-gold)] h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gray-300 bg-gray-50 group"
              >
                <Image
                  src={getSafeImageUrl(img.url)}
                  alt={img.alt || ''}
                  fill
                  className="object-cover"
                  unoptimized={img.url.startsWith('blob:') || img.url.startsWith('data:')}
                />

                {img.isPrimary && (
                  <span className="absolute top-2 left-2 bg-[var(--color-dark)] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">
                    Primary
                  </span>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(img.id)}
                      className="px-2 py-1 bg-white text-black text-[10px] font-bold rounded shadow"
                    >
                      Make Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 12: SEO */}
      {activeTab === 'seo' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            9. Search Engine Optimization (SEO)
          </h2>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Meta Title</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={`${name || 'Product'} | YEZ BEE Fashion`}
              className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Meta Description</label>
            <textarea
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Shop luxury women's clothing online at YEZ BEE Fashion..."
              className="w-full p-4 text-xs font-semibold rounded-xl border border-gray-300 outline-none"
            />
          </div>
        </div>
      )}

      {/* Customer Product Preview Modal */}
      <ProductPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        product={previewProductData}
      />
    </div>
  );
}
