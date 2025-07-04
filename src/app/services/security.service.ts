
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private securityConfig: any;

  constructor(private configService: ConfigService) {
    this.configService.getConfig$().subscribe(config => {
      this.securityConfig = config?.security || {};
    });
  }

  isCsrfEnabled(): boolean {
    return this.securityConfig?.enableCsrf !== false;
  }

  isRateLimitEnabled(): boolean {
    return this.securityConfig?.enableRateLimit !== false;
  }

  getSessionTimeout(): number {
    return this.securityConfig?.sessionTimeout || 3600;
  }

  getMaxLoginAttempts(): number {
    return this.securityConfig?.maxLoginAttempts || 5;
  }

  validateSession(): boolean {
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return false;
    
    const now = Date.now();
    const sessionTimeout = this.getSessionTimeout() * 1000;
    
    return (now - parseInt(lastActivity)) < sessionTimeout;
  }

  updateLastActivity(): void {
    localStorage.setItem('lastActivity', Date.now().toString());
  }
}
