import { Component, signal } from '@angular/core';
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
}
