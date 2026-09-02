export interface DemoProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'offers' | 'dairy' | 'bakery' | 'beverages' | 'snacks' | 'pantry' | 'produce' | 'household';
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  unitEn: string;
  unitAr: string;
  imageEmoji: string;
  isPopular?: boolean;
  isSale?: boolean;
  isSpecialOffer?: boolean;
  offerBadgeEn?: string;
  offerBadgeAr?: string;
  lowStock?: number;
  brand: string;
}

export interface DemoCategory {
  id: 'offers' | 'dairy' | 'bakery' | 'beverages' | 'snacks' | 'pantry' | 'produce' | 'household';
  nameEn: string;
  nameAr: string;
  icon: string;
  itemCount: number;
  isSpecial?: boolean;
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  { id: 'offers', nameEn: '🔥 Special Offers', nameAr: '🔥 عروض خاصة', icon: '⚡', itemCount: 4, isSpecial: true },
  { id: 'dairy', nameEn: 'Dairy & Eggs', nameAr: 'الألبان والبيض', icon: '🥛', itemCount: 4 },
  { id: 'bakery', nameEn: 'Fresh Bakery', nameAr: 'المخبوزات الطازجة', icon: '🍞', itemCount: 4 },
  { id: 'beverages', nameEn: 'Beverages & Water', nameAr: 'المشروبات والمياه', icon: '🥤', itemCount: 4 },
  { id: 'snacks', nameEn: 'Snacks & Sweets', nameAr: 'المقرمشات والحلويات', icon: '🍿', itemCount: 4 },
  { id: 'pantry', nameEn: 'Pantry & Staples', nameAr: 'المواد التموينية', icon: '🍚', itemCount: 4 },
  { id: 'produce', nameEn: 'Fresh Produce', nameAr: 'الخضار والفواكه', icon: '🍎', itemCount: 4 },
  { id: 'household', nameEn: 'Household & Care', nameAr: 'العناية والمنظفات', icon: '🧼', itemCount: 4 },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  // 0. SPECIAL OFFERS & BUNDLES (SUPER DEALS)
  {
    id: 'p-offer-1',
    nameEn: 'Weekend Breakfast Combo (Milk 2L + 30 Eggs + Khubz)',
    nameAr: 'عرض فطور نهاية الأسبوع (حليب ٢ لتر + طبق بيض ٣٠ + خبز)',
    category: 'offers',
    price: 24.50,
    originalPrice: 33.75,
    discountPercent: 27,
    unitEn: '3-Item Family Pack',
    unitAr: 'باقة عائلية ٣ منتجات',
    imageEmoji: '🍳',
    isSpecialOffer: true,
    isPopular: true,
    isSale: true,
    offerBadgeEn: 'SAVE 27% • SUPER COMBO',
    offerBadgeAr: 'وفر ٢٧٪ • عرض التوفير',
    brand: 'Al Rawabi + Saha'
  },
  {
    id: 'p-offer-2',
    nameEn: 'Mai Dubai Water 12x500ml (Buy 1 Get 1 Free)',
    nameAr: 'مياه ماي دبي ١٢ × ٥٠٠ مل (اشتري ١ واحصل على ١ مجاناً)',
    category: 'offers',
    price: 9.00,
    originalPrice: 18.00,
    discountPercent: 50,
    unitEn: '24 Bottles Pack (BOGO)',
    unitAr: '٢٤ زجاجة (عرض ١+١)',
    imageEmoji: '💧',
    isSpecialOffer: true,
    isPopular: true,
    isSale: true,
    offerBadgeEn: 'BOGO • BUY 1 GET 1',
    offerBadgeAr: 'عرض ١+١ مجاناً',
    brand: 'Mai Dubai'
  },
  {
    id: 'p-offer-3',
    nameEn: 'Nutella Hazelnut Spread 750g Family Mega Jar',
    nameAr: 'شوكولاتة نوتيلا بالبندق ٧٥٠ جم عبوة عائلية كبرى',
    category: 'offers',
    price: 22.90,
    originalPrice: 31.80,
    discountPercent: 28,
    unitEn: '750g Jar',
    unitAr: 'مرطبان ٧٥٠ جم',
    imageEmoji: '🍫',
    isSpecialOffer: true,
    isSale: true,
    offerBadgeEn: 'FLASH DEAL • 28% OFF',
    offerBadgeAr: 'تخفيض سريع ٢٨٪',
    brand: 'Nutella'
  },
  {
    id: 'p-offer-4',
    nameEn: 'Fresh Orchard Fruit Box 3kg (Bananas, Apples, Oranges)',
    nameAr: 'صندوق فواكه طازجة مشكلة ٣ كجم (موز، تفاح، برتقال)',
    category: 'offers',
    price: 14.50,
    originalPrice: 22.00,
    discountPercent: 34,
    unitEn: '3kg Box',
    unitAr: 'صندوق ٣ كجم',
    imageEmoji: '🧺',
    isSpecialOffer: true,
    isSale: true,
    offerBadgeEn: 'SAVE 34% • FRESH HARVEST',
    offerBadgeAr: 'وفر ٣٤٪ • قطاف طازج',
    brand: 'Fresh Orchard'
  },

  // 1. DAIRY & EGGS
  {
    id: 'p-dairy-1',
    nameEn: 'Al Rawabi Full Cream Fresh Milk 2L',
    nameAr: 'حليب الروابي طازج كامل الدسم ٢ لتر',
    category: 'dairy',
    price: 11.50,
    unitEn: '2L Bottle',
    unitAr: 'زجاجة ٢ لتر',
    imageEmoji: '🥛',
    isPopular: true,
    brand: 'Al Rawabi'
  },
  {
    id: 'p-dairy-2',
    nameEn: 'Saha Fresh Farm Eggs Tray 30s',
    nameAr: 'بيض مزارع صحة طازج طبق ٣٠ بيضة',
    category: 'dairy',
    price: 19.75,
    unitEn: 'Tray of 30',
    unitAr: 'طبق ٣٠ بيضة',
    imageEmoji: '🥚',
    isPopular: true,
    brand: 'Saha Farms'
  },
  {
    id: 'p-dairy-3',
    nameEn: 'Almarai Fresh Yoghurt Full Fat 1kg',
    nameAr: 'زبادي المراعي طازج كامل الدسم ١ كجم',
    category: 'dairy',
    price: 6.50,
    unitEn: '1kg Tub',
    unitAr: 'عبوة ١ كجم',
    imageEmoji: '🥣',
    brand: 'Almarai'
  },
  {
    id: 'p-dairy-4',
    nameEn: 'Puck Cream Cheese Spread 500g Jar',
    nameAr: 'جبنة بوك كريم قابلة للدهن ٥٠٠ جم',
    category: 'dairy',
    price: 14.50,
    unitEn: '500g Glass Jar',
    unitAr: 'مرطبان ٥٠٠ جم',
    imageEmoji: '🧀',
    brand: 'Puck'
  },

  // 2. FRESH BAKERY
  {
    id: 'p-bakery-1',
    nameEn: 'Arabic White Khubz Bread 5 Pcs',
    nameAr: 'خبز لبناني أبيض طازج ٥ حبات',
    category: 'bakery',
    price: 2.50,
    unitEn: 'Pack of 5',
    unitAr: 'ربطة ٥ أرغفة',
    imageEmoji: '🫓',
    isPopular: true,
    brand: 'Hot Bakery'
  },
  {
    id: 'p-bakery-2',
    nameEn: 'Fresh Samoon Bread Roll 6 Pcs',
    nameAr: 'صمون طازج سمسم ومحمص ٦ حبات',
    category: 'bakery',
    price: 3.50,
    unitEn: 'Pack of 6',
    unitAr: 'ربطة ٦ حبات',
    imageEmoji: '🥖',
    brand: 'Hot Bakery'
  },
  {
    id: 'p-bakery-3',
    nameEn: 'L\'Usine Soft Sliced White Bread',
    nameAr: 'خبز توست أبيض لوزين طري ٦٠٠ جم',
    category: 'bakery',
    price: 5.25,
    unitEn: '600g Loaf',
    unitAr: 'كيس ٦٠٠ جم',
    imageEmoji: '🍞',
    brand: 'L\'Usine'
  },
  {
    id: 'p-bakery-4',
    nameEn: '7 Days Butter Croissant (BOGO Pack)',
    nameAr: 'كرواسون سفن دايز بالزبدة (عرض حبتين)',
    category: 'bakery',
    price: 4.50,
    originalPrice: 6.00,
    unitEn: '2x55g Pack',
    unitAr: 'عبوة حبتين × ٥٥ جم',
    imageEmoji: '🥐',
    isSale: true,
    brand: '7 Days'
  },

  // 3. BEVERAGES & WATER
  {
    id: 'p-bev-1',
    nameEn: 'Al Ain Mineral Water 6x1.5L Shrink',
    nameAr: 'مياه العين المعدنية ٦ × ١.٥ لتر',
    category: 'beverages',
    price: 7.50,
    unitEn: '6x1.5L Pack',
    unitAr: 'شدة ٦ × ١.٥ لتر',
    imageEmoji: '💧',
    isPopular: true,
    brand: 'Al Ain'
  },
  {
    id: 'p-bev-2',
    nameEn: 'Coca-Cola Original Taste Cans 6x330ml',
    nameAr: 'كوكاكولا كلاسيك ٦ علب × ٣٣٠ مل',
    category: 'beverages',
    price: 15.00,
    unitEn: '6x330ml Pack',
    unitAr: 'شدة ٦ علب × ٣٣٠ مل',
    imageEmoji: '🥤',
    brand: 'Coca-Cola'
  },
  {
    id: 'p-bev-3',
    nameEn: 'Rani Float Orange Juice Drink 240ml',
    nameAr: 'عصير راني برتقال مع قطع فاكهة ٢٤٠ مل',
    category: 'beverages',
    price: 2.75,
    unitEn: '240ml Can',
    unitAr: 'علبة ٢٤٠ مل',
    imageEmoji: '🧃',
    brand: 'Rani'
  },
  {
    id: 'p-bev-4',
    nameEn: 'Red Bull Energy Drink Regular 250ml',
    nameAr: 'مشروب الطاقة ريد بول الأصلي ٢٥٠ مل',
    category: 'beverages',
    price: 10.50,
    unitEn: '250ml Can',
    unitAr: 'علبة ٢٥٠ مل',
    imageEmoji: '⚡',
    brand: 'Red Bull'
  },

  // 4. SNACKS & SWEETS
  {
    id: 'p-snack-1',
    nameEn: 'Lay\'s Classic Salted Potato Chips 170g',
    nameAr: 'بطاطس ليز مملح كلاسيك ١٧٠ جم',
    category: 'snacks',
    price: 6.50,
    unitEn: '170g Bag',
    unitAr: 'كيس ١٧٠ جم',
    imageEmoji: '🥔',
    isPopular: true,
    brand: 'Lay\'s'
  },
  {
    id: 'p-snack-2',
    nameEn: 'Doritos Sweet Chili Pepper Nacho 165g',
    nameAr: 'دوريتوس فلفل حلو حار مقرمش ١٦٥ جم',
    category: 'snacks',
    price: 6.75,
    unitEn: '165g Bag',
    unitAr: 'كيس ١٦٥ جم',
    imageEmoji: '🌶️',
    brand: 'Doritos'
  },
  {
    id: 'p-snack-3',
    nameEn: 'Oreo Original Sandwich Cookies 16x38g',
    nameAr: 'بسكويت أوريو الأصلي بالكريمة ١٦ قطعة',
    category: 'snacks',
    price: 13.50,
    unitEn: '16x38g Box',
    unitAr: 'علبة ١٦ عبوة',
    imageEmoji: '🍪',
    brand: 'Oreo'
  },
  {
    id: 'p-snack-4',
    nameEn: 'Galaxy Smooth Milk Chocolate Bar 3x80g',
    nameAr: 'شوكولاتة جلاكسي حليب ناعمة ٣ حبات',
    category: 'snacks',
    price: 12.00,
    originalPrice: 15.00,
    unitEn: '3x80g Multipack',
    unitAr: 'عرض ٣ ألواح',
    imageEmoji: '🍫',
    isSale: true,
    brand: 'Galaxy'
  },

  // 5. PANTRY & STAPLES
  {
    id: 'p-pantry-1',
    nameEn: 'Tilda Pure Basmati Rice 5kg Bag',
    nameAr: 'أرز تيلدا بسمتي هندي نقي ممتاز ٥ كجم',
    category: 'pantry',
    price: 44.00,
    unitEn: '5kg Bag',
    unitAr: 'كيس ٥ كجم',
    imageEmoji: '🍚',
    isPopular: true,
    brand: 'Tilda'
  },
  {
    id: 'p-pantry-2',
    nameEn: 'Noor Pure Sunflower Cooking Oil 1.5L',
    nameAr: 'زيت دوار الشمس نقي نور للطبخ ١.٥ لتر',
    category: 'pantry',
    price: 16.50,
    unitEn: '1.5L Bottle',
    unitAr: 'زجاجة ١.٥ لتر',
    imageEmoji: '🌻',
    brand: 'Noor'
  },
  {
    id: 'p-pantry-3',
    nameEn: 'Al Ain Tomato Paste Tetra 8x135g',
    nameAr: 'معجون طماطم العين ٨ عبوات × ١٣٥ جم',
    category: 'pantry',
    price: 9.50,
    unitEn: '8x135g Pack',
    unitAr: 'شدة ٨ عبوات',
    imageEmoji: '🥫',
    brand: 'Al Ain'
  },
  {
    id: 'p-pantry-4',
    nameEn: 'Indomie Instant Fried Noodles 5x80g',
    nameAr: 'إندومي شعيرية مقلية سريعة التحضير ٥ أكياس',
    category: 'pantry',
    price: 7.25,
    unitEn: '5x80g Multipack',
    unitAr: 'ربطة ٥ أكياس',
    imageEmoji: '🍜',
    brand: 'Indomie'
  },

  // 6. FRESH PRODUCE
  {
    id: 'p-prod-1',
    nameEn: 'Fresh Premium Cavendish Bananas 1kg',
    nameAr: 'موز كافنديش طازج ممتاز ١ كجم',
    category: 'produce',
    price: 5.50,
    unitEn: '1 kg',
    unitAr: '١ كجم',
    imageEmoji: '🍌',
    isPopular: true,
    brand: 'Fresh Market'
  },
  {
    id: 'p-prod-2',
    nameEn: 'Fresh Red Vine Tomatoes 1kg Box',
    nameAr: 'طماطم حمراء طازجة درجة أولى ١ كجم',
    category: 'produce',
    price: 4.50,
    unitEn: '1 kg Box',
    unitAr: 'صندوق ١ كجم',
    imageEmoji: '🍅',
    brand: 'Local Farm'
  },
  {
    id: 'p-prod-3',
    nameEn: 'Royal Gala Red Sweet Apples 1kg',
    nameAr: 'تفاح رويال جالا أحمر حلو طازج ١ كجم',
    category: 'produce',
    price: 7.50,
    unitEn: '1 kg Bag',
    unitAr: 'كيس ١ كجم',
    imageEmoji: '🍎',
    brand: 'Imported Fresh'
  },
  {
    id: 'p-prod-4',
    nameEn: 'Golden Yellow Cooking Onions 1kg',
    nameAr: 'بصل أصفر ذهبي للطبخ ١ كجم',
    category: 'produce',
    price: 3.00,
    unitEn: '1 kg Mesh Bag',
    unitAr: 'شبك ١ كجم',
    imageEmoji: '🧅',
    brand: 'Fresh Harvest'
  },

  // 7. HOUSEHOLD & CARE
  {
    id: 'p-care-1',
    nameEn: 'Dettol Disinfectant Liquid 500ml',
    nameAr: 'سائل ديتول الأصلي المطهر ٥٠٠ مل',
    category: 'household',
    price: 18.00,
    unitEn: '500ml Bottle',
    unitAr: 'زجاجة ٥٠٠ مل',
    imageEmoji: '🧴',
    isPopular: true,
    brand: 'Dettol'
  },
  {
    id: 'p-care-2',
    nameEn: 'Fairy Lemon Dishwashing Liquid 800ml',
    nameAr: 'سائل غسيل الصحون فيري بالليمون ٨٠٠ مل',
    category: 'household',
    price: 13.50,
    unitEn: '800ml Bottle',
    unitAr: 'زجاجة ٨٠٠ مل',
    imageEmoji: '🍋',
    brand: 'Fairy'
  },
  {
    id: 'p-care-3',
    nameEn: 'Fine Fluffy Facial Tissues (5 Boxes)',
    nameAr: 'مناديل وجه فاين فلافي (٥ علب)',
    category: 'household',
    price: 16.50,
    originalPrice: 20.00,
    unitEn: '5 Boxes x 200 Sheets',
    unitAr: '٥ علب × ٢٠٠ منديل',
    imageEmoji: '🧻',
    isSale: true,
    brand: 'Fine'
  },
  {
    id: 'p-care-4',
    nameEn: 'Colgate Total 12 Clean Mint 100ml',
    nameAr: 'معجون أسنان كولجيت توتال ١٠٠ مل',
    category: 'household',
    price: 11.00,
    unitEn: '100ml Tube',
    unitAr: 'أنبوب ١٠٠ مل',
    imageEmoji: '🪥',
    brand: 'Colgate'
  }
];
