
export interface AppConfig {
  // Basic Configuration
  appName: string;
  storeName: string;
  storeUrl: string;
  
  // API Configuration
  apiUrl: string;
  consumerKey: string;
  consumerSecret: string;
  
  // WordPress Configuration
  wordpressUrl: string;
  
  // Payment Gateways
  moyasarPublishableKey: string;
  moyasarSecretKey?: string;
  
  // Authentication
  authCode: string;
  jwtAuthUrl: string;
  
  // Notifications
  oneSignalAppId: string;
  
  // SMS Service
  taqnyatApiKey: string;
  
  // Demo Settings
  useDemoData: boolean;
  useDemoPayments: boolean;
  allowDemoCheckout: boolean;
  
  // Payment Gateway Settings
  enabledPaymentGateways: string[];
  paymentGateways?: {
    stripe?: {
      publishableKey: string;
      secretKey: string;
      webhookSecret?: string;
    };
    paypal?: {
      clientId: string;
      clientSecret: string;
      environment: 'sandbox' | 'live';
    };
    moyasar?: {
      publishableKey: string;
      secretKey: string;
    };
  };
  
  // Backward compatibility
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
}
