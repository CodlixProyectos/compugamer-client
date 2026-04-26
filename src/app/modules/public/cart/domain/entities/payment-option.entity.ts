export type PaymentOptionKind = 'qr' | 'transfer' | 'cash';

export interface PaymentOption {
  id: string;
  label: string;
  shortDescription: string;
  description: string;
  kind: PaymentOptionKind;
  destinationLabel?: string;
  destinationValue?: string;
  beneficiary?: string;
  qrImageUrl?: string;
  instructions: string[];
  note: string;
  confirmLabel: string;
  requiresReceiptUpload?: boolean;
  receiptUploadLabel?: string;
  receiptUploadHint?: string;
  receiptAcceptedFormats?: string;
}
