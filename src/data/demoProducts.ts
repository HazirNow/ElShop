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
  { id: 'offers', nameEn: '🔥 Special Offers', nameAr: '🔥 عروض خاصة', icon: '⚡', itemCount: 6, isSpecial: true },
  { id: 'dairy', nameEn: 'Dairy & Eggs', nameAr: 'الألبان والبيض', icon: '🥛', itemCount: 6 },
  { id: 'bakery', nameEn: 'Fresh Bakery', nameAr: 'المخبوزات الطازجة', icon: '🍞', itemCount: 5 },
  { id: 'beverages', nameEn: 'Beverages & Water', nameAr: 'المشروبات والمياه', icon: '🥤', itemCount: 6 },
  { id: 'snacks', nameEn: 'Snacks & Sweets', nameAr: 'المقرمشات والحلويات', icon: '🍿', itemCount: 6 },
  { id: 'pantry', nameEn: 'Pantry & Staples', nameAr: 'المواد التموينية', icon: '🍚', itemCount: 7 },
  { id: 'produce', nameEn: 'Fresh Produce', nameAr: 'الخضار والفواكه', icon: '🍎', itemCount: 6 },
  { id: 'household', nameEn: 'Household & Care', nameAr: 'العناية والمنظفات', icon: '🧼', itemCount: 5 },
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
    isSale: true,
    offerBadgeEn: 'BUY 1 GET 1 FREE',
    offerBadgeAr: 'اشتري ١ واحصل على ١ مجاناً',
    brand: 'Mai Dubai'
  },
  {
    id: 'p-offer-3',
    nameEn: 'Nutella 750g Family Mega Jar Deal',
    nameAr: 'شوكولاتة نوتيلا ٧٥٠ جم حجم عائلي كبير - سعر خاص',
    category: 'offers',
    price: 22.90,
    originalPrice: 32.00,
    discountPercent: 28,
    unitEn: '750g Mega Jar',
    unitAr: 'برطمان ٧٥٠ جم',
    imageEmoji: '🍫',
    isSpecialOffer: true,
    isPopular: true,
    isSale: true,
    offerBadgeEn: 'FLASH DEAL • 28% OFF',
    offerBadgeAr: 'تخفيض صاعق • خصم ٢٨٪',
    lowStock: 4,
    brand: 'Nutella'
  },
  {
    id: 'p-offer-4',
    nameEn: 'Puck Cream Cheese 500g + Toast Bread Bundle',
    nameAr: 'جبنة بوك كريم ٥٠٠ جم + كيس خبز توست أبيض فاخر',
    category: 'offers',
    price: 16.50,
    originalPrice: 23.25,
    discountPercent: 29,
    unitEn: 'Cheese + Bread Bundle',
    unitAr: 'عرض الجبنة والتوست',
    imageEmoji: '🧀',
    isSpecialOffer: true,
    isSale: true,
    offerBadgeEn: 'COMBO DEAL • SAVE 29%',
    offerBadgeAr: 'عرض ثنائي • وفر ٢٩٪',
    brand: 'Puck & Modern'
  },
  {
    id: 'p-offer-5',
    nameEn: 'Dettol 500ml + Fairy Dishwashing 800ml Hygiene Duo',
    nameAr: 'عرض النظافة: مطهر ديتول ٥٠٠ مل + سائل فيري ٨٠٠ مل',
    category: 'offers',
    price: 22.00,
    originalPrice: 31.50,
    discountPercent: 30,
    unitEn: 'Disinfectant + Cleaner',
    unitAr: 'ديتول + فيري',
    imageEmoji: '🧴',
    isSpecialOffer: true,
    isSale: true,
    offerBadgeEn: 'HYGIENE PACK • 30% OFF',
    offerBadgeAr: 'باقة التعقيم • خصم ٣٠٪',
    brand: 'Dettol & Fairy'
  },
  {
    id: 'p-offer-6',
    nameEn: 'Fresh Orchard Fruit Box 3kg (Bananas, Gala Apples, Oranges)',
    nameAr: 'صندوق الفواكه الطازجة ٣ كجم (موز، تفاح، برتقال)',
    category: 'offers',
    price: 14.50,
    originalPrice: 22.00,
    discountPercent: 34,
    unitEn: '3kg Mixed Crate',
    unitAr: 'صندوق مشكل ٣ كجم',
    imageEmoji: '🍎',
    isSpecialOffer: true,
    isPopular: true,
    isSale: true,
    offerBadgeEn: 'FRESH HARVEST • SAVE 34%',
    offerBadgeAr: 'قطاف طازج • وفر ٣٤٪',
    brand: 'Local Farm'
  },

  // 1. DAIRY & EGGS
  {
    id: 'p-dairy-1',
    nameEn: 'Al Rawabi Fresh Milk Full Cream',
    nameAr: 'حليب الروابي طازج كامل الدسم',
    category: 'dairy',
    price: 11.50,
    unitEn: '2 Liters',
    unitAr: '2 لتر',
    imageEmoji: '🥛',
    isPopular: true,
    brand: 'Al Rawabi'
  },
  {
    id: 'p-dairy-2',
    nameEn: 'Almarai Fresh Plain Yoghurt',
    nameAr: 'زبادي المراعي طازج كامل الدسم',
    category: 'dairy',
    price: 6.50,
    unitEn: '1 kg',
    unitAr: '1 كجم',
    imageEmoji: '🥣',
    brand: 'Almarai'
  },
  {
    id: 'p-dairy-3',
    nameEn: 'Saha Fresh Farm White Eggs Large',
    nameAr: 'بيض أبيض طازج مزارع صحة كبير',
    category: 'dairy',
    price: 19.75,
    unitEn: '30 Eggs Tray',
    unitAr: 'طبق 30 بيضة',
    imageEmoji: '🥚',
    isPopular: true,
    brand: 'Saha'
  },
  {
    id: 'p-dairy-4',
    nameEn: 'Puck Cream Cheese Jar Spread',
    nameAr: 'جبنة كريم قابلة للدهن بوك',
    category: 'dairy',
    price: 15.25,
    originalPrice: 18.00,
    unitEn: '500g Jar',
    unitAr: 'برطمان 500 جم',
    imageEmoji: '🧀',
    isSale: true,
    brand: 'Puck'
  },
  {
    id: 'p-dairy-5',
    nameEn: 'Lurpak Pure Butter Unsalted',
    nameAr: 'زبدة لورباك غير مملحة نقية',
    category: 'dairy',
    price: 10.50,
    unitEn: '200g Block',
    unitAr: 'قالب 200 جم',
    imageEmoji: '🧈',
    brand: 'Lurpak'
  },
  {
    id: 'p-dairy-6',
    nameEn: 'Almarai Cheddar Cheese Slices',
    nameAr: 'شرائح جبن شيدر المراعي للبرجر',
    category: 'dairy',
    price: 8.00,
    unitEn: '200g (10 Slices)',
    unitAr: '200 جم (10 شرائح)',
    imageEmoji: '🧀',
    lowStock: 3,
    brand: 'Almarai'
  },

  // 2. FRESH BAKERY
  {
    id: 'p-bakery-1',
    nameEn: 'Fresh Arabic Khubz Pocket Bread',
    nameAr: 'خبز عربي أبيض طازج',
    category: 'bakery',
    price: 2.50,
    unitEn: '5 Loaves Pack',
    unitAr: 'كيس 5 أرغفة',
    imageEmoji: '🫓',
    isPopular: true,
    brand: 'Fresh Baqala'
  },
  {
    id: 'p-bakery-2',
    nameEn: 'Modern Bakery Sliced Sandwich White Bread',
    nameAr: 'خبز توست أبيض شرائح مخابز الحديثة',
    category: 'bakery',
    price: 5.25,
    unitEn: '600g Loaf',
    unitAr: 'كيس 600 جم',
    imageEmoji: '🍞',
    brand: 'Modern Bakery'
  },
  {
    id: 'p-bakery-3',
    nameEn: 'Fresh All-Butter French Croissants',
    nameAr: 'كرواسون زبدة فرنسي طازج',
    category: 'bakery',
    price: 12.00,
    originalPrice: 15.00,
    unitEn: '4-Pack Box',
    unitAr: 'علبة 4 حبات',
    imageEmoji: '🥐',
    isSale: true,
    brand: 'Artisan Oven'
  },
  {
    id: 'p-bakery-4',
    nameEn: 'Fresh Samoon Hotdog Rolls',
    nameAr: 'صمون ساندوتش طازج طري',
    category: 'bakery',
    price: 3.50,
    unitEn: '6-Pack',
    unitAr: 'كيس 6 حبات',
    imageEmoji: '🥖',
    brand: 'Fresh Baqala'
  },
  {
    id: 'p-bakery-5',
    nameEn: 'Lusine Chocolate Filled Cupcakes',
    nameAr: 'كب كيك لوزين بحشوة الشوكولاتة',
    category: 'bakery',
    price: 6.75,
    unitEn: '6 x 30g Box',
    unitAr: 'علبة 6 حبات',
    imageEmoji: '🧁',
    brand: 'Lusine'
  },

  // 3. BEVERAGES & WATER
  {
    id: 'p-bev-1',
    nameEn: 'Al Ain Bottled Drinking Water',
    nameAr: 'مياه شرب معبأة العين',
    category: 'beverages',
    price: 7.50,
    unitEn: '6 x 1.5L Pack',
    unitAr: 'حزمة 6 × 1.5 لتر',
    imageEmoji: '💧',
    isPopular: true,
    brand: 'Al Ain'
  },
  {
    id: 'p-bev-2',
    nameEn: 'Mai Dubai Drinking Water',
    nameAr: 'مياه شرب نقية ماي دبي',
    category: 'beverages',
    price: 9.00,
    unitEn: '12 x 500ml Pack',
    unitAr: 'كرتون 12 × 500 مل',
    imageEmoji: '💧',
    brand: 'Mai Dubai'
  },
  {
    id: 'p-bev-3',
    nameEn: 'Al Rawabi 100% Fresh Orange Juice',
    nameAr: 'عصير برتقال طبيعي طازج الروابي',
    category: 'beverages',
    price: 8.50,
    unitEn: '1 Liter Bottle',
    unitAr: 'زجاجة 1 لتر',
    imageEmoji: '🍊',
    isPopular: true,
    brand: 'Al Rawabi'
  },
  {
    id: 'p-bev-4',
    nameEn: 'Coca-Cola Classic Cans',
    nameAr: 'كوكاكولا كلاسيك علب معدنية',
    category: 'beverages',
    price: 15.00,
    unitEn: '6 x 330ml Pack',
    unitAr: 'حزمة 6 × 330 مل',
    imageEmoji: '🥤',
    brand: 'Coca-Cola'
  },
  {
    id: 'p-bev-5',
    nameEn: 'Red Bull Energy Drink',
    nameAr: 'مشروب الطاقة ريد بول',
    category: 'beverages',
    price: 11.50,
    unitEn: '250ml Can',
    unitAr: 'علبة 250 مل',
    imageEmoji: '⚡',
    brand: 'Red Bull'
  },
  {
    id: 'p-bev-6',
    nameEn: 'Lipton Ice Tea Lemon Flavored',
    nameAr: 'شاي مثلج ليبتون بنكهة الليمون',
    category: 'beverages',
    price: 3.50,
    unitEn: '320ml Can',
    unitAr: 'علبة 320 مل',
    imageEmoji: '🍋',
    brand: 'Lipton'
  },

  // 4. SNACKS & CONFECTIONERY
  {
    id: 'p-snack-1',
    nameEn: 'Lay\'s French Cheese Potato Chips',
    nameAr: 'بطاطس ليز بنكهة الجبنة الفرنسية',
    category: 'snacks',
    price: 6.50,
    unitEn: '160g Large Bag',
    unitAr: 'كيس كبير 160 جم',
    imageEmoji: '🥔',
    isPopular: true,
    brand: 'Lay\'s'
  },
  {
    id: 'p-snack-2',
    nameEn: 'Doritos Sweet Chili Pepper Tortilla Chips',
    nameAr: 'رقائق تورتيلا دوريتوس فلفل حلو',
    category: 'snacks',
    price: 7.00,
    unitEn: '165g Bag',
    unitAr: 'كيس 165 جم',
    imageEmoji: '🌶️',
    brand: 'Doritos'
  },
  {
    id: 'p-snack-3',
    nameEn: 'Nutella Hazelnut & Cocoa Spread',
    nameAr: 'شوكولاتة نوتيلا قابلة للدهن بالبندق',
    category: 'snacks',
    price: 27.50,
    originalPrice: 32.00,
    unitEn: '750g Family Jar',
    unitAr: 'برطمان عائلي 750 جم',
    imageEmoji: '🍫',
    isSale: true,
    isPopular: true,
    brand: 'Nutella'
  },
  {
    id: 'p-snack-4',
    nameEn: 'Galaxy Smooth Milk Chocolate Bar',
    nameAr: 'لوح شوكولاتة جالاكسي بالحليب ناعمة',
    category: 'snacks',
    price: 5.75,
    unitEn: '90g Bar',
    unitAr: 'لوح 90 جم',
    imageEmoji: '🍫',
    brand: 'Galaxy'
  },
  {
    id: 'p-snack-5',
    nameEn: 'McVitie\'s Original Digestive Biscuits',
    nameAr: 'بسكويت دايجستف الأصلي ماكفيتيز',
    category: 'snacks',
    price: 8.50,
    unitEn: '400g Roll',
    unitAr: 'عبوة 400 جم',
    imageEmoji: '🍪',
    brand: 'McVitie\'s'
  },
  {
    id: 'p-snack-6',
    nameEn: 'Pringles Sour Cream & Onion Crisps',
    nameAr: 'برينجلز كريمة حامضة وبصل',
    category: 'snacks',
    price: 9.25,
    unitEn: '165g Can',
    unitAr: 'علبة 165 جم',
    imageEmoji: '🧅',
    brand: 'Pringles'
  },

  // 5. PANTRY & STAPLES
  {
    id: 'p-pantry-1',
    nameEn: 'Tilda Pure Original Basmati Rice',
    nameAr: 'أرز بسمتي هندي نقي أصلي تيلدا',
    category: 'pantry',
    price: 44.00,
    unitEn: '5kg Bag',
    unitAr: 'كيس 5 كجم',
    imageEmoji: '🍚',
    isPopular: true,
    brand: 'Tilda'
  },
  {
    id: 'p-pantry-2',
    nameEn: 'Noor Pure Sunflower Cooking Oil',
    nameAr: 'زيت طهي دوار الشمس نقي نور',
    category: 'pantry',
    price: 18.50,
    unitEn: '1.5 Liter Bottle',
    unitAr: 'زجاجة 1.5 لتر',
    imageEmoji: '🌻',
    brand: 'Noor'
  },
  {
    id: 'p-pantry-3',
    nameEn: 'Al Baker All Purpose Patent Flour',
    nameAr: 'طحين فاخر لجميع الاستعمالات البيكر',
    category: 'pantry',
    price: 4.75,
    unitEn: '1kg Bag',
    unitAr: 'كيس 1 كجم',
    imageEmoji: '🌾',
    brand: 'Al Baker'
  },
  {
    id: 'p-pantry-4',
    nameEn: 'Maggi Chicken Bouillon Stock',
    nameAr: 'مكعبات مرقة دجاج ماجي',
    category: 'pantry',
    price: 13.25,
    unitEn: '24 Cubes Box',
    unitAr: 'علبة 24 مكعب',
    imageEmoji: '🍲',
    brand: 'Maggi'
  },
  {
    id: 'p-pantry-5',
    nameEn: 'Heinz Tomato Ketchup Squeeze',
    nameAr: 'كاتشب طماطم هاينز عبوة ضغط',
    category: 'pantry',
    price: 12.00,
    unitEn: '570g Bottle',
    unitAr: 'عبوة 570 جم',
    imageEmoji: '🍅',
    brand: 'Heinz'
  },
  {
    id: 'p-pantry-6',
    nameEn: 'Lipton Yellow Label Black Tea Bags',
    nameAr: 'أكياس شاي أسود ليبتون العلامة الصفراء',
    category: 'pantry',
    price: 16.50,
    unitEn: '100 Tea Bags',
    unitAr: 'علبة 100 كيس شاي',
    imageEmoji: '🫖',
    isPopular: true,
    brand: 'Lipton'
  },
  {
    id: 'p-pantry-7',
    nameEn: 'Barilla Italian Penne Rigate Pasta',
    nameAr: 'مكرونة بيني ريجاتي إيطالية باريلا',
    category: 'pantry',
    price: 7.50,
    unitEn: '500g Box',
    unitAr: 'علبة 500 جم',
    imageEmoji: '🍝',
    brand: 'Barilla'
  },

  // 6. FRESH PRODUCE
  {
    id: 'p-prod-1',
    nameEn: 'Chiquita Fresh Golden Bananas',
    nameAr: 'موز أصفر طازج شيكيتا فلبيني',
    category: 'produce',
    price: 5.50,
    unitEn: '1 kg Approx',
    unitAr: '1 كجم تقريباً',
    imageEmoji: '🍌',
    isPopular: true,
    brand: 'Chiquita'
  },
  {
    id: 'p-prod-2',
    nameEn: 'Greenhouse Crisp Red Tomatoes',
    nameAr: 'طماطم حمراء طازجة درجة أولى',
    category: 'produce',
    price: 4.25,
    unitEn: '1 kg Box',
    unitAr: '1 كجم',
    imageEmoji: '🍅',
    brand: 'Local Farm'
  },
  {
    id: 'p-prod-3',
    nameEn: 'Fresh Farm Crisp Cucumbers',
    nameAr: 'خيار طازج مزارع محلية',
    category: 'produce',
    price: 3.75,
    unitEn: '1 kg Pack',
    unitAr: '1 كجم',
    imageEmoji: '🥒',
    brand: 'Local Farm'
  },
  {
    id: 'p-prod-4',
    nameEn: 'Royal Gala Sweet Red Apples',
    nameAr: 'تفاح رويال جالا أحمر حلو',
    category: 'produce',
    price: 7.50,
    unitEn: '1 kg Bag',
    unitAr: '1 كجم',
    imageEmoji: '🍎',
    brand: 'Imported Fresh'
  },
  {
    id: 'p-prod-5',
    nameEn: 'Golden Yellow Cooking Onions',
    nameAr: 'بصل أصفر ذهبي للطبخ',
    category: 'produce',
    price: 3.00,
    unitEn: '1 kg Mesh Bag',
    unitAr: 'شبك 1 كجم',
    imageEmoji: '🧅',
    brand: 'Fresh Harvest'
  },
  {
    id: 'p-prod-6',
    nameEn: 'Fresh Seedless Watermelon Half',
    nameAr: 'نصف بطيخ أحمر طازج حلو وبدون بذور',
    category: 'produce',
    price: 12.50,
    unitEn: '~3 kg Cut',
    unitAr: '~3 كجم تقريباً',
    imageEmoji: '🍉',
    isSale: true,
    brand: 'Fresh Harvest'
  },

  // 7. HOUSEHOLD & CARE
  {
    id: 'p-care-1',
    nameEn: 'Dettol Antibacterial Disinfectant Liquid',
    nameAr: 'سائل ديتول الأصلي المعقم والمطهر',
    category: 'household',
    price: 18.00,
    unitEn: '500ml Bottle',
    unitAr: 'زجاجة 500 مل',
    imageEmoji: '🧴',
    isPopular: true,
    brand: 'Dettol'
  },
  {
    id: 'p-care-2',
    nameEn: 'Fairy Original Lemon Dishwashing Liquid',
    nameAr: 'سائل غسيل الصحون فيري بالليمون',
    category: 'household',
    price: 13.50,
    unitEn: '800ml Bottle',
    unitAr: 'زجاجة 800 مل',
    imageEmoji: '🍋',
    brand: 'Fairy'
  },
  {
    id: 'p-care-3',
    nameEn: 'Fine Fluffy Facial Tissues 2-Ply',
    nameAr: 'مناديل وجه فاين فلافي طبقتين ناعمة',
    category: 'household',
    price: 16.50,
    originalPrice: 20.00,
    unitEn: '5 Boxes x 200 Sheets',
    unitAr: '5 علب × 200 منديل',
    imageEmoji: '🧻',
    isSale: true,
    brand: 'Fine'
  },
  {
    id: 'p-care-4',
    nameEn: 'Ariel Automatic Laundry Detergent Powder',
    nameAr: 'مسحوق غسيل أريال أوتوماتيك المركز',
    category: 'household',
    price: 32.00,
    unitEn: '2.5 kg Bag',
    unitAr: 'كيس 2.5 كجم',
    imageEmoji: '🧺',
    brand: 'Ariel'
  },
  {
    id: 'p-care-5',
    nameEn: 'Colgate Total 12 Clean Mint Toothpaste',
    nameAr: 'معجون أسنان كولجيت توتال 12 بالنعناع',
    category: 'household',
    price: 11.00,
    unitEn: '100ml Tube',
    unitAr: 'أنبوب 100 مل',
    imageEmoji: '🪥',
    brand: 'Colgate'
  }
];
