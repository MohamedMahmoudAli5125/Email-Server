import { Component } from '@angular/core';
import { SideBar } from '../../shared/side-bar/side-bar';
import { MailBox } from '../../mail/mail-box/mail-box';
import { NavBar } from '../../shared/nav-bar/nav-bar';

@Component({
  selector: 'app-main-layout',
  imports: [SideBar, MailBox, NavBar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
