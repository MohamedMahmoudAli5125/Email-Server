import { Component } from '@angular/core';
import { User } from '../../models/user';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mail-box',
  imports: [CommonModule],
  templateUrl: './mail-box.html',
  styleUrl: './mail.css',
})
export class MailBox {

  currentUser!: User;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
  }
}
