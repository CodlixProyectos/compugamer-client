import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartFlightAnimationService {
  private readonly document = inject(DOCUMENT);

  animateFrom(sourceImage: HTMLImageElement | null): void {
    const target = this.document.querySelector<HTMLElement>('[data-cart-target="primary"]');

    if (!sourceImage || !target) {
      return;
    }

    const view = this.document.defaultView;
    const prefersReducedMotion = view?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;

    if (prefersReducedMotion) {
      this.pulseTarget(target);
      return;
    }

    const sourceRect = sourceImage.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    if (sourceRect.width === 0 || sourceRect.height === 0) {
      this.pulseTarget(target);
      return;
    }

    const ghostImage = this.document.createElement('img');
    const deltaX = (targetRect.left + (targetRect.width / 2)) - (sourceRect.left + (sourceRect.width / 2));
    const deltaY = (targetRect.top + (targetRect.height / 2)) - (sourceRect.top + (sourceRect.height / 2));

    ghostImage.src = sourceImage.currentSrc || sourceImage.src;
    ghostImage.alt = '';
    ghostImage.setAttribute('aria-hidden', 'true');

    const ghostStyle = ghostImage.style;
    ghostStyle.position = 'fixed';
    ghostStyle.top = `${sourceRect.top}px`;
    ghostStyle.left = `${sourceRect.left}px`;
    ghostStyle.width = `${sourceRect.width}px`;
    ghostStyle.height = `${sourceRect.height}px`;
    ghostStyle.objectFit = 'contain';
    ghostStyle.pointerEvents = 'none';
    ghostStyle.zIndex = '1200';
    ghostStyle.borderRadius = '22px';
    ghostStyle.background = '#ffffff';
    ghostStyle.border = '1px solid rgba(148, 163, 184, 0.24)';
    ghostStyle.boxShadow = '0 20px 45px rgba(15, 23, 42, 0.18)';
    ghostStyle.transformOrigin = 'center center';
    ghostStyle.willChange = 'transform, opacity';
    ghostStyle.transition = 'transform 620ms cubic-bezier(0.22, 1, 0.36, 1), opacity 620ms ease, border-radius 620ms ease';

    this.document.body.appendChild(ghostImage);

    view?.requestAnimationFrame(() => {
      ghostStyle.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.16) rotate(-12deg)`;
      ghostStyle.opacity = '0.18';
      ghostStyle.borderRadius = '999px';
    });

    const finalizeAnimation = () => {
      ghostImage.remove();
      this.pulseTarget(target);
    };

    ghostImage.addEventListener('transitionend', finalizeAnimation, { once: true });
    view?.setTimeout(finalizeAnimation, 700);
  }

  private pulseTarget(target: HTMLElement): void {
    const view = this.document.defaultView;

    target.classList.remove('ts-icon-button--cart-hit');
    void target.offsetWidth;
    target.classList.add('ts-icon-button--cart-hit');

    view?.setTimeout(() => {
      target.classList.remove('ts-icon-button--cart-hit');
    }, 420);
  }
}
