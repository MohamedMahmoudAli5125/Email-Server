import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
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



  
    getProfile(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${userId}`);
  }
 updateProfile(userId: string, updateData: {name?: string, password?: string}): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/${userId}`, updateData).pipe(
      tap(res => {
        // Update local storage if name was changed
        if (updateData.name) {
          localStorage.setItem('userName', updateData.name);
        }
      })
    );
  }
  deleteAccount(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile/${userId}`);
  }
  private storeUserData(user: User): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
    }
  }
  getCurrentUser(): User | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');
      
      if (userId && userEmail && userName) {
        return {
          id: userId,
          email: userEmail,
          name: userName,
          password: '' // Password not stored locally
        };
      }
    }
    return null;
  }
  updateLocalStorage(userData: {id?: string, email?: string, name?: string}): void {
    if (typeof localStorage !== 'undefined') {
      if (userData.id) {
        localStorage.setItem('userId', userData.id);
      }
      if (userData.email) {
        localStorage.setItem('userEmail', userData.email);
      }
      if (userData.name) {
        localStorage.setItem('userName', userData.name);
      }
    }
  }

}