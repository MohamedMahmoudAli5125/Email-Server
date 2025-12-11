import { Component } from '@angular/core';
import { User } from '../../models/user';
import { AuthService } from '../../auth/auth.service';
@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {

  currentUser!: User;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
  }
}
