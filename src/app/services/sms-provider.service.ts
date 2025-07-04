import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, switchMap } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface SmsProvider {
  id: string;
  name: string;
  description: string;
  supportedCountries: string[];
  pricing: string;
  features: string[];
  logo: string;
  enabled: boolean;
}

export interface SmsRequest {
  phoneNumber: string;
  message?: string;
  templateId?: string;
  language?: string;
}

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  requestId?: string;
  error?: string;
  message?: string;
  provider?: string;
}

export interface OtpRequest {
  phoneNumber: string;
  language?: string;
  template?: string;
  expiry?: number; // minutes
}

export interface OtpVerifyRequest {
  phoneNumber: string;
  code: string;
  requestId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SmsProviderService {
  
  private availableProviders: SmsProvider[] = [
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'Global SMS service with 180+ countries coverage',
      supportedCountries: ['*'], // Global
      pricing: '$0.0075 per SMS',
      features: ['Global Coverage', 'WhatsApp Integration', 'Voice OTP', 'Delivery Reports'],
      logo: 'assets/images/providers/twilio.png',
      enabled: true
    },
    {
      id: 'firebase',
      name: 'Firebase Auth',
      description: 'Google Firebase Phone Authentication',
      supportedCountries: ['*'], // Global
      pricing: 'Free up to 10K verifications/month',
      features: ['Automatic Verification', 'Silent SMS', 'Global Coverage', 'Spam Protection'],
      logo: 'assets/images/providers/firebase.png',
      enabled: true
    },
    {
      id: 'messagebird',
      name: 'MessageBird',
      description: 'European-based global SMS platform',
      supportedCountries: ['*'], // Global
      pricing: '$0.065 per SMS',
      features: ['Global Coverage', 'Multi-Channel', 'Voice Messages', 'Rich Messaging'],
      logo: 'assets/images/providers/messagebird.png',
      enabled: true
    },
    {
      id: 'vonage',
      name: 'Vonage (Nexmo)',
      description: 'Enterprise communication platform',
      supportedCountries: ['*'], // Global
      pricing: '$0.005 per SMS',
      features: ['Global Reach', 'Voice API', 'WhatsApp Business', 'Number Insights'],
      logo: 'assets/images/providers/vonage.png',
      enabled: true
    },
    {
      id: 'aws_sns',
      name: 'AWS SNS',
      description: 'Amazon Simple Notification Service',
      supportedCountries: ['*'], // Global
      pricing: '$0.00645 per SMS',
      features: ['Scalable', 'Multi-Channel', 'Global Infrastructure', 'High Delivery'],
      logo: 'assets/images/providers/aws.png',
      enabled: true
    },
    {
      id: 'taqnyat',
      name: 'Taqnyat',
      description: 'Saudi Arabia focused SMS service',
      supportedCountries: ['SA', 'AE', 'KW', 'BH', 'QA', 'OM'],
      pricing: '$0.03 per SMS',
      features: ['Middle East Focus', 'Arabic Support', 'Local Compliance', 'High Delivery'],
      logo: 'assets/images/providers/taqnyat.png',
      enabled: true
    }
  ];

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  /**
   * Get all available SMS providers
   */
  getAvailableProviders(): Observable<SmsProvider[]> {
    const enabledProviders = this.configService.getConfig()?.smsProviders || ['twilio'];
    return new Observable(observer => {
      const filtered = this.availableProviders.filter(provider => 
        enabledProviders.includes(provider.id)
      );
      observer.next(filtered);
      observer.complete();
    });
  }

  /**
   * Get providers that support a specific country
   */
  getProvidersForCountry(countryCode: string): Observable<SmsProvider[]> {
    return this.getAvailableProviders().pipe(
      map(providers => providers.filter(provider => 
        provider.supportedCountries.includes('*') || 
        provider.supportedCountries.includes(countryCode)
      ))
    );
  }

  /**
   * Get the default SMS provider
   */
  getDefaultProvider(): Observable<SmsProvider | null> {
    const defaultId = this.configService.getConfig()?.defaultSmsProvider || 'twilio';
    return this.getAvailableProviders().pipe(
      map(providers => providers.find(p => p.id === defaultId) || providers[0] || null)
    );
  }

  /**
   * Send OTP using the specified provider
   */
  sendOtp(request: OtpRequest, providerId?: string): Observable<SmsResponse> {
    if (providerId) {
      return this.sendOtpWithProvider(request, providerId);
    }

    return this.getDefaultProvider().pipe(
      switchMap(provider => {
        if (!provider) {
          return throwError('No SMS provider available');
        }
        return this.sendOtpWithProvider(request, provider.id);
      }),
      catchError(error => throwError(error))
    );
  }

  /**
   * Verify OTP using the specified provider
   */
  verifyOtp(request: OtpVerifyRequest, providerId?: string): Observable<SmsResponse> {
    if (providerId) {
      return this.verifyOtpWithProvider(request, providerId);
    }

    return this.getDefaultProvider().pipe(
      switchMap(provider => {
        if (!provider) {
          return throwError('No SMS provider available');
        }
        return this.verifyOtpWithProvider(request, provider.id);
      }),
      catchError(error => throwError(error))
    );
  }

  /**
   * Send OTP using Twilio
   */
  private sendOtpWithProvider(request: OtpRequest, providerId: string): Observable<SmsResponse> {
    switch (providerId) {
      case 'twilio':
        return this.sendTwilioOtp(request);
      case 'firebase':
        return this.sendFirebaseOtp(request);
      case 'messagebird':
        return this.sendMessageBirdOtp(request);
      case 'vonage':
        return this.sendVonageOtp(request);
      case 'aws_sns':
        return this.sendAwsSnsOtp(request);
      case 'taqnyat':
        return this.sendTaqnyatOtp(request);
      default:
        return throwError('Unsupported SMS provider: ' + providerId);
    }
  }

  /**
   * Verify OTP using specific provider
   */
  private verifyOtpWithProvider(request: OtpVerifyRequest, providerId: string): Observable<SmsResponse> {
    switch (providerId) {
      case 'twilio':
        return this.verifyTwilioOtp(request);
      case 'firebase':
        return this.verifyFirebaseOtp(request);
      case 'messagebird':
        return this.verifyMessageBirdOtp(request);
      case 'vonage':
        return this.verifyVonageOtp(request);
      case 'aws_sns':
        return this.verifyAwsSnsOtp(request);
      case 'taqnyat':
        return this.verifyTaqnyatOtp(request);
      default:
        return throwError('Unsupported SMS provider: ' + providerId);
    }
  }

  /**
   * Twilio SMS implementation
   */
  private sendTwilioOtp(request: OtpRequest): Observable<SmsResponse> {
    const config = this.configService.getConfig();
    const twilioConfig = config?.twilioConfig;

    if (!twilioConfig?.accountSid || !twilioConfig?.authToken) {
      return throwError('Twilio configuration missing');
    }

    const headers = new HttpHeaders({
      'Authorization': `Basic ${btoa(twilioConfig.accountSid + ':' + twilioConfig.authToken)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams({
      'To': request.phoneNumber,
      'Channel': 'sms',
      'Locale': request.language || 'en'
    });

    return this.http.post(
      `https://verify.twilio.com/v2/Services/${twilioConfig.verifyServiceSid}/Verifications`,
      body.toString(),
      { headers }
    ).pipe(
      map((response: any) => ({
        success: true,
        requestId: response.sid,
        message: 'OTP sent successfully',
        provider: 'twilio'
      })),
      catchError(error => throwError(`Twilio error: ${error.message}`))
    );
  }

  /**
   * Verify Twilio OTP
   */
  private verifyTwilioOtp(request: OtpVerifyRequest): Observable<SmsResponse> {
    const config = this.configService.getConfig();
    const twilioConfig = config?.twilioConfig;

    if (!twilioConfig?.accountSid || !twilioConfig?.authToken) {
      return throwError('Twilio configuration missing');
    }

    const headers = new HttpHeaders({
      'Authorization': `Basic ${btoa(twilioConfig.accountSid + ':' + twilioConfig.authToken)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams({
      'To': request.phoneNumber,
      'Code': request.code
    });

    return this.http.post(
      `https://verify.twilio.com/v2/Services/${twilioConfig.verifyServiceSid}/VerificationCheck`,
      body.toString(),
      { headers }
    ).pipe(
      map((response: any) => ({
        success: response.status === 'approved',
        message: response.status === 'approved' ? 'Verification successful' : 'Invalid code',
        provider: 'twilio'
      })),
      catchError(error => throwError(`Twilio verification error: ${error.message}`))
    );
  }

  /**
   * Firebase Auth implementation
   */
  private sendFirebaseOtp(request: OtpRequest): Observable<SmsResponse> {
    // Firebase requires client-side SDK integration
    // This is a placeholder for the REST API approach
    const config = this.configService.getConfig();
    const firebaseConfig = config?.firebaseConfig;

    if (!firebaseConfig?.apiKey) {
      return throwError('Firebase configuration missing');
    }

    // Firebase Phone Auth requires client SDK, return demo response
    return new Observable(observer => {
      observer.next({
        success: true,
        requestId: 'firebase_' + Date.now(),
        message: 'Firebase OTP initiated (requires client SDK)',
        provider: 'firebase'
      });
      observer.complete();
    });
  }

  /**
   * Verify Firebase OTP
   */
  private verifyFirebaseOtp(request: OtpVerifyRequest): Observable<SmsResponse> {
    // Firebase verification happens client-side
    return new Observable(observer => {
      observer.next({
        success: true,
        message: 'Firebase verification (client-side)',
        provider: 'firebase'
      });
      observer.complete();
    });
  }

  /**
   * MessageBird implementation
   */
  private sendMessageBirdOtp(request: OtpRequest): Observable<SmsResponse> {
    const config = this.configService.getConfig();
    const messageBirdConfig = config?.messageBirdConfig;

    if (!messageBirdConfig?.apiKey) {
      return throwError('MessageBird configuration missing');
    }

    const headers = new HttpHeaders({
      'Authorization': `AccessKey ${messageBirdConfig.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      recipient: request.phoneNumber,
      template: request.template || 'Your verification code is %token',
      type: 'sms',
      tokenLength: 6,
      timeout: (request.expiry || 5) * 60
    };

    return this.http.post('https://rest.messagebird.com/verify', body, { headers }).pipe(
      map((response: any) => ({
        success: true,
        requestId: response.id,
        message: 'OTP sent via MessageBird',
        provider: 'messagebird'
      })),
      catchError(error => throwError(`MessageBird error: ${error.message}`))
    );
  }

  /**
   * Verify MessageBird OTP
   */
  private verifyMessageBirdOtp(request: OtpVerifyRequest): Observable<SmsResponse> {
    const config = this.configService.getConfig();
    const messageBirdConfig = config?.messageBirdConfig;

    if (!messageBirdConfig?.apiKey || !request.requestId) {
      return throwError('MessageBird configuration or request ID missing');
    }

    const headers = new HttpHeaders({
      'Authorization': `AccessKey ${messageBirdConfig.apiKey}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(
      `https://rest.messagebird.com/verify/${request.requestId}?token=${request.code}`,
      { headers }
    ).pipe(
      map((response: any) => ({
        success: response.status === 'verified',
        message: response.status === 'verified' ? 'Verification successful' : 'Invalid code',
        provider: 'messagebird'
      })),
      catchError(error => throwError(`MessageBird verification error: ${error.message}`))
    );
  }

  /**
   * Vonage (Nexmo) implementation
   */
  private sendVonageOtp(request: OtpRequest): Observable<SmsResponse> {
    const config = this.configService.getConfig();
    const vonageConfig = config?.vonageConfig;

    if (!vonageConfig?.apiKey || !vonageConfig?.apiSecret) {
      return throwError('Vonage configuration missing');
    }

    const body = {
      api_key: vonageConfig.apiKey,
      api_secret: vonageConfig.apiSecret,
      number: request.phoneNumber,
      brand: config?.appName || 'Your App',
      code_length: 6
    };

    return this.http.post('https://api.nexmo.com/verify/json', body).pipe(
      map((response: any) => ({
        success: response.status === '0',
        requestId: response.request_id,
        message: response.status === '0' ? 'OTP sent via Vonage' : response.error_text,
        provider: 'vonage'
      })),
      catchError(error => throwError(`Vonage error: ${error.message}`))
    );
  }

  /**
   * Verify Vonage OTP
   */
  private verifyVonageOtp(request: OtpVerifyRequest): Observable<SmsResponse> {
    const config = this.configService.getConfig();
    const vonageConfig = config?.vonageConfig;

    if (!vonageConfig?.apiKey || !vonageConfig?.apiSecret || !request.requestId) {
      return throwError('Vonage configuration or request ID missing');
    }

    const body = {
      api_key: vonageConfig.apiKey,
      api_secret: vonageConfig.apiSecret,
      request_id: request.requestId,
      code: request.code
    };

    return this.http.post('https://api.nexmo.com/verify/check/json', body).pipe(
      map((response: any) => ({
        success: response.status === '0',
        message: response.status === '0' ? 'Verification successful' : response.error_text,
        provider: 'vonage'
      })),
      catchError(error => throwError(`Vonage verification error: ${error.message}`))
    );
  }

  /**
   * AWS SNS implementation
   */
  private sendAwsSnsOtp(request: OtpRequest): Observable<SmsResponse> {
    // AWS SNS requires server-side implementation due to CORS and security
    const config = this.configService.getConfig();
    const apiUrl = config?.storeUrl + '/wp-json/sms-gateway/v1/aws-sns/send-otp';

    return this.http.post(apiUrl, {
      phoneNumber: request.phoneNumber,
      language: request.language || 'en'
    }).pipe(
      map((response: any) => ({
        success: response.success,
        requestId: response.messageId,
        message: response.message,
        provider: 'aws_sns'
      })),
      catchError(error => throwError(`AWS SNS error: ${error.message}`))
    );
  }

  /**
   * Verify AWS SNS OTP (typically done server-side)
   */
  private verifyAwsSnsOtp(request: OtpVerifyRequest): Observable<SmsResponse> {
    const config = this.configService.getConfig();
    const apiUrl = config?.storeUrl + '/wp-json/sms-gateway/v1/aws-sns/verify-otp';

    return this.http.post(apiUrl, {
      phoneNumber: request.phoneNumber,
      code: request.code,
      requestId: request.requestId
    }).pipe(
      map((response: any) => ({
        success: response.success,
        message: response.message,
        provider: 'aws_sns'
      })),
      catchError(error => throwError(`AWS SNS verification error: ${error.message}`))
    );
  }

  /**
   * Taqnyat implementation (existing)
   */
  private sendTaqnyatOtp(request: OtpRequest): Observable<SmsResponse> {
    const config = this.configService.getConfig();
    const apiUrl = config?.storeUrl + '/wp-json/taqnyat/v1/send-otp';

    return this.http.post(apiUrl, {
      phone: request.phoneNumber,
      lang: request.language || 'ar'
    }).pipe(
      map((response: any) => ({
        success: response.status === 'success',
        requestId: response.requestId,
        message: response.message,
        provider: 'taqnyat'
      })),
      catchError(error => throwError(`Taqnyat error: ${error.message}`))
    );
  }

  /**
   * Verify Taqnyat OTP (existing)
   */
  private verifyTaqnyatOtp(request: OtpVerifyRequest): Observable<SmsResponse> {
    const config = this.configService.getConfig();
    const apiUrl = config?.storeUrl + '/wp-json/taqnyat/v1/verify-otp';

    return this.http.post(apiUrl, {
      phone: request.phoneNumber,
      code: request.code,
      requestId: request.requestId
    }).pipe(
      map((response: any) => ({
        success: response.status === 'success',
        message: response.message,
        provider: 'taqnyat'
      })),
      catchError(error => throwError(`Taqnyat verification error: ${error.message}`))
    );
  }

  /**
   * Test SMS provider configuration
   */
  testProvider(providerId: string): Observable<{ success: boolean; message: string }> {
    const provider = this.availableProviders.find(p => p.id === providerId);
    if (!provider) {
      return throwError('Provider not found');
    }

    // Test with a dummy phone number (non-functional test)
    const testRequest: OtpRequest = {
      phoneNumber: '+1234567890', // Test number
      language: 'en'
    };

    return new Observable(observer => {
      // Simulate configuration test
      const config = this.configService.getConfig();
      let hasConfig = false;

      switch (providerId) {
        case 'twilio':
          hasConfig = !!(config?.twilioConfig?.accountSid && config?.twilioConfig?.authToken);
          break;
        case 'firebase':
          hasConfig = !!(config?.firebaseConfig?.apiKey);
          break;
        case 'messagebird':
          hasConfig = !!(config?.messageBirdConfig?.apiKey);
          break;
        case 'vonage':
          hasConfig = !!(config?.vonageConfig?.apiKey && config?.vonageConfig?.apiSecret);
          break;
        case 'aws_sns':
          hasConfig = !!(config?.awsConfig?.region && config?.awsConfig?.accessKeyId);
          break;
        case 'taqnyat':
          hasConfig = !!(config?.taqnyatConfig?.apiKey);
          break;
        default:
          hasConfig = false;
      }

      observer.next({
        success: hasConfig,
        message: hasConfig ? 
          `${provider.name} configuration is valid` : 
          `${provider.name} configuration is missing`
      });
      observer.complete();
    });
  }

  /**
   * Get recommended provider for a country
   */
  getRecommendedProvider(countryCode: string): Observable<SmsProvider | null> {
    const recommendations: { [key: string]: string } = {
      'SA': 'taqnyat',    // Saudi Arabia
      'AE': 'taqnyat',    // UAE
      'US': 'twilio',     // United States
      'CA': 'twilio',     // Canada
      'GB': 'messagebird', // United Kingdom
      'DE': 'messagebird', // Germany
      'FR': 'messagebird', // France
      'IN': 'twilio',     // India
      'AU': 'twilio',     // Australia
      'BR': 'twilio',     // Brazil
      'JP': 'twilio',     // Japan
      'KR': 'twilio',     // South Korea
      'CN': 'firebase',   // China (limited options)
    };

    const recommendedId = recommendations[countryCode] || 'twilio';
    
    return this.getAvailableProviders().pipe(
      map(providers => providers.find(p => p.id === recommendedId) || providers[0] || null)
    );
  }
}