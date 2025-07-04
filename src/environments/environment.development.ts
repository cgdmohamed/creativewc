
export const environment = {
  production: false,
  // Use local proxy to avoid CORS issues
  storeUrl: 'your-wordpress-site.com', 
  // WordPress URL (without https://)
  wordpressUrl: 'https://your-wordpress-site.com',
  // WooCommerce API - using proxy to avoid CORS issues
  apiUrl: 'wp-json/wc/v3', // Using relative path for proxy through Angular dev server (no leading slash)
  consumerKey: 'your_consumer_key',
  consumerSecret: 'your_consumer_secret',
  // Payment gateway
  moyasarPublishableKey: 'your_moyasar_key',
  // Taqnyat SMS service - will be loaded from environment variables in the service
  taqnyatApiKey: 'your_taqnyat_key',  // Will be set from EnvironmentService
  // OneSignal push notifications
  oneSignalAppId: 'your_onesignal_app_id',
  // JWT Authentication - using proxy for consistency
  jwtAuthUrl: '/wp-json/jwt-auth/v1/token',
  authCode: 'your_auth_code', // Used for Simple JWT Login plugin
  
  // Demo mode settings - enable demo data for development
  useDemoData: true,       // Set to true for development to use demo data
  useDemoPayments: true,   // Set to true to use demo payment gateways
  
  // Demo data settings
  allowDemoCheckout: true  // Allow checkout flow in demo mode with demonstration UI
};
