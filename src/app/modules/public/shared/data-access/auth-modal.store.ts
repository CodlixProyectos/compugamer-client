import { Injectable, computed, signal } from '@angular/core';

export type AuthModalMode = 'login' | 'register';

@Injectable({
  providedIn: 'root'
})
export class AuthModalStore {
  private readonly isOpenState = signal(false);
  private readonly modeState = signal<AuthModalMode>('login');

  readonly isOpen = this.isOpenState.asReadonly();
  readonly mode = this.modeState.asReadonly();
  readonly isLoginMode = computed(() => this.modeState() === 'login');

  open(mode: AuthModalMode = 'login'): void {
    this.modeState.set(mode);
    this.isOpenState.set(true);
  }

  close(): void {
    this.isOpenState.set(false);
  }

  setMode(mode: AuthModalMode): void {
    this.modeState.set(mode);
  }
}
