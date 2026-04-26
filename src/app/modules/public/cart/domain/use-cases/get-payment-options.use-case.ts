import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentOption } from '../entities/payment-option.entity';
import { PaymentGatewayRepository } from '../repositories/payment-gateway.repository';

@Injectable({
  providedIn: 'root'
})
export class GetPaymentOptionsUseCase {
  constructor(private paymentGatewayRepository: PaymentGatewayRepository) {}

  execute(): Observable<PaymentOption[]> {
    return this.paymentGatewayRepository.getPaymentOptions();
  }
}
