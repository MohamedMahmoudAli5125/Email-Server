import { Component } from '@angular/core';
import { User } from '../../models/user';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-side-bar',
  imports: [],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {

  currentUser!: User;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
  }
}
