import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthModalStore } from '../../../../shared/data-access/auth-modal.store';
import { AuthSessionStore } from '../../../../shared/data-access/auth-session.store';

export const dashboardAuthGuard: CanActivateFn = () => {
  const authSessionStore = inject(AuthSessionStore);

  if (authSessionStore.isAuthenticated()) {
    return true;
  }

  inject(AuthModalStore).open('login');
  return inject(Router).createUrlTree(['/']);
};
