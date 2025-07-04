export interface AppConfig {
  // Store Configuration
  storeUrl: string;
  apiUrl: string;
  consumerKey: string;
  consumerSecret: string;
  storeName: string;
  storeDescription: string;
  wordpressUrl: string;
  authCode: string;
  jwtAuthUrl: string;
  taqnyatApiKey: string;
  oneSignalAppId: string;

  // App Branding
  appName: string;
  appSlogan: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  splashScreenUrl: string;

  // Features
  enabledPaymentGateways: string[];
  defaultCurrency: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  taxRate: number;
  shippingEnabled: boolean;

  // Payment Gateway Configuration
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
    stcpay?: {
      merchantId: string;
      apiKey: string;
      environment: 'test' | 'production';
    };
  };

  // Legacy payment config for backward compatibility
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  moyasarPublishableKey?: string;
  moyasarSecretKey?: string;
  authToken?: string;

  // SMS Provider Configuration
  smsProviders?: string[];
  defaultSmsProvider?: string;
  twilioConfig?: TwilioConfig;
  firebaseConfig?: FirebaseConfig;
  messageBirdConfig?: MessageBirdConfig;
  vonageConfig?: VonageConfig;
  awsConfig?: AwsConfig;
  taqnyatConfig?: TaqnyatConfig;

  // Regional Settings
  countryCode: string;
  timezone: string;
  dateFormat: string;

  // Demo Mode
  useDemoData: boolean;
}