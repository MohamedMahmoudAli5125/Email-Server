import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = 'http://localhost:8080/api/auth';

  currentUser!: User;
  
  constructor(private http: HttpClient) {}

  signup(user: User): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/signup`, user)
  }

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(tap(
      res => { 
        this.currentUser = res; 
        console.log(this.currentUser);
        
        // Store user data safely
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('userId', res.id);
          localStorage.setItem('userEmail', res.email);
          localStorage.setItem('userName', res.name);
        }
      }
    ));
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('userId');
    }
    return false;
  }

  getUserId(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('userId');
    }
    return null;
  }

  logout(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    }
  }
}