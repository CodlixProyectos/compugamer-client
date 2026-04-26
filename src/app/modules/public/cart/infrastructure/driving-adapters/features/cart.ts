import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PaymentOption } from '../../../domain/entities/payment-option.entity';
import { GetPaymentOptionsUseCase } from '../../../domain/use-cases/get-payment-options.use-case';
import { AuthModalStore } from '../../../../shared/data-access/auth-modal.store';
import { CartStore } from '../../../../shared/data-access/cart.store';

interface NavItem { label: string; href?: string; routerLink?: string; active?: boolean; }
interface FooterSection { title: string; links: { label: string; href: string }[]; }
interface SocialLink { label: string; short: string; }

@Component({
  selector: 'app-cart',
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ts-home-page'
  }
})
export class CartComponent {
  private readonly authModalStore = inject(AuthModalStore);
  private readonly cartStore = inject(CartStore);
  private readonly getPaymentOptionsUseCase = inject(GetPaymentOptionsUseCase);
  private readonly whatsappPhone = '51991185552';

  readonly footerYear = 2024;
  readonly whatsappDisplayNumber = '+51 991 185 552';
  readonly items = this.cartStore.items;
  readonly cartCount = this.cartStore.totalItems;
  readonly isMobileNavOpen = signal(false);
  readonly subtotal = this.cartStore.subtotal;
  readonly isEmpty = this.cartStore.isEmpty;
  readonly isPaymentOpen = signal(false);
  readonly isPaymentConfirmed = signal(false);
  readonly selectedPaymentId = signal('');
  readonly uploadedReceiptName = signal('');
  readonly uploadedReceiptSizeLabel = signal('');
  readonly receiptValidationMessage = signal('');
  readonly estimatedShipping = computed(() => (this.isEmpty() ? 0 : 0));
  readonly orderTotal = computed(() => this.subtotal() + this.estimatedShipping());
  readonly paymentOptions = toSignal(this.getPaymentOptionsUseCase.execute(), {
    initialValue: [] as PaymentOption[]
  });
  readonly selectedPaymentOption = computed(() => {
    const options = this.paymentOptions();
    const selectedId = this.selectedPaymentId();

    return options.find((option) => option.id === selectedId) ?? options[0] ?? null;
  });
  readonly selectedPaymentOptionId = computed(() => this.selectedPaymentOption()?.id ?? '');
  readonly isReceiptRequired = computed(() => this.selectedPaymentOption()?.requiresReceiptUpload ?? false);
  readonly whatsappCheckoutLink = computed(() => {
    const paymentLabel = this.selectedPaymentOption()?.label ?? 'pago web';
    const receiptDetail = this.uploadedReceiptName()
      ? ` Ya subi el comprobante ${this.uploadedReceiptName()}.`
      : ' Necesito apoyo para completar el pago.';
    const message = encodeURIComponent(
      `Hola, quiero continuar mi pedido en CompuGamer Trujillo. Metodo: ${paymentLabel}. Total: $${this.orderTotal().toFixed(2)}.${receiptDetail}`
    );

    return `https://wa.me/${this.whatsappPhone}?text=${message}`;
  });

  readonly navItems: NavItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Categorías', routerLink: '/catalogo' },
    { label: 'Ofertas', href: '/#ofertas' },
    { label: 'Novedades', href: '/#destacados' },
    { label: 'Soporte', href: '/#garantias' },
    { label: 'Contacto', href: '/#contacto' }
  ];

  readonly socialLinks: SocialLink[] = [
    { label: 'Facebook', short: 'f' },
    { label: 'Instagram', short: 'ig' },
    { label: 'YouTube', short: 'yt' },
    { label: 'TikTok', short: 'tt' }
  ];

  readonly footerSections: FooterSection[] = [
    {
      title: 'Enlaces',
      links: [
        { label: 'Inicio', href: '/' },
        { label: 'Categorías', href: '/catalogo' },
        { label: 'Ofertas', href: '/#ofertas' },
        { label: 'Novedades', href: '/#destacados' },
        { label: 'Contacto', href: '/#contacto' }
      ]
    },
    {
      title: 'Ayuda',
      links: [
        { label: 'Preguntas frecuentes', href: '/#garantias' },
        { label: 'Envíos y entregas', href: '/#ofertas' },
        { label: 'Devoluciones', href: '/#garantias' },
        { label: 'Términos y condiciones', href: '/#contacto' },
        { label: 'Política de privacidad', href: '/#contacto' }
      ]
    }
  ];

  increment(productId: string): void {
    this.cartStore.increment(productId);
  }

  decrement(productId: string): void {
    this.cartStore.decrement(productId);
  }

  remove(productId: string): void {
    this.cartStore.remove(productId);
  }

  clear(): void {
    this.cartStore.clear();
    this.resetPaymentFlow();
  }

  openAuthModal(): void {
    this.authModalStore.open('login');
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen.update((isOpen) => !isOpen);
  }

  closeMobileNav(): void {
    this.isMobileNavOpen.set(false);
  }

  openPaymentFlow(): void {
    if (this.isEmpty()) {
      return;
    }

    this.isPaymentOpen.set(true);
    this.isPaymentConfirmed.set(false);
    this.receiptValidationMessage.set('');
  }

  selectPaymentOption(paymentId: string): void {
    this.selectedPaymentId.set(paymentId);
    this.isPaymentConfirmed.set(false);
    this.clearReceipt();
  }

  onReceiptSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;

    if (!file) {
      return;
    }

    this.uploadedReceiptName.set(file.name);
    this.uploadedReceiptSizeLabel.set(this.formatFileSize(file.size));
    this.receiptValidationMessage.set('');
  }

  clearReceipt(): void {
    this.uploadedReceiptName.set('');
    this.uploadedReceiptSizeLabel.set('');
    this.receiptValidationMessage.set('');
  }

  confirmPayment(): void {
    const paymentOption = this.selectedPaymentOption();

    if (!paymentOption) {
      return;
    }

    if (paymentOption.requiresReceiptUpload && !this.uploadedReceiptName()) {
      this.receiptValidationMessage.set('Sube tu comprobante antes de confirmar el pago.');
      return;
    }

    this.isPaymentConfirmed.set(true);
  }

  resetPaymentFlow(): void {
    this.isPaymentOpen.set(false);
    this.isPaymentConfirmed.set(false);
    this.clearReceipt();
  }

  private formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
    }

    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
