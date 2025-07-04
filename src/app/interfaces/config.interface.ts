
// SMS Provider Configurations
export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  verifyServiceSid: string;
  phoneNumber: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface MessageBirdConfig {
  apiKey: string;
  sender: string;
}

export interface VonageConfig {
  apiKey: string;
  apiSecret: string;
  phoneNumber: string;
}

export interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sender: string;
}

export interface TaqnyatConfig {
  apiKey: string;
  sender: string;
}

// Payment Gateway Configurations
export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
}

export interface PaypalConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'live';
}

export interface MoyasarConfig {
  publishableKey: string;
  secretKey: string;
}

export interface StcPayConfig {
  merchantId: string;
  apiKey: string;
  environment: 'test' | 'production';
}

// App Configuration Interface
export interface AppConfig {
  name: string;
  version: string;
  apiUrl: string;
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  wordpressUrl: string;
  authCode: string;
  authToken?: string;
  oneSignalAppId: string;
  moyasarPublishableKey?: string;
  moyasarSecretKey?: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  allowDemoCheckout?: boolean;
  useDemoData: boolean;
  enabledPaymentGateways: string[];

  storeDescription:string;
  jwtAuthUrl?: string;
  taqnyatApiKey?: string;
  taqnyatSender?: string;
  appName?: string;
  appSlogan?: string;
  logoUrl?: string;
  splashScreenUrl?: string;
  defaultCurrency?: string;
  defaultLanguage?: string;
  supportedLanguages: string[];
  taxRate?: number;
  shippingEnabled?: boolean;
  smsProviders?:string[];
  defaultSmsProvider?: string;
  countryCode?: string;
  timezone?: string;
  dateFormat?: string;

  
  // SMS Provider configurations
  twilioConfig?: TwilioConfig;
  firebaseConfig?: FirebaseConfig;
  messageBirdConfig?: MessageBirdConfig;
  vonageConfig?: VonageConfig;
  awsConfig?: AwsConfig;
  taqnyatConfig?: TaqnyatConfig;
  
  // Payment Gateway configurations
  paymentGateways?: {
    stripe?: StripeConfig;
    paypal?: PaypalConfig;
    moyasar?: MoyasarConfig;
    stcpay?: StcPayConfig;
  };
  
  // Theme and UI
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    darkMode?: boolean;
  };
  
  // Features
  features?: {
    enablePushNotifications?: boolean;
    enableOtp?: boolean;
    enableWishlist?: boolean;
    enableReviews?: boolean;
  };
  
  // Payment methods
  paymentMethods?: {
    cod?: boolean;
    stripe?: boolean;
    paypal?: boolean;
    moyasar?: boolean;
  };
}

// Default configuration
export const defaultConfig: AppConfig = {
  name: 'DARZN',
  appName: 'DARZN App',
  appSlogan: 'Your App Slogan',
  storeDescription: 'Your Store Description',
  version: '1.0.0',
  apiUrl: 'wp-json/wc/v3',
  storeUrl: 'your-store.com',
  consumerKey: 'your-consumer-key',
  consumerSecret: 'your-consumer-secret',
  wordpressUrl: 'https://your-store.com',
  jwtAuthUrl: 'https://your-store.com/wp-json/simple-jwt-login/v1',
  authCode: 'your-auth-code',
  oneSignalAppId: 'your-onesignal-app-id',
  useDemoData: false,
  allowDemoCheckout: false,
  enabledPaymentGateways: ['cod', 'moyasar'],
  logoUrl: 'assets/logo.png',
  splashScreenUrl: 'assets/splash.png',
  defaultCurrency: 'USD',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar', 'es', 'fr', 'de'],
  taxRate: 0.0,
  shippingEnabled: true,
  smsProviders: ['twilio', 'firebase', 'messageBird', 'vonage', 'aws', 'taqnyat'],
  defaultSmsProvider: 'twilio',


  taqnyatConfig: {
    apiKey: '',
    sender: ''
  },
  
  theme: {
    primaryColor: '#ffd60a',
    secondaryColor: '#003566',
    darkMode: false
  },
  
  features: {
    enablePushNotifications: true,
    enableOtp: true,
    enableWishlist: true,
    enableReviews: true
  },
  
  paymentMethods: {
    cod: true,
    stripe: false,
    paypal: false,
    moyasar: true
  }
};
