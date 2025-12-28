
import { Product, Review } from './types';

const CATEGORIES = [
  'Electronics', 'Fashion', 'Home', 'Mobiles', 'Accessories', 
  'Grocery', 'Appliances', 'Health', 'Beauty', 'Sports', 'Books'
];

const ADJECTIVES = ['Premium', 'Ultra', 'Classic', 'Modern', 'Eco', 'Smart', 'Sleek', 'Durable', 'Professional', 'Minimalist', 'Elite', 'Zen', 'Power', 'Titanium', 'Aura'];

const PRODUCT_TYPES: Record<string, string[]> = {
  'Electronics': ['Headphones', 'Speaker', 'Monitor', 'Keyboard', 'Mouse', 'Router', 'Tablet', 'Camera', 'Drone', 'Hub'],
  'Fashion': ['Sneakers', 'Jacket', 'T-Shirt', 'Jeans', 'Dress', 'Scarf', 'Boots', 'Hat', 'Watch', 'Belt'],
  'Home': ['Desk', 'Lamp', 'Chair', 'Vacuum', 'Purifier', 'Skillet', 'Blender', 'Fan', 'Organizer', 'Clock'],
  'Mobiles': ['Smartphone', 'Foldable', 'Gaming Phone', 'Budget Phone', 'Charger', 'Case', 'Screen Protector'],
  'Accessories': ['Wallet', 'Watch', 'Bag', 'Sunglasses', 'Jewelry', 'Cap', 'Backpack'],
  'Grocery': ['Coffee Beans', 'Organic Honey', 'Protein Bar', 'Green Tea', 'Pasta', 'Olive Oil'],
  'Sports': ['Dumbbells', 'Yoga Mat', 'Cycle', 'Racket', 'Ball', 'Gym Bag', 'Treadmill'],
  'Beauty': ['Serum', 'Moisturizer', 'Perfume', 'Lipstick', 'Hair Dryer', 'Shaving Kit'],
  'Appliances': ['Refrigerator', 'Microwave', 'Washing Machine', 'Air Conditioner', 'Heater'],
  'Health': ['Mask', 'Thermometer', 'Supplement', 'Vitamins', 'Sanitizer'],
  'Books': ['Novel', 'Biography', 'Textbook', 'Cookbook', 'Comic', 'Journal']
};

const generateProducts = (count: number): Product[] => {
  const products: Product[] = [];
  
  for (let i = 1; i <= count; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const types = PRODUCT_TYPES[category] || ['Item'];
    const type = types[Math.floor(Math.random() * types.length)];
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    
    const name = `${adj} ${type} ${100 + i}`;
    const price = parseFloat((Math.random() * (2000 - 10) + 10).toFixed(2));
    const rating = parseFloat((Math.random() * (5 - 3) + 3).toFixed(1));
    const stock = Math.floor(Math.random() * 200);
    const reviewsCount = Math.floor(Math.random() * 5000);
    
    // Using Unsplash with category and index for unique images
    const image = `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=600&sig=${i}`;
    
    // Fallback images based on category if the signature approach is inconsistent
    const categoryImageMap: Record<string, string> = {
      'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
      'Fashion': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      'Home': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38',
      'Mobiles': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
      'Accessories': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
      'Grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e',
      'Sports': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
      'Beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
      'Appliances': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
      'Health': 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144',
      'Books': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d'
    };

    products.push({
      id: i.toString(),
      name,
      description: `Experience the future of ${category.toLowerCase()} with the ${name}. Crafted for quality and performance, this ${type.toLowerCase()} features ${adj.toLowerCase()} materials and innovative design.`,
      price,
      category,
      image: `${categoryImageMap[category] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}?auto=format&fit=crop&q=80&w=600&sig=${i}`,
      rating,
      reviewsCount,
      stock,
      tags: [category.toLowerCase(), type.toLowerCase(), adj.toLowerCase()]
    });
  }
  return products;
};

// Generate 1000 products
export const MOCK_PRODUCTS: Product[] = generateProducts(1000);

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    productId: '1',
    userName: 'John Doe',
    rating: 5,
    comment: 'Exceptional quality. Definitely worth the price!',
    date: '2024-03-15'
  },
  {
    id: 'r2',
    productId: '1',
    userName: 'Jane Smith',
    rating: 4,
    comment: 'Great features, though I wish the battery lasted just a bit longer.',
    date: '2024-03-10'
  },
  {
    id: 'r3',
    productId: '2',
    userName: 'Alice Runner',
    rating: 5,
    comment: 'The performance is unmatched in this category.',
    date: '2024-02-28'
  },
  {
    id: 'r4',
    productId: '4',
    userName: 'TechGuru',
    rating: 5,
    comment: 'Top tier hardware. The display is absolutely gorgeous.',
    date: '2024-04-01'
  }
];
