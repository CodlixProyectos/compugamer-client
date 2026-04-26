import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaymentOption } from '../../domain/entities/payment-option.entity';
import { PaymentGatewayRepository } from '../../domain/repositories/payment-gateway.repository';

@Injectable({
  providedIn: 'root'
})
export class MockPaymentGatewayRepository extends PaymentGatewayRepository {
  private readonly paymentOptions: PaymentOption[] = [
    {
      id: 'yape-qr',
      label: 'Yape QR demo',
      shortDescription: 'Escanea el QR y confirma desde tu billetera.',
      description: 'Pago movil rapido para cerrar la compra en segundos.',
      kind: 'qr',
      destinationLabel: 'Celular afiliado',
      destinationValue: '934 824 168',
      beneficiary: 'CompuGamer Trujillo',
      qrImageUrl: '/IMAGENES/yape-qr-demo.svg',
      instructions: [
        'Abre tu billetera movil y elige pagar con QR.',
        'Escanea el codigo y revisa el monto antes de confirmar.',
        'Guarda el comprobante para validacion rapida del pedido.'
      ],
      note: 'Demo visual: este flujo simula una pasarela QR para el frontend.',
      confirmLabel: 'Ya realice el pago',
      requiresReceiptUpload: true,
      receiptUploadLabel: 'Sube tu comprobante de Yape',
      receiptUploadHint: 'Adjunta una captura o PDF del pago realizado para validar tu pedido.',
      receiptAcceptedFormats: '.jpg,.jpeg,.png,.webp,.pdf'
    },
    {
      id: 'transferencia',
      label: 'Transferencia bancaria',
      shortDescription: 'Reserva tu pedido y te mostramos los datos de deposito.',
      description: 'Ideal para compras corporativas o pagos desde app bancaria.',
      kind: 'transfer',
      destinationLabel: 'Cuenta BCP',
      destinationValue: '191-4587963-0-24',
      beneficiary: 'CompuGamer Trujillo SAC',
      instructions: [
        'Transfiere el monto exacto al numero de cuenta mostrado.',
        'Comparte tu numero de operacion con el asesor si te lo solicita.',
        'La validacion puede tardar unos minutos en horario comercial.'
      ],
      note: 'Puedes usar esta opcion para montos grandes o compras con factura.',
      confirmLabel: 'Registrar transferencia',
      requiresReceiptUpload: true,
      receiptUploadLabel: 'Sube tu comprobante bancario',
      receiptUploadHint: 'Aceptamos imagen o PDF del deposito o transferencia realizada.',
      receiptAcceptedFormats: '.jpg,.jpeg,.png,.webp,.pdf'
    },
    {
      id: 'tienda',
      label: 'Pago en tienda',
      shortDescription: 'Reserva online y paga al recoger tu pedido.',
      description: 'Separa productos ahora y termina el pago en nuestro local.',
      kind: 'cash',
      destinationLabel: 'Recojo',
      destinationValue: 'JR. Diego de Almagro N 651, tercer piso',
      beneficiary: 'Atencion directa de tienda',
      instructions: [
        'Completa la reserva desde esta pantalla.',
        'Recoge tu pedido dentro del horario de atencion.',
        'Puedes pagar en efectivo o con POS al momento del recojo.'
      ],
      note: 'La reserva demo se mantiene activa durante la jornada actual.',
      confirmLabel: 'Reservar y pagar al recoger'
    }
  ];

  getPaymentOptions(): Observable<PaymentOption[]> {
    return of(this.paymentOptions);
  }
}
