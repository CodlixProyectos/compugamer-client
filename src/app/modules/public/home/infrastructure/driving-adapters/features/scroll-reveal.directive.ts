import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, OnDestroy, OnInit, PLATFORM_ID, inject, input, signal } from '@angular/core';

type RevealVariant = 'up' | 'left' | 'right' | 'zoom';

@Directive({
  selector: '[appScrollReveal]',
  host: {
    '[class.ts-reveal]': 'true',
    '[class.ts-reveal--visible]': 'isVisible()',
    '[class.ts-reveal--left]': "revealVariant() === 'left'",
    '[class.ts-reveal--right]': "revealVariant() === 'right'",
    '[class.ts-reveal--zoom]': "revealVariant() === 'zoom'",
    '[style.--ts-reveal-delay]': "revealDelay() + 'ms'"
  }
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  readonly revealDelay = input(0, {
    transform: (value: number | string | null | undefined) => {
      const normalizedValue = Number(value ?? 0);
      return Number.isFinite(normalizedValue) ? normalizedValue : 0;
    }
  });
  readonly revealVariant = input<RevealVariant>('up');
  readonly isVisible = signal(false);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || typeof IntersectionObserver === 'undefined') {
      this.isVisible.set(true);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          this.isVisible.set(true);
          this.observer?.disconnect();
          break;
        }
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
