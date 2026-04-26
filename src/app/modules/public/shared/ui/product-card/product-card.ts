import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartFlightAnimationService } from './cart-flight-animation.service';
import { ProductCardActionKind, ProductCardVariant, ProductCardViewModel } from './product-card.types';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `
  ]
})
export class ProductCardComponent {
  private readonly cartFlightAnimationService = inject(CartFlightAnimationService);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly product = input.required<ProductCardViewModel>();
  readonly variant = input<ProductCardVariant>('spotlight');
  readonly showBadge = input(true);
  readonly actionKind = input<ProductCardActionKind>('button');
  readonly actionTriggered = output<ProductCardViewModel>();
  readonly contentRouterLink = input<string | readonly string[] | null>(null);
  readonly actionRouterLink = input<string | readonly string[] | null>(null);
  readonly actionLabelPrefix = input('Ver');
  readonly actionAriaSuffix = input('');

  readonly actionAriaLabel = computed(() => {
    const suffix = this.actionAriaSuffix().trim();
    const baseLabel = `${this.actionLabelPrefix()} ${this.product().name}`;

    return suffix ? `${baseLabel} ${suffix}` : baseLabel;
  });

  triggerAction(): void {
    const productImage = this.hostElement.nativeElement.querySelector('img') as HTMLImageElement | null;

    this.cartFlightAnimationService.animateFrom(productImage);
    this.actionTriggered.emit(this.product());
  }
}
