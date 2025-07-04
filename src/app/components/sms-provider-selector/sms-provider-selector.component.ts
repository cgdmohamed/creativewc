import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmsProviderService, SmsProvider } from '../../services/sms-provider.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-sms-provider-selector',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>SMS Provider Configuration</ion-card-title>
        <ion-card-subtitle>Choose your SMS verification provider for global reach</ion-card-subtitle>
      </ion-card-header>
      
      <ion-card-content>
        <!-- Provider Selection -->
        <div class="provider-grid">
          <ion-item 
            *ngFor="let provider of availableProviders" 
            [class.selected]="selectedProvider?.id === provider.id"
            (click)="selectProvider(provider)"
            button
          >
            <ion-thumbnail slot="start">
              <img [src]="getProviderIcon(provider.id)" [alt]="provider.name">
            </ion-thumbnail>
            
            <ion-label>
              <h2>{{ provider.name }}</h2>
              <p>{{ provider.description }}</p>
              <p class="pricing">{{ provider.pricing }}</p>
              
              <div class="features">
                <ion-chip 
                  *ngFor="let feature of provider.features.slice(0, 2)" 
                  size="small" 
                  color="primary"
                >
                  {{ feature }}
                </ion-chip>
              </div>
              
              <div class="coverage" *ngIf="provider.supportedCountries.includes('*')">
                <ion-icon name="globe-outline" color="success"></ion-icon>
                <span>Global Coverage</span>
              </div>
              <div class="coverage" *ngIf="!provider.supportedCountries.includes('*')">
                <ion-icon name="location-outline" color="warning"></ion-icon>
                <span>{{ provider.supportedCountries.length }} Countries</span>
              </div>
            </ion-label>
            
            <ion-radio 
              slot="end" 
              [value]="provider.id" 
              [checked]="selectedProvider?.id === provider.id"
            ></ion-radio>
          </ion-item>
        </div>
        
        <!-- Configuration Form -->
        <div *ngIf="selectedProvider" class="config-form">
          <ion-item-divider>
            <ion-label>{{ selectedProvider.name }} Configuration</ion-label>
          </ion-item-divider>
          
          <!-- Twilio Configuration -->
          <div *ngIf="selectedProvider.id === 'twilio'">
            <ion-item>
              <ion-input 
                [(ngModel)]="configuration.twilio.accountSid"
                placeholder="Account SID"
                label="Account SID"
                labelPlacement="stacked"
                type="text"
              ></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-input 
                [(ngModel)]="configuration.twilio.authToken"
                placeholder="Auth Token"
                label="Auth Token"
                labelPlacement="stacked"
                type="password"
              ></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-input 
                [(ngModel)]="configuration.twilio.verifyServiceSid"
                placeholder="Verify Service SID"
                label="Verify Service SID"
                labelPlacement="stacked"
                type="text"
              ></ion-input>
            </ion-item>
          </div>
          
          <!-- Firebase Configuration -->
          <div *ngIf="selectedProvider.id === 'firebase'">
            <ion-item>
              <ion-input 
                [(ngModel)]="configuration.firebase.apiKey"
                placeholder="Firebase API Key"
                label="API Key"
                labelPlacement="stacked"
                type="password"
              ></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-input 
                [(ngModel)]="configuration.firebase.projectId"
                placeholder="your-project-id"
                label="Project ID"
                labelPlacement="stacked"
                type="text"
              ></ion-input>
            </ion-item>
          </div>
          
          <!-- MessageBird Configuration -->
          <div *ngIf="selectedProvider.id === 'messagebird'">
            <ion-item>
              <ion-input 
                [(ngModel)]="configuration.messagebird.apiKey"
                placeholder="MessageBird API Key"
                label="API Key"
                labelPlacement="stacked"
                type="password"
              ></ion-input>
            </ion-item>
          </div>
          
          <!-- Vonage Configuration -->
          <div *ngIf="selectedProvider.id === 'vonage'">
            <ion-item>
              <ion-input 
                [(ngModel)]="configuration.vonage.apiKey"
                placeholder="Vonage API Key"
                label="API Key"
                labelPlacement="stacked"
                type="text"
              ></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-input 
                [(ngModel)]="configuration.vonage.apiSecret"
                placeholder="API Secret"
                label="API Secret"
                labelPlacement="stacked"
                type="password"
              ></ion-input>
            </ion-item>
          </div>
          
          <!-- Taqnyat Configuration -->
          <div *ngIf="selectedProvider.id === 'taqnyat'">
            <ion-item>
              <ion-input 
                [(ngModel)]="configuration.taqnyat.apiKey"
                placeholder="Taqnyat API Key"
                label="API Key"
                labelPlacement="stacked"
                type="password"
              ></ion-input>
            </ion-item>
          </div>
          
          <!-- Test Configuration Button -->
          <div class="test-section">
            <ion-button 
              (click)="testConfiguration()" 
              [disabled]="testing"
              fill="outline" 
              color="primary"
            >
              <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
              {{ testing ? 'Testing...' : 'Test Configuration' }}
            </ion-button>
            
            <div *ngIf="testResult" class="test-result">
              <ion-chip [color]="testResult.success ? 'success' : 'danger'">
                <ion-icon 
                  [name]="testResult.success ? 'checkmark-circle' : 'close-circle'" 
                  slot="start"
                ></ion-icon>
                {{ testResult.message }}
              </ion-chip>
            </div>
          </div>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .provider-grid ion-item.selected {
      --background: var(--ion-color-primary-tint);
      --border-color: var(--ion-color-primary);
    }
    
    .pricing {
      font-size: 0.8em;
      color: var(--ion-color-success);
      font-weight: bold;
    }
    
    .features {
      margin-top: 8px;
    }
    
    .coverage {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      font-size: 0.8em;
    }
    
    .config-form {
      margin-top: 20px;
    }
    
    .test-section {
      margin-top: 16px;
      text-align: center;
    }
    
    .test-result {
      margin-top: 8px;
    }
    
    ion-thumbnail {
      --size: 60px;
    }
    
    ion-thumbnail img {
      border-radius: 8px;
    }
  `]
})
export class SmsProviderSelectorComponent implements OnInit {
  @Input() countryCode = 'US';
  @Output() providerSelected = new EventEmitter<any>();
  
  availableProviders: SmsProvider[] = [];
  selectedProvider: SmsProvider | null = null;
  testing = false;
  testResult: { success: boolean; message: string } | null = null;
  
  configuration = {
    twilio: {
      accountSid: '',
      authToken: '',
      verifyServiceSid: '',
      fromNumber: ''
    },
    firebase: {
      apiKey: '',
      authDomain: '',
      projectId: '',
      appId: ''
    },
    messagebird: {
      apiKey: '',
      originator: ''
    },
    vonage: {
      apiKey: '',
      apiSecret: '',
      brand: ''
    },
    taqnyat: {
      apiKey: '',
      sender: 'DRZN'
    }
  };

  constructor(
    private smsProviderService: SmsProviderService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.loadAvailableProviders();
    this.loadRecommendedProvider();
  }

  private loadAvailableProviders() {
    this.smsProviderService.getAvailableProviders().subscribe({
      next: (providers) => {
        this.availableProviders = providers;
      },
      error: (error) => {
        console.error('Error loading SMS providers:', error);
      }
    });
  }

  private loadRecommendedProvider() {
    this.smsProviderService.getRecommendedProvider(this.countryCode).subscribe({
      next: (provider) => {
        if (provider) {
          this.selectProvider(provider);
        }
      },
      error: (error) => {
        console.error('Error getting recommended provider:', error);
      }
    });
  }

  selectProvider(provider: SmsProvider) {
    this.selectedProvider = provider;
    this.testResult = null;
    
    // Load existing configuration if available
    const config = this.configService.getConfig();
    if (config) {
      switch (provider.id) {
        case 'twilio':
          if (config.twilioConfig) {
            this.configuration.twilio = { ...config.twilioConfig };
          }
          break;
        case 'firebase':
          if (config.firebaseConfig) {
            this.configuration.firebase = { ...config.firebaseConfig };
          }
          break;
        case 'messagebird':
          if (config.messageBirdConfig) {
            this.configuration.messagebird = { ...config.messageBirdConfig };
          }
          break;
        case 'vonage':
          if (config.vonageConfig) {
            this.configuration.vonage = { ...config.vonageConfig };
          }
          break;
        case 'taqnyat':
          if (config.taqnyatConfig) {
            this.configuration.taqnyat = { ...config.taqnyatConfig };
          }
          break;
      }
    }
    
    this.emitSelection();
  }

  testConfiguration() {
    if (!this.selectedProvider) return;
    
    this.testing = true;
    this.testResult = null;
    
    this.smsProviderService.testProvider(this.selectedProvider.id).subscribe({
      next: (result) => {
        this.testResult = result;
        this.testing = false;
      },
      error: (error) => {
        this.testResult = {
          success: false,
          message: error.message || 'Configuration test failed'
        };
        this.testing = false;
      }
    });
  }

  private emitSelection() {
    if (!this.selectedProvider) return;
    
    const selectionData = {
      provider: this.selectedProvider,
      configuration: this.getCurrentConfiguration()
    };
    
    this.providerSelected.emit(selectionData);
  }

  private getCurrentConfiguration() {
    if (!this.selectedProvider) return null;
    
    switch (this.selectedProvider.id) {
      case 'twilio':
        return { twilioConfig: this.configuration.twilio };
      case 'firebase':
        return { firebaseConfig: this.configuration.firebase };
      case 'messagebird':
        return { messageBirdConfig: this.configuration.messagebird };
      case 'vonage':
        return { vonageConfig: this.configuration.vonage };
      case 'taqnyat':
        return { taqnyatConfig: this.configuration.taqnyat };
      default:
        return null;
    }
  }

  getProviderIcon(providerId: string): string {
    const icons: { [key: string]: string } = {
      twilio: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y2MjIyMiIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UPC90ZXh0Pgo8L3N2Zz4K',
      firebase: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGQ0EyOCIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkY8L3RleHQ+Cjwvc3ZnPgo=',
      messagebird: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwQjNGRiIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NQjwvdGV4dD4KPC9zdmc+Cg==',
      vonage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WPC90ZXh0Pgo8L3N2Zz4K',
      aws_sns: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGOTkwMCIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BVzwvdGV4dD4KPC9zdmc+Cg==',
      taqnyat: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwNzg0QSIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UPC90ZXh0Pgo8L3N2Zz4K'
    };
    
    return icons[providerId] || icons.twilio;
  }
}