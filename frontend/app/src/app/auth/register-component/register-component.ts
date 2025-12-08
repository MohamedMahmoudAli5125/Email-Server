import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user';

@Component({
  selector: 'app-register-component',
  imports: [FormsModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export class RegisterComponent {
  email?: string;
  username?: string;
  password?: string;

  constructor(private router: Router, private authService: AuthService) {}

  register() {
    if (!this.email || !this.username || !this.password) {
      alert('Please fill in all fields.');
      return;
    }

    const user: User = { 
      id: 0,
      email: this.email,
      name: this.username,
      password: this.password  
    };

    this.authService.signup(user).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        alert('Account created! Please log in.');
        this.navigateToLogin();
      },
      error: (error) => {
        console.error('Registration failed', error);
        alert(error.error?.error || 'Registration failed'); 
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}