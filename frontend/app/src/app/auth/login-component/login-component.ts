import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {

  email?: string;
  password?: string;

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    if (!this.email || !this.password) {
      alert('Please enter email and password');
      return;
    }

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        
        
        localStorage.setItem('userId', response.id);
        localStorage.setItem('userEmail', response.email);
        localStorage.setItem('userName', response.name);
        
        alert('Login Successful!');
        
        
        console.log('User logged in:', response);
      },
      error: (error) => {
        console.error('Login failed', error);
        alert(error.error?.error || 'Invalid Credentials');
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}