import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

interface AuthSessionState {
  email: string;
  displayName: string;
  role: 'manager';
}

@Injectable({
  providedIn: 'root'
})
export class AuthSessionStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'ts-auth-session';
  private readonly sessionState = signal<AuthSessionState | null>(this.readInitialState());

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionState() !== null);
  readonly displayName = computed(() => this.sessionState()?.displayName ?? 'Gestor');
  readonly email = computed(() => this.sessionState()?.email ?? '');

  login(payload: { email: string; displayName?: string }): void {
    const nextState: AuthSessionState = {
      email: payload.email.trim(),
      displayName: this.resolveDisplayName(payload.email, payload.displayName),
      role: 'manager'
    };

    this.sessionState.set(nextState);
    this.persist(nextState);
  }

  logout(): void {
    this.sessionState.set(null);
    this.persist(null);
  }

  private resolveDisplayName(email: string, displayName?: string): string {
    const normalizedName = displayName?.trim();

    if (normalizedName) {
      return normalizedName;
    }

    const fallbackName = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
    return fallbackName ? fallbackName : 'Gestor';
  }

  private readInitialState(): AuthSessionState | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const rawState = sessionStorage.getItem(this.storageKey);

    if (!rawState) {
      return null;
    }

    try {
      const parsedState = JSON.parse(rawState) as Partial<AuthSessionState> | null;

      if (!parsedState?.email || !parsedState.displayName) {
        return null;
      }

      return {
        email: parsedState.email,
        displayName: parsedState.displayName,
        role: 'manager'
      };
    } catch {
      return null;
    }
  }

  private persist(session: AuthSessionState | null): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!session) {
      sessionStorage.removeItem(this.storageKey);
      return;
    }

    sessionStorage.setItem(this.storageKey, JSON.stringify(session));
  }
}
