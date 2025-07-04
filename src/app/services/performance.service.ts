
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private performanceConfig: any;

  constructor(private configService: ConfigService) {
    this.configService.getConfig$().subscribe(config => {
      this.performanceConfig = config?.performance || {};
    });
  }

  isCachingEnabled(): boolean {
    return this.performanceConfig?.enableCaching !== false;
  }

  getCacheTimeout(): number {
    return this.performanceConfig?.cacheTimeout || 300;
  }

  isImageOptimizationEnabled(): boolean {
    return this.performanceConfig?.enableImageOptimization !== false;
  }

  isLazyLoadingEnabled(): boolean {
    return this.performanceConfig?.enableLazyLoading !== false;
  }

  setupPerformanceOptimizations(): void {
    if (this.isImageOptimizationEnabled()) {
      this.enableImageOptimization();
    }
    
    if (this.isLazyLoadingEnabled()) {
      this.enableLazyLoading();
    }
  }

  private enableImageOptimization(): void {
    // Add image optimization logic
    console.log('Image optimization enabled');
  }

  private enableLazyLoading(): void {
    // Add lazy loading logic
    console.log('Lazy loading enabled');
  }
}
