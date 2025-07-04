
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private analyticsConfig: any;

  constructor(private configService: ConfigService) {
    this.configService.getConfig$().subscribe(config => {
      this.analyticsConfig = config?.analytics || {};
      this.initializeAnalytics();
    });
  }

  private initializeAnalytics(): void {
    if (this.isGoogleAnalyticsEnabled()) {
      this.initializeGoogleAnalytics();
    }
    
    if (this.isFacebookPixelEnabled()) {
      this.initializeFacebookPixel();
    }
  }

  isGoogleAnalyticsEnabled(): boolean {
    return this.analyticsConfig?.enableGoogleAnalytics && this.analyticsConfig?.googleAnalyticsId;
  }

  isFacebookPixelEnabled(): boolean {
    return this.analyticsConfig?.enableFacebookPixel && this.analyticsConfig?.facebookPixelId;
  }

  private initializeGoogleAnalytics(): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.analyticsConfig.googleAnalyticsId}`;
    document.head.appendChild(script);

    window.gtag = window.gtag || function() {
      (window.gtag as any).q = (window.gtag as any).q || [];
      (window.gtag as any).q.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.analyticsConfig.googleAnalyticsId);
  }

  private initializeFacebookPixel(): void {
    window.fbq = window.fbq || function() {
      (window.fbq as any).q = (window.fbq as any).q || [];
      (window.fbq as any).q.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    window.fbq('init', this.analyticsConfig.facebookPixelId);
    window.fbq('track', 'PageView');
  }

  trackEvent(eventName: string, parameters?: any): void {
    if (this.isGoogleAnalyticsEnabled()) {
      window.gtag('event', eventName, parameters);
    }

    if (this.isFacebookPixelEnabled()) {
      window.fbq('track', eventName, parameters);
    }
  }
}
