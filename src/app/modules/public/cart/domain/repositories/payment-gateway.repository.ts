import { Observable } from 'rxjs';
import { PaymentOption } from '../entities/payment-option.entity';

export abstract class PaymentGatewayRepository {
  abstract getPaymentOptions(): Observable<PaymentOption[]>;
}
