import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SideBar } from "./shared/side-bar/side-bar";
import { MailBox } from "./mail/mail-box/mail-box";
import { NavBar } from "./shared/nav-bar/nav-bar";
import { NgModel } from '@angular/forms';
import { AuthService } from './auth/auth.service';
import { SidebarComponent } from './slidebar.component/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideBar, MailBox, NavBar],
  templateUrl: './app.html',
  styleUrls: [
    'app.css'
  ]
})
export class App {
  protected readonly title = signal('app');
}
