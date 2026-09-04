import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainer } from './shared/components/toast-container/toast-container';
import { RouteProgress } from './shared/components/route-progress/route-progress';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer, RouteProgress],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Summaries.Frontend');
}