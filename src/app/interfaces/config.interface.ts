
// SMS Provider Configurations
export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  verifyServiceSid: string;
}

export interface FirebaseConfig {
  apiKey: string;
  projectId: string;
}

export interface MessageBirdConfig {
  apiKey: string;
}

export interface VonageConfig {
  apiKey: string;
  apiSecret: string;
}

export interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export interface TaqnyatConfig {
  apiKey: string;
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
  oneSignalAppId: string;
  moyasarPublishableKey?: string;
  allowDemoCheckout?: boolean;
  useDemoData: boolean;
  
  // SMS Provider configurations
  twilioConfig?: TwilioConfig;
  firebaseConfig?: FirebaseConfig;
  messageBirdConfig?: MessageBirdConfig;
  vonageConfig?: VonageConfig;
  awsConfig?: AwsConfig;
  taqnyatConfig?: TaqnyatConfig;
  
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
  version: '1.0.0',
  apiUrl: 'wp-json/wc/v3',
  storeUrl: 'your-store.com',
  consumerKey: 'your-consumer-key',
  consumerSecret: 'your-consumer-secret',
  wordpressUrl: 'https://your-store.com',
  authCode: 'your-auth-code',
  oneSignalAppId: 'your-onesignal-app-id',
  useDemoData: false,
  allowDemoCheckout: false,
  
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
