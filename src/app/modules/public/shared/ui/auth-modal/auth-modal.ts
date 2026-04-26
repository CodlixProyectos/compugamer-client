import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthModalMode, AuthModalStore } from '../../data-access/auth-modal.store';
import { AuthSessionStore } from '../../data-access/auth-session.store';

@Component({
  selector: 'app-auth-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthModalComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly authSessionStore = inject(AuthSessionStore);
  readonly authModalStore = inject(AuthModalStore);

  readonly feedbackMessage = signal('');
  readonly authForm = this.formBuilder.group({
    fullName: ['', [Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly isLoginMode = this.authModalStore.isLoginMode;
  readonly modalTitle = computed(() => this.isLoginMode() ? 'Inicia sesión' : 'Crea tu cuenta');
  readonly submitLabel = computed(() => this.isLoginMode() ? 'Ingresar' : 'Crear cuenta');
  readonly helperText = computed(() =>
    this.isLoginMode()
      ? 'Accede para revisar tus pedidos, carrito y comprobantes.'
      : 'Regístrate para guardar tus datos y seguir tus compras más rápido.'
  );

  close(): void {
    this.authModalStore.close();
    this.resetFeedback();
  }

  switchMode(mode: AuthModalMode): void {
    this.authModalStore.setMode(mode);
    this.resetFeedback();
    this.authForm.controls.password.reset('');

    if (mode === 'login') {
      this.authForm.controls.fullName.reset('');
    }
  }

  submit(): void {
    this.syncFullNameValidators();

    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const { email, fullName } = this.authForm.getRawValue();

    if (this.isLoginMode()) {
      this.authSessionStore.login({
        email,
        displayName: fullName
      });
      this.authForm.reset({ fullName: '', email: '', password: '' });
      this.close();
      void this.router.navigateByUrl('/dashboard');
      return;
    }

    this.feedbackMessage.set(
      `Cuenta demo creada para ${fullName || email}. Ya puedes seguir con tu compra.`
    );
  }

  private syncFullNameValidators(): void {
    if (this.isLoginMode()) {
      this.authForm.controls.fullName.clearValidators();
    } else {
      this.authForm.controls.fullName.setValidators([Validators.required, Validators.minLength(3)]);
    }

    this.authForm.controls.fullName.updateValueAndValidity({ emitEvent: false });
  }

  private resetFeedback(): void {
    this.feedbackMessage.set('');
  }
}
