import { Component, HostListener, isDevMode, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthModalComponent } from './modules/public/shared/ui/auth-modal/auth-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('tech-store-hexagonal');
  private readonly contentProtectionEnabled = !isDevMode();

  @HostListener('document:contextmenu', ['$event'])
  handleContextMenu(event: MouseEvent): void {
    if (!this.contentProtectionEnabled) {
      return;
    }

    event.preventDefault();
  }

  @HostListener('document:dragstart', ['$event'])
  handleDragStart(event: DragEvent): void {
    if (!this.contentProtectionEnabled) {
      return;
    }

    const target = event.target;

    if (target instanceof HTMLImageElement) {
      event.preventDefault();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.contentProtectionEnabled) {
      return;
    }

    const key = event.key.toLowerCase();
    const ctrlOrMetaPressed = event.ctrlKey || event.metaKey;
    const blockedShortcut =
      key === 'f12' ||
      (ctrlOrMetaPressed && key === 'u') ||
      (ctrlOrMetaPressed && key === 's') ||
      (ctrlOrMetaPressed && event.shiftKey && ['c', 'i', 'j'].includes(key));

    if (blockedShortcut) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
