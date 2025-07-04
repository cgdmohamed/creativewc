# International E-Commerce Mobile App

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Your WordPress Site
Edit `src/environments/environment.ts` and replace the placeholder values:

```typescript
export const environment = {
  // Replace with your WordPress site domain (without https://)
  storeUrl: 'your-wordpress-site.com',
  wordpressUrl: 'https://your-wordpress-site.com',
  
  // Your WooCommerce API keys
  consumerKey: 'your_consumer_key',
  consumerSecret: 'your_consumer_secret',
  
  // Your payment gateway keys
  moyasarPublishableKey: 'your_moyasar_key',
  
  // Your OneSignal App ID
  oneSignalAppId: 'your_onesignal_app_id',
  
  // Other settings...
};
```

### 3. Update Proxy Configuration
Edit `proxy.conf.json` and replace the target URL:

```json
{
  "/wp-json": {
    "target": "https://your-wordpress-site.com",
    // ... other settings
  }
}
```

### 4. Run the App
```bash
ionic serve
```

## What's Included

This international-plan mobile app includes:
- Multi-language support (English, Arabic, Spanish, French, German)
- International payment gateways (Stripe, PayPal, Moyasar)
- Global SMS providers (Twilio, Firebase, MessageBird, etc.)
- WordPress backend integration
- White-label configuration system

## Files You Need to Configure

1. `src/environments/environment.ts` - Your API keys and WordPress URL
2. `proxy.conf.json` - Development proxy configuration

That's it! The app will now work with your WordPress/WooCommerce backend.