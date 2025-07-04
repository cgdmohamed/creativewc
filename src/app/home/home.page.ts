import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Product } from '../interfaces/product.interface';
import { Category } from '../interfaces/category.interface';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { NotificationService } from '../services/notification.service';
import { ConfigService } from '../services/config.service';
import { environment } from '../../environments/environment';

// Required for Swiper
import { register } from 'swiper/element/bundle';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.fixed.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, OnDestroy, AfterViewInit {
  featuredProducts: Product[] = [];
  newProducts: Product[] = [];
  onSaleProducts: Product[] = [];
  categories: Category[] = [];
  isLoading = true;
  currentLanguage: string = 'en';
  cartItemCount = 0;
  cartSubscription: Subscription;
  defaultCurrency: string = 'USD';
  featuresEnabled: {
    wishlist: boolean;
    reviews: boolean;
    recommendations: boolean;
    guestCheckout: boolean;
  } = {
    wishlist: true,
    reviews: true,
    recommendations: true,
    guestCheckout: true
  };
  private wishlistSubscription: Subscription;
  private notificationSubscription: Subscription;
  unreadNotificationCount: number = 0;

  // Slider options for banner
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    pagination: true,
    loop: true
  };

  // Slider options for categories horizontal scroll
  categorySlideOpts = {
    slidesPerView: 3.5,
    spaceBetween: 10,
    freeMode: true,
    breakpoints: {
      // when window width is >= 576px
      576: {
        slidesPerView: 4.5,
      },
      // when window width is >= 992px
      992: {
        slidesPerView: 6.5,
      }
    }
  };

  // Grid layout for products (2 columns)
  productSlideOpts = {
    slidesPerView: 2.2,
    spaceBetween: 10,
    freeMode: true,
    grid: {
      rows: 1,
      fill: 'row'
    },
    breakpoints: {
      // when window width is >= 576px
      576: {
        slidesPerView: 3.2,
      },
      // when window width is >= 992px
      992: {
        slidesPerView: 4.2,
      }
    }
  };
  config: any;
  appName: string = '';
  appSlogan: string = '';
  storeDescription: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private notificationService: NotificationService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private configService: ConfigService
  ) {
    this.cartSubscription = this.cartService.cart.subscribe(cart => {
      this.cartItemCount = cart.itemCount;
    });

    this.wishlistSubscription = this.wishlistService.wishlist.subscribe(() => {
      // Just trigger a refresh when wishlist changes
    });

    // Subscribe to notification count changes
    this.notificationSubscription = this.notificationService.unreadCount.subscribe(count => {
      this.unreadNotificationCount = count;
    });
  }

  // Navigate to notifications page
  navigateToNotifications() {
    console.log('Home component: calling notification service navigation method');
    // Use the centralized notification service navigation method
    this.notificationService.navigateToNotificationsPage();
  }

  // Show search prompt
  async showSearchPrompt() {
    const alert = await this.alertController.create({
      header: 'بحث',
      message: 'البحث عن منتجات',
      inputs: [
        {
          name: 'query',
          type: 'text',
          placeholder: 'أدخل كلمة البحث هنا'
        }
      ],
      buttons: [
        {
          text: 'إلغاء',
          role: 'cancel'
        },
        {
          text: 'بحث',
          handler: (data) => {
            if (data.query && data.query.trim() !== '') {
              this.router.navigate(['/search-results'], { 
                queryParams: { query: data.query.trim() } 
              });
            }
          }
        }
      ],
      cssClass: 'search-alert'
    });

    await alert.present();
  }

  

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }

    if (this.wishlistSubscription) {
      this.wishlistSubscription.unsubscribe();
    }

    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    // Register Swiper web components for other swiper elements in the app
    register();
  }

  // Load all data for the home page
  loadData() {
    this.isLoading = true;

    // Log the current environment to help with debugging
    console.log(`Home page loadData: Running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
    console.log(`Environment settings: useDemoData=${environment.useDemoData}, apiUrl=${environment.apiUrl}`);

    // No delay - load data immediately
    // Get categories
    this.productService.getCategories().subscribe(
      (categories) => {
        this.categories = categories;
        console.log(`Loaded ${categories.length} categories from API`);
      },
      (error) => {
        console.error('Error loading categories', error);
      }
    );

    // Get a large batch of random products first - we'll use these to ensure we always have 5+ products
    this.productService.getRandomProducts(30).subscribe(
      (randomProducts) => {
        console.log(`Got ${randomProducts.length} random products from API to use across all sections`);

        // Create an array copy we can draw from
        const randomPool = [...randomProducts];

        // Process featured products with random supplementation
        this.loadFeaturedWithRandomProducts(randomPool);

        // Process new products with random supplementation
        this.loadNewWithRandomProducts(randomPool);

        // Process sale products with random supplementation
        this.loadSaleWithRandomProducts(randomPool);
      },
      (error) => {
        console.error('Error loading random product pool:', error);

        if (!environment.production) {
          // Only in development mode - try individual sections with their own random calls
          this.loadFeaturedWithRandomProducts([]);
          this.loadNewWithRandomProducts([]);
          this.loadSaleWithRandomProducts([]);
        } else {
          // In production, don't try to get random products if the main call fails
          console.log('In production mode - not using random products as fallback');
          this.loadFeaturedWithRandomProducts([]);
          this.loadNewWithRandomProducts([]);
          this.loadSaleWithRandomProducts([]);
          // Set timeout to hide loading indicator even if no products
          setTimeout(() => {
            this.isLoading = false;
          }, 1000);
        }
      }
    );

    // Set a timeout to ensure we hide the loading indicator
    setTimeout(() => {
      this.isLoading = false;
    }, 2000); 
  }

  // Load featured products with random supplementation
  private loadFeaturedWithRandomProducts(randomPool: Product[]) {
    this.productService.getFeaturedProducts().subscribe(
      (products) => {
        // Start with the featured products from API
        this.featuredProducts = products;

        // If we don't have at least 5 products AND we're not in production, add from random pool
        if (this.featuredProducts.length < 5 && !environment.production) {
          if (randomPool.length > 0) {
            // If we have random products in our pool, use them
            const neededCount = 5 - this.featuredProducts.length;
            const randomToAdd = randomPool.splice(0, neededCount);
            this.featuredProducts = [...this.featuredProducts, ...randomToAdd];
            console.log(`Added ${randomToAdd.length} random products from pool to featured products`);
          } else {
            // Otherwise get more random products specifically for this section (dev mode only)
            this.getRandomProductsForSection('featured', 5 - this.featuredProducts.length);
          }
        }
      },
      (error) => {
        console.error('Error loading featured products:', error);

        if (!environment.production) {
          // Only in development mode - add random products if API call fails
          if (randomPool.length > 0) {
            // If featured fetch fails but we have random products, use them
            this.featuredProducts = randomPool.splice(0, 5);
            console.log(`Used ${this.featuredProducts.length} random products from pool as featured products`);
          } else {
            // Otherwise get random products specifically for this section
            this.getRandomProductsForSection('featured', 5);
          }
        } else {
          console.log('In production mode - not using random products for featured section');
          this.featuredProducts = [];
        }
      }
    );
  }

  // Load new products with random supplementation
  private loadNewWithRandomProducts(randomPool: Product[]) {
    this.productService.getNewProducts().subscribe(
      (products) => {
        // Start with the new products from API
        this.newProducts = products;

        // If we don't have at least 5 products AND we're not in production, add from random pool
        if (this.newProducts.length < 5 && !environment.production) {
          if (randomPool.length > 0) {
            // If we have random products in our pool, use them
            const neededCount = 5 - this.newProducts.length;
            const randomToAdd = randomPool.splice(0, neededCount);
            this.newProducts = [...this.newProducts, ...randomToAdd];
            console.log(`Added ${randomToAdd.length} random products from pool to new products`);
          } else {
            // Otherwise get more random products specifically for this section (dev mode only)
            this.getRandomProductsForSection('new', 5 - this.newProducts.length);
          }
        }
      },
      (error) => {
        console.error('Error loading new products:', error);

        if (!environment.production) {
          // Only in development mode - add random products if API call fails
          if (randomPool.length > 0) {
            // If new fetch fails but we have random products, use them
            this.newProducts = randomPool.splice(0, 5);
            console.log(`Used ${this.newProducts.length} random products from pool as new products`);
          } else {
            // Otherwise get random products specifically for this section
            this.getRandomProductsForSection('new', 5);
          }
        } else {
          console.log('In production mode - not using random products for new section');
          this.newProducts = [];
        }
      }
    );
  }

  // Load sale products with random supplementation
  private loadSaleWithRandomProducts(randomPool: Product[]) {
    this.productService.getOnSaleProducts().subscribe(
      (products) => {
        // Start with the sale products from API
        this.onSaleProducts = products;

        // If we don't have at least 5 products AND we're not in production, add from random pool
        if (this.onSaleProducts.length < 5 && !environment.production) {
          if (randomPool.length > 0) {
            // If we have random products in our pool, use them
            const neededCount = 5 - this.onSaleProducts.length;
            const randomToAdd = randomPool.splice(0, neededCount);
            this.onSaleProducts = [...this.onSaleProducts, ...randomToAdd];
            console.log(`Added ${randomToAdd.length} random products from pool to sale products`);
          } else {
            // Otherwise get more random products specifically for this section (dev mode only)
            this.getRandomProductsForSection('sale', 5 - this.onSaleProducts.length);
          }
        }
      },
      (error) => {
        console.error('Error loading sale products:', error);

        if (!environment.production) {
          // Only in development mode - add random products if API call fails
          if (randomPool.length > 0) {
            // If sale fetch fails but we have random products, use them
            this.onSaleProducts = randomPool.splice(0, 5);
            console.log(`Used ${this.onSaleProducts.length} random products from pool as sale products`);
          } else {
            // Otherwise get random products specifically for this section
            this.getRandomProductsForSection('sale', 5);
          }
        } else {
          console.log('In production mode - not using random products for sale section');
          this.onSaleProducts = [];
        }
      }
    );
  }

  // Get additional random products for a specific section
  private getRandomProductsForSection(section: 'featured' | 'new' | 'sale', count: number) {
    // Do not make API calls for random products in production
    if (environment.production) {
      console.log(`In production mode - not making additional API calls for ${section} section`);
      return;
    }

    // Make a new API call to get random products (development mode only)
    this.productService.getRandomProducts(count * 2).subscribe(
      (randomProducts) => {
        // Take only what we need
        const productsToAdd = randomProducts.slice(0, count);

        // Add to the appropriate section
        if (section === 'featured') {
          this.featuredProducts = [...this.featuredProducts, ...productsToAdd];
          console.log(`Added ${productsToAdd.length} new random products to featured products`);
        } else if (section === 'new') {
          this.newProducts = [...this.newProducts, ...productsToAdd];
          console.log(`Added ${productsToAdd.length} new random products to new products`);
        } else if (section === 'sale') {
          this.onSaleProducts = [...this.onSaleProducts, ...productsToAdd];
          console.log(`Added ${productsToAdd.length} new random products to sale products`);
        }
      },
      (error) => {
        console.error(`Error getting additional random products for ${section} section:`, error);

        // Get products from other categories as a last resort - no demos
        this.getProductsFromOtherSections(section, count);
      }
    );
  }

  // Last resort - get products from other sections that already have products
  private getProductsFromOtherSections(section: 'featured' | 'new' | 'sale', count: number) {
    // Don't borrow products in production mode
    if (environment.production) {
      console.log(`In production mode - not borrowing products from other sections for ${section} section`);
      return;
    }

    // Find products from other sections we can use
    let borrowFromSections: Product[] = [];

    if (section !== 'featured' && this.featuredProducts.length > 0) {
      borrowFromSections = [...borrowFromSections, ...this.featuredProducts];
    }

    if (section !== 'new' && this.newProducts.length > 0) {
      borrowFromSections = [...borrowFromSections, ...this.newProducts];
    }

    if (section !== 'sale' && this.onSaleProducts.length > 0) {
      borrowFromSections = [...borrowFromSections, ...this.onSaleProducts];
    }

    // If we found products in other sections, use them
    if (borrowFromSections.length > 0) {
      // Shuffle to get different products each time
      const shuffled = borrowFromSections.sort(() => 0.5 - Math.random());
      const borrowedProducts = shuffled.slice(0, count);

      if (section === 'featured') {
        this.featuredProducts = [...this.featuredProducts, ...borrowedProducts];
        console.log(`Borrowed ${borrowedProducts.length} products from other sections for featured products`);
      } else if (section === 'new') {
        this.newProducts = [...this.newProducts, ...borrowedProducts];
        console.log(`Borrowed ${borrowedProducts.length} products from other sections for new products`);
      } else if (section === 'sale') {
        this.onSaleProducts = [...this.onSaleProducts, ...borrowedProducts];
        console.log(`Borrowed ${borrowedProducts.length} products from other sections for sale products`);
      }
    }
  }

  // Toggle wishlist status
  async onFavoriteChange(productId: number) {
    // Find the product in one of our lists
    const product = 
      this.featuredProducts.find(p => p.id === productId) ||
      this.newProducts.find(p => p.id === productId) ||
      this.onSaleProducts.find(p => p.id === productId);

    if (product) {
      // Toggle the product in the wishlist
      if (this.isProductInWishlist(productId)) {
        this.wishlistService.removeFromWishlist(productId);
        this.presentToast('تمت إزالة المنتج من المفضلة');
      } else {
        this.wishlistService.addToWishlist(productId);
        this.presentToast('تمت إضافة المنتج إلى المفضلة');
      }
    }
  }

  // Check if product is in wishlist
  isProductInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  // Add to cart
  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.presentToast('تمت إضافة المنتج إلى سلة التسوق');
  }

  // Handle pull to refresh
  doRefresh(event: any) {
    // Reset the loading state and arrays
    this.isLoading = true;
    this.categories = [];
    this.featuredProducts = [];
    this.newProducts = [];
    this.onSaleProducts = [];

    // Load data with skeleton loading
    this.loadData();

    // Complete the refresh after data is loaded
    setTimeout(() => {
      event.target.complete();
    }, 2000); // 2 seconds to allow for the simulated loading delay
  }

  // Show toast message
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }

  // Get product image URL with proper handling for Arabic text
  getProductImageUrl(product: any): string {
    try {
      // Check if product is a category with image
      if (product && product.src) {
        return product.src;
      }

      // Check if product has images
      if (product && product.images && product.images.length > 0) {
        return product.images[0].src;
      }
    } catch (error) {
      console.error('Error processing image URL', error);
    }

    // Return a fallback image if no product images available or error occurs
    return 'assets/images/product-placeholder.svg';
  }

  // Handle image load error
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;

    // Set a fallback image
    imgElement.src = 'assets/images/product-placeholder.svg';

    // Log the error for debugging
    console.error('Image load error:', imgElement.src);
  }

  // Ensure minimum number of products in each section
  private ensureMinimumProducts(productList: Product[], type: 'featured' | 'new' | 'sale'): void {
    if (productList.length < 5) {
      console.log(`Only got ${productList.length} ${type} products, adding random products from API to reach minimum 5`);

      // Create a set of existing product IDs to avoid duplicates
      const existingIds = new Set(productList.map(p => p.id));

      // First try to get random real products from API using our improved method
      this.productService.getRandomProducts(10).subscribe(randomProducts => {
        // Filter out duplicates
        const uniqueRandomProducts = randomProducts.filter(p => !existingIds.has(p.id));

        if (uniqueRandomProducts.length > 0) {
          // Take only what we need to reach 5 products
          const productsToAdd = uniqueRandomProducts.slice(0, 5 - productList.length);

          // Add the random products to our list
          productList.push(...productsToAdd);
          console.log(`Added ${productsToAdd.length} real API products to ${type} products`);
        } else {
          // If we somehow couldn't get any unique random products, try again with a larger batch
          // This is unlikely but handles the edge case
          this.productService.getRandomProducts(20).subscribe(
            moreRandomProducts => {
              const moreUniqueProducts = moreRandomProducts.filter(p => !existingIds.has(p.id));

              if (moreUniqueProducts.length > 0) {
                const moreToAdd = moreUniqueProducts.slice(0, 5 - productList.length);
                productList.push(...moreToAdd);
                console.log(`Added ${moreToAdd.length} real API products to ${type} products (second attempt)`);
              } else {
                // If we still can't get unique products, only then fall back to demo
                console.log(`No unique random products available for ${type}, falling back to demo products`);
                this.addRealProductsFromOtherCategories(productList, type, existingIds);
              }
            },
            error => {
              // If API call fails again, try one more approach before demo fallback
              this.addRealProductsFromOtherCategories(productList, type, existingIds);
            }
          );
        }
      }, error => {
        // If API call fails, try getting real products from other categories
        console.error(`Error fetching random products for ${type}:`, error);
        this.addRealProductsFromOtherCategories(productList, type, existingIds);
      });
    }
  }

  // Try to get real products from other categories before falling back to demo
  private addRealProductsFromOtherCategories(productList: Product[], type: 'featured' | 'new' | 'sale', existingIds: Set<number>): void {
    // Try the opposite type of products (if we need featured, try on sale, etc.)
    let otherType: 'featured' | 'new' | 'sale';
    if (type === 'featured') {
      otherType = 'sale';
    } else if (type === 'new') {
      otherType = 'featured';
    } else {
      otherType = 'new';
    }

    console.log(`Trying to get real products from ${otherType} category for ${type}`);

    // Get products from another category
    if (otherType === 'featured') {
      this.productService.getFeaturedProducts(10).subscribe(
        otherProducts => this.handleOtherCategoryProducts(otherProducts, productList, type, existingIds),
        error => this.addDemoProductsToList(productList, type, existingIds)
      );
    } else if (otherType === 'new') {
      this.productService.getNewProducts().subscribe(
        otherProducts => this.handleOtherCategoryProducts(otherProducts, productList, type, existingIds),
        error => this.addDemoProductsToList(productList, type, existingIds)
      );
    } else {
      this.productService.getOnSaleProducts().subscribe(
        otherProducts => this.handleOtherCategoryProducts(otherProducts, productList, type, existingIds),
        error => this.addDemoProductsToList(productList, type, existingIds)
      );
    }
  }

  // Handle products from another category 
  private handleOtherCategoryProducts(otherProducts: Product[], productList: Product[], type: 'featured' | 'new' | 'sale', existingIds: Set<number>): void {
    // Filter duplicates
    const uniqueOtherProducts = otherProducts.filter(p => !existingIds.has(p.id));

    if (uniqueOtherProducts.length > 0) {
      // Take only what we need
      const otherToAdd = uniqueOtherProducts.slice(0, 5 - productList.length);
      productList.push(...otherToAdd);
      console.log(`Added ${otherToAdd.length} real products from other category to ${type} products`);
    } else {
      // If we still don't have unique real products, finally fall back to demo
      this.addDemoProductsToList(productList, type, existingIds);
    }
  }

  // Helper method to add demo products when API calls fail
  private addDemoProductsToList(productList: Product[], type: 'featured' | 'new' | 'sale', existingIds: Set<number>): void {
    // Never use demo products in production mode
    if (environment.production) {
      console.log(`In production mode - not adding demo products to ${type} products`);
      return;
    }

    const mockDataService = this.productService['mockDataService'];

    if (type === 'featured') {
      mockDataService.getFeaturedProducts().subscribe(products => {
        const demoProducts = products.filter(p => !existingIds.has(p.id)).slice(0, 5 - productList.length);
        productList.push(...demoProducts);
        console.log(`Added ${demoProducts.length} demo products to ${type} products as fallback`);
      });
    } else if (type === 'new') {
      mockDataService.getNewProducts().subscribe(products => {
        const demoProducts = products.filter(p => !existingIds.has(p.id)).slice(0, 5 - productList.length);
        productList.push(...demoProducts);
        console.log(`Added ${demoProducts.length} demo products to ${type} products as fallback`);
      });
    } else if (type === 'sale') {
      mockDataService.getOnSaleProducts().subscribe(products => {
        const demoProducts = products.filter(p => !existingIds.has(p.id)).slice(0, 5 - productList.length);
        productList.push(...demoProducts);
        console.log(`Added ${demoProducts.length} demo products to ${type} products as fallback`);
      });
    }
  }

  // This was moved to the end of the file to avoid duplication

  // Load real products when a specific API call fails
  private loadDemoProducts(type: 'featured' | 'new' | 'sale'): void {
    // First try to get random products from the API using our improved method
    this.productService.getRandomProducts(10).subscribe(randomProducts => {
      console.log(`Got ${randomProducts.length} random products from API for ${type}`);

      if (randomProducts.length >= 5) {
        // We have enough products, use them
        if (type === 'featured') {
          this.featuredProducts = randomProducts.slice(0, 5);
        } else if (type === 'new') {
          this.newProducts = randomProducts.slice(0, 5);
        } else if (type === 'sale') {
          this.onSaleProducts = randomProducts.slice(0, 5);
        }
        console.log(`Used ${randomProducts.slice(0, 5).length} random API products for ${type}`);
      } else {
        // Not enough real random products, try products from other categories
        this.tryOtherCategoryProductsBeforeFallback(type, randomProducts);
      }
    }, error => {
      // If API call fails, try other API categories
      console.error(`Error fetching random products for ${type}:`, error);
      this.tryOtherCategoryProductsBeforeFallback(type, []);
    });
  }

  // Try to get products from other categories before falling back to demo
  private tryOtherCategoryProductsBeforeFallback(type: 'featured' | 'new' | 'sale', existingProducts: Product[]): void {
    // Use a different category than the one that failed
    let otherType: 'featured' | 'new' | 'sale';
    if (type === 'featured') {
      otherType = 'new';
    } else if (type === 'new') {
      otherType = 'sale';
    } else {
      otherType = 'featured';
    }

    console.log(`Trying ${otherType} products as replacements for ${type}`);

    // Try to get products from another category
    if (otherType === 'featured') {
      this.productService.getFeaturedProducts(10).subscribe(
        otherProducts => {
          if (otherProducts.length > 0) {
            // We have some products, use them
            const productsToUse = [...existingProducts, ...otherProducts].slice(0, 5);

            if (type === 'featured') {
              this.featuredProducts = productsToUse;
            } else if (type === 'new') {
              this.newProducts = productsToUse;
            } else if (type === 'sale') {
              this.onSaleProducts = productsToUse;
            }

            console.log(`Used ${productsToUse.length} products from other categories for ${type}`);
          } else {
            // Still not enough, fall back to demo
            this.finalFallbackToDemoProducts(type, existingProducts);
          }
        },
        error => this.finalFallbackToDemoProducts(type, existingProducts)
      );
    } else if (otherType === 'new') {
      this.productService.getNewProducts().subscribe(
        otherProducts => {
          if (otherProducts.length > 0) {
            // We have some products, use them
            const productsToUse = [...existingProducts, ...otherProducts].slice(0, 5);

            if (type === 'featured') {
              this.featuredProducts = productsToUse;
            } else if (type === 'new') {
              this.newProducts = productsToUse;
            } else if (type === 'sale') {
              this.onSaleProducts = productsToUse;
            }

            console.log(`Used ${productsToUse.length} products from other categories for ${type}`);
          } else {
            // Still not enough, fall back to demo
            this.finalFallbackToDemoProducts(type, existingProducts);
          }
        },
        error => this.finalFallbackToDemoProducts(type, existingProducts)
      );
    } else if (otherType === 'sale') {
      this.productService.getOnSaleProducts().subscribe(
        otherProducts => {
          if (otherProducts.length > 0) {
            // We have some products, use them
            const productsToUse = [...existingProducts, ...otherProducts].slice(0, 5);

            if (type === 'featured') {
              this.featuredProducts = productsToUse;
            } else if (type === 'new') {
              this.newProducts = productsToUse;
            } else if (type === 'sale') {
              this.onSaleProducts = productsToUse;
            }

            console.log(`Used ${productsToUse.length} products from other categories for ${type}`);
          } else {
            // Still not enough, fall back to demo
            this.finalFallbackToDemoProducts(type, existingProducts);
          }
        },
        error => this.finalFallbackToDemoProducts(type, existingProducts)
      );
    }
  }

  // Fallback to demo products when API doesn't provide enough products
  private finalFallbackToDemoProducts(type: 'featured' | 'new' | 'sale', existingProducts: Product[]): void {
    // Never use demo products in production mode
    if (environment.production) {
      console.log(`In production mode - not using demo products for ${type} section`);
      if (type === 'featured') {
        this.featuredProducts = existingProducts;
      } else if (type === 'new') {
        this.newProducts = existingProducts;
      } else if (type === 'sale') {
        this.onSaleProducts = existingProducts;
      }
      return;
    }

    const mockDataService = this.productService['mockDataService'];

    if (type === 'featured') {
      mockDataService.getFeaturedProducts().subscribe(demoProducts => {
        // If we already have some products, only add what we need to reach 5
        if (existingProducts.length > 0) {
          const neededCount = 5 - existingProducts.length;
          const productsToAdd = demoProducts.slice(0, neededCount);
          this.featuredProducts = [...existingProducts, ...productsToAdd];
          console.log(`Added ${productsToAdd.length} demo products to ${existingProducts.length} API products for ${type}`);
        } else {
          // Otherwise use all demo products
          this.featuredProducts = demoProducts.slice(0, 5);
          console.log(`Loaded ${this.featuredProducts.length} demo featured products as complete fallback`);
        }
      });
    } else if (type === 'new') {
      mockDataService.getNewProducts().subscribe(demoProducts => {
        if (existingProducts.length > 0) {
          const neededCount = 5 - existingProducts.length;
          const productsToAdd = demoProducts.slice(0, neededCount);
          this.newProducts = [...existingProducts, ...productsToAdd];
          console.log(`Added ${productsToAdd.length} demo products to ${existingProducts.length} API products for ${type}`);
        } else {          this.newProducts = demoProducts.slice(0, 5);
          console.log(`Loaded ${this.newProducts.length} demo new products as complete fallback`);
        }
      });
    } else if (type === 'sale') {
      mockDataService.getOnSaleProducts().subscribe(demoProducts => {
        if (existingProducts.length > 0) {
          const neededCount = 5 - existingProducts.length;
          const productsToAdd = demoProducts.slice(0, neededCount);
          this.onSaleProducts = [...existingProducts, ...productsToAdd];
          console.log(`Added ${productsToAdd.length} demo products to ${existingProducts.length} API products for ${type}`);
        } else {
          this.onSaleProducts = demoProducts.slice(0, 5);
          console.log(`Loaded ${this.onSaleProducts.length} demo sale products as complete fallback`);
        }
      });
    }
  }

  async ngOnInit() {
    this.isLoading = true;

    try {
      // Load configuration
      this.config = await this.configService.waitForConfig();
      this.appName = this.config.app?.appName || 'DRZN Shopping';
      this.appSlogan = this.config.app?.appSlogan || 'Shop smarter, not harder';
      this.storeDescription = this.config.app?.storeDescription || 'Your premier shopping destination';
      
      this.loadData();
      this.loadAppConfiguration();
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private loadAppConfiguration(): void {
    this.configService.getConfig$().subscribe(config => {
      if (config) {
        // Update page title with app name
        if (config.appName) {
          document.title = config.appName;
        }

        // Apply theme configuration
        if (config.theme) {
          this.applyThemeConfig(config.theme);
        }

        // Set currency display based on regional settings
        if (config.regional?.defaultCurrency) {
          this.defaultCurrency = config.regional.defaultCurrency;
        }

        // Enable/disable features based on configuration
        this.featuresEnabled = {
          wishlist: config.features?.enableWishlist || false,
          reviews: config.features?.enableReviews || false,
          recommendations: config.features?.enableRecommendations || false,
          guestCheckout: config.features?.enableGuestCheckout || false
        };
      }
    });
  }

  private applyThemeConfig(theme: any): void {
    if (theme.primaryColor) {
      document.documentElement.style.setProperty('--ion-color-primary', theme.primaryColor);
    }
    if (theme.secondaryColor) {
      document.documentElement.style.setProperty('--ion-color-secondary', theme.secondaryColor);
    }
  }
}