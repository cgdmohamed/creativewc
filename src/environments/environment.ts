
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

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
  
  // Demo mode settings
  useDemoData: false,       // Set to false to use real API data
  useDemoPayments: true,   // Set to true to use demo payment gateways
  
  // Demo data settings
  allowDemoCheckout: true  // Allow checkout flow in demo mode with demonstration UI
};

// IMPORTANT: Replace the placeholder values above with your actual API keys
// See environment.example.ts for more information

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
