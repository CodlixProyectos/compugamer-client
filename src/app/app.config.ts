import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { PaymentGatewayRepository } from './modules/public/cart/domain/repositories/payment-gateway.repository';
import { MockPaymentGatewayRepository } from './modules/public/cart/infrastructure/driven-adapters/mock-payment-gateway.repository';
import { ProductRepository } from './modules/public/home/domain/repositories/product.repository';
import { MockProductRepository } from './modules/public/home/infrastructure/driven-adapters/mock-product.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: ProductRepository, useClass: MockProductRepository },
    { provide: PaymentGatewayRepository, useClass: MockPaymentGatewayRepository }
  ]
};

