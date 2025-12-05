import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: [
    '../assets/css/nav-bar.css',
    '../assets/css/mail.css',
    '../assets/css/side-bar.css',
    'app.css'
  ]
})
export class App {
  protected readonly title = signal('app');
}
