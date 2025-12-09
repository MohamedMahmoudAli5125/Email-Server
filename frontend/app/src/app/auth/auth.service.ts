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
      res => { this.currentUser = res; console.log(this.currentUser)}
    ));
  }

  //maloosh lazma (m4 4a88aleen b localStorage w JWTs)?
  isLoggedIn(): boolean {
    return !!localStorage.getItem('userId');
  }

  //maloosh lazma (m4 4a88aleen b localStorage w JWTs)?
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  }
}