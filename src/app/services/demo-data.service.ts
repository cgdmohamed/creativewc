import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DemoProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  regular_price: number;
  sale_price?: number;
  description: string;
  short_description: string;
  images: { src: string; alt: string }[];
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
  attributes: any[];
  stock_status: string;
  stock_quantity: number;
  featured: boolean;
  on_sale: boolean;
  rating_count: number;
  average_rating: string;
  date_created: string;
}

export interface DemoCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: { src: string; alt: string };
  count: number;
}

export interface DemoOrder {
  id: number;
  status: string;
  currency: string;
  total: number;
  date_created: string;
  line_items: any[];
  billing: any;
  shipping: any;
}

@Injectable({
  providedIn: 'root'
})
export class DemoDataService {
  private demoProducts: DemoProduct[] = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      slug: "premium-wireless-headphones",
      price: 299.99,
      regular_price: 399.99,
      sale_price: 299.99,
      description: "Experience superior sound quality with our premium wireless headphones featuring active noise cancellation and 30-hour battery life.",
      short_description: "Premium wireless headphones with noise cancellation",
      images: [
        { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", alt: "Wireless Headphones" },
        { src: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500", alt: "Headphones Detail" }
      ],
      categories: [{ id: 1, name: "Electronics" }, { id: 2, name: "Audio" }],
      tags: [{ id: 1, name: "wireless" }, { id: 2, name: "premium" }],
      attributes: [],
      stock_status: "instock",
      stock_quantity: 25,
      featured: true,
      on_sale: true,
      rating_count: 47,
      average_rating: "4.8",
      date_created: "2024-01-15T10:00:00"
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      slug: "smart-fitness-watch",
      price: 199.99,
      regular_price: 199.99,
      description: "Track your fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS, and 7-day battery life.",
      short_description: "Advanced fitness tracking smartwatch",
      images: [
        { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", alt: "Smart Watch" },
        { src: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500", alt: "Watch Detail" }
      ],
      categories: [{ id: 1, name: "Electronics" }, { id: 3, name: "Wearables" }],
      tags: [{ id: 3, name: "fitness" }, { id: 4, name: "smart" }],
      attributes: [],
      stock_status: "instock",
      stock_quantity: 12,
      featured: true,
      on_sale: false,
      rating_count: 23,
      average_rating: "4.5",
      date_created: "2024-01-20T14:30:00"
    },
    {
      id: 3,
      name: "Organic Cotton T-Shirt",
      slug: "organic-cotton-tshirt",
      price: 29.99,
      regular_price: 39.99,
      sale_price: 29.99,
      description: "Comfortable and sustainable organic cotton t-shirt in various colors. Perfect for everyday wear.",
      short_description: "Sustainable organic cotton t-shirt",
      images: [
        { src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", alt: "Cotton T-Shirt" },
        { src: "https://images.unsplash.com/photo-1503341338388-b2e6a9c9ac45?w=500", alt: "T-Shirt Colors" }
      ],
      categories: [{ id: 4, name: "Clothing" }, { id: 5, name: "Men" }],
      tags: [{ id: 5, name: "organic" }, { id: 6, name: "cotton" }],
      attributes: [],
      stock_status: "instock",
      stock_quantity: 50,
      featured: false,
      on_sale: true,
      rating_count: 15,
      average_rating: "4.2",
      date_created: "2024-02-01T09:15:00"
    },
    {
      id: 4,
      name: "Artisan Coffee Beans",
      slug: "artisan-coffee-beans",
      price: 24.99,
      regular_price: 24.99,
      description: "Premium single-origin coffee beans roasted to perfection. Rich, full-bodied flavor with notes of chocolate and caramel.",
      short_description: "Premium single-origin coffee beans",
      images: [
        { src: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500", alt: "Coffee Beans" },
        { src: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500", alt: "Coffee Detail" }
      ],
      categories: [{ id: 6, name: "Food & Beverage" }, { id: 7, name: "Coffee" }],
      tags: [{ id: 7, name: "artisan" }, { id: 8, name: "premium" }],
      attributes: [],
      stock_status: "instock",
      stock_quantity: 30,
      featured: true,
      on_sale: false,
      rating_count: 31,
      average_rating: "4.7",
      date_created: "2024-02-10T11:45:00"
    },
    {
      id: 5,
      name: "Minimalist Desk Lamp",
      slug: "minimalist-desk-lamp",
      price: 89.99,
      regular_price: 89.99,
      description: "Modern LED desk lamp with adjustable brightness and color temperature. Perfect for any workspace.",
      short_description: "Modern LED desk lamp with adjustable settings",
      images: [
        { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500", alt: "Desk Lamp" },
        { src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500", alt: "Lamp Detail" }
      ],
      categories: [{ id: 8, name: "Home & Garden" }, { id: 9, name: "Lighting" }],
      tags: [{ id: 9, name: "modern" }, { id: 10, name: "LED" }],
      attributes: [],
      stock_status: "instock",
      stock_quantity: 18,
      featured: false,
      on_sale: false,
      rating_count: 8,
      average_rating: "4.3",
      date_created: "2024-02-15T16:20:00"
    },
    {
      id: 6,
      name: "Yoga Mat Pro",
      slug: "yoga-mat-pro",
      price: 59.99,
      regular_price: 79.99,
      sale_price: 59.99,
      description: "Professional-grade yoga mat with superior grip and comfort. Made from eco-friendly materials.",
      short_description: "Professional eco-friendly yoga mat",
      images: [
        { src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500", alt: "Yoga Mat" },
        { src: "https://images.unsplash.com/photo-1506629905607-bb19bd3d4ff5?w=500", alt: "Yoga Practice" }
      ],
      categories: [{ id: 10, name: "Sports & Fitness" }, { id: 11, name: "Yoga" }],
      tags: [{ id: 11, name: "yoga" }, { id: 12, name: "eco-friendly" }],
      attributes: [],
      stock_status: "instock",
      stock_quantity: 22,
      featured: true,
      on_sale: true,
      rating_count: 19,
      average_rating: "4.6",
      date_created: "2024-02-20T13:10:00"
    }
  ];

  private demoCategories: DemoCategory[] = [
    {
      id: 1,
      name: "Electronics",
      slug: "electronics",
      description: "Latest technology and electronic devices",
      image: { src: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300", alt: "Electronics" },
      count: 25
    },
    {
      id: 2,
      name: "Audio",
      slug: "audio",
      description: "Headphones, speakers, and audio equipment",
      image: { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", alt: "Audio" },
      count: 12
    },
    {
      id: 3,
      name: "Wearables",
      slug: "wearables",
      description: "Smart watches and fitness trackers",
      image: { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300", alt: "Wearables" },
      count: 8
    },
    {
      id: 4,
      name: "Clothing",
      slug: "clothing",
      description: "Fashion and apparel for all",
      image: { src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300", alt: "Clothing" },
      count: 45
    },
    {
      id: 5,
      name: "Men",
      slug: "men",
      description: "Men's fashion and accessories",
      image: { src: "https://images.unsplash.com/photo-1503341338388-b2e6a9c9ac45?w=300", alt: "Men's Fashion" },
      count: 20
    },
    {
      id: 6,
      name: "Food & Beverage",
      slug: "food-beverage",
      description: "Gourmet foods and beverages",
      image: { src: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300", alt: "Food & Beverage" },
      count: 15
    }
  ];

  private demoOrders: DemoOrder[] = [
    {
      id: 101,
      status: "completed",
      currency: "USD",
      total: 329.98,
      date_created: "2024-02-25T10:30:00",
      line_items: [
        { product_id: 1, name: "Premium Wireless Headphones", quantity: 1, total: "299.99" },
        { product_id: 3, name: "Organic Cotton T-Shirt", quantity: 1, total: "29.99" }
      ],
      billing: { first_name: "John", last_name: "Doe", email: "john@example.com" },
      shipping: { first_name: "John", last_name: "Doe" }
    },
    {
      id: 102,
      status: "processing",
      currency: "USD",
      total: 199.99,
      date_created: "2024-02-26T14:15:00",
      line_items: [
        { product_id: 2, name: "Smart Fitness Watch", quantity: 1, total: "199.99" }
      ],
      billing: { first_name: "Jane", last_name: "Smith", email: "jane@example.com" },
      shipping: { first_name: "Jane", last_name: "Smith" }
    },
    {
      id: 103,
      status: "shipped",
      currency: "USD",
      total: 149.97,
      date_created: "2024-02-24T09:20:00",
      line_items: [
        { product_id: 4, name: "Artisan Coffee Beans", quantity: 2, total: "49.98" },
        { product_id: 5, name: "Minimalist Desk Lamp", quantity: 1, total: "89.99" },
        { product_id: 6, name: "Yoga Mat Pro", quantity: 1, total: "59.99" }
      ],
      billing: { first_name: "Mike", last_name: "Johnson", email: "mike@example.com" },
      shipping: { first_name: "Mike", last_name: "Johnson" }
    }
  ];

  constructor() {}

  /**
   * Get demo products with optional filtering
   */
  getDemoProducts(params?: {
    featured?: boolean;
    on_sale?: boolean;
    category?: number;
    per_page?: number;
    orderby?: string;
  }): Observable<DemoProduct[]> {
    let products = [...this.demoProducts];

    // Apply filters
    if (params?.featured) {
      products = products.filter(p => p.featured);
    }
    if (params?.on_sale) {
      products = products.filter(p => p.on_sale);
    }
    if (params?.category) {
      products = products.filter(p => 
        p.categories.some(c => c.id === params.category)
      );
    }

    // Apply ordering
    if (params?.orderby === 'rand') {
      products = this.shuffleArray(products);
    } else if (params?.orderby === 'date') {
      products = products.sort((a, b) => 
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      );
    }

    // Apply pagination
    if (params?.per_page) {
      products = products.slice(0, params.per_page);
    }

    // Simulate API delay
    return of(products).pipe(delay(500));
  }

  /**
   * Get a single demo product by ID
   */
  getDemoProduct(id: number): Observable<DemoProduct | null> {
    const product = this.demoProducts.find(p => p.id === id);
    return of(product || null).pipe(delay(300));
  }

  /**
   * Get demo categories
   */
  getDemoCategories(params?: { per_page?: number }): Observable<DemoCategory[]> {
    let categories = [...this.demoCategories];
    
    if (params?.per_page) {
      categories = categories.slice(0, params.per_page);
    }

    return of(categories).pipe(delay(400));
  }

  /**
   * Get demo orders for a user
   */
  getDemoOrders(): Observable<DemoOrder[]> {
    return of([...this.demoOrders]).pipe(delay(600));
  }

  /**
   * Get a single demo order
   */
  getDemoOrder(id: number): Observable<DemoOrder | null> {
    const order = this.demoOrders.find(o => o.id === id);
    return of(order || null).pipe(delay(300));
  }

  /**
   * Search demo products
   */
  searchDemoProducts(query: string): Observable<DemoProduct[]> {
    const searchTerm = query.toLowerCase();
    const results = this.demoProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.short_description.toLowerCase().includes(searchTerm)
    );

    return of(results).pipe(delay(400));
  }

  /**
   * Create a demo order (for testing checkout)
   */
  createDemoOrder(orderData: any): Observable<DemoOrder> {
    const newOrder: DemoOrder = {
      id: Math.floor(Math.random() * 1000) + 200,
      status: "processing",
      currency: orderData.currency || "USD",
      total: orderData.total || 0,
      date_created: new Date().toISOString(),
      line_items: orderData.line_items || [],
      billing: orderData.billing || {},
      shipping: orderData.shipping || {}
    };

    // Add to demo orders
    this.demoOrders.unshift(newOrder);

    return of(newOrder).pipe(delay(1000));
  }

  /**
   * Get related products for a given product
   */
  getRelatedDemoProducts(productId: number): Observable<DemoProduct[]> {
    const product = this.demoProducts.find(p => p.id === productId);
    if (!product) return of([]);

    // Find products in same categories
    const relatedProducts = this.demoProducts.filter(p => 
      p.id !== productId && 
      p.categories.some(cat => 
        product.categories.some(pCat => pCat.id === cat.id)
      )
    ).slice(0, 4);

    return of(relatedProducts).pipe(delay(300));
  }

  /**
   * Get featured demo products
   */
  getFeaturedDemoProducts(): Observable<DemoProduct[]> {
    const featured = this.demoProducts.filter(p => p.featured);
    return of(featured).pipe(delay(300));
  }

  /**
   * Get on sale demo products
   */
  getOnSaleDemoProducts(): Observable<DemoProduct[]> {
    const onSale = this.demoProducts.filter(p => p.on_sale);
    return of(onSale).pipe(delay(300));
  }

  /**
   * Get new arrival demo products
   */
  getNewArrivalDemoProducts(): Observable<DemoProduct[]> {
    const newArrivals = [...this.demoProducts]
      .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
      .slice(0, 6);
    
    return of(newArrivals).pipe(delay(300));
  }

  /**
   * Shuffle array utility
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Check if demo mode is enabled
   */
  isDemoMode(): boolean {
    // This would typically check the configuration service
    return true; // For now, always return true for demo service
  }

  /**
   * Get demo user data
   */
  getDemoUser(): any {
    return {
      id: 1,
      email: "demo@example.com",
      first_name: "Demo",
      last_name: "User",
      display_name: "Demo User",
      username: "demouser",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      date_registered: "2024-01-01T00:00:00"
    };
  }

  /**
   * Get demo addresses
   */
  getDemoAddresses(): any[] {
    return [
      {
        id: 1,
        type: "billing",
        is_default: true,
        first_name: "Demo",
        last_name: "User",
        company: "Demo Company",
        address_1: "123 Demo Street",
        address_2: "Apt 4B",
        city: "Demo City",
        state: "Demo State",
        postcode: "12345",
        country: "US",
        email: "demo@example.com",
        phone: "+1-555-123-4567"
      },
      {
        id: 2,
        type: "shipping",
        is_default: false,
        first_name: "Demo",
        last_name: "User",
        address_1: "456 Shipping Lane",
        city: "Shipping City",
        state: "Demo State",
        postcode: "67890",
        country: "US",
        phone: "+1-555-987-6543"
      }
    ];
  }
}