import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Email } from '../../models/email';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private apiUrl = 'http://localhost:8080/api/emails'

  constructor(private http: HttpClient, private authService: AuthService) { }

  sendMail(email: FormData) {
    return this.http.post<Email>(this.apiUrl + '/send', email);
  }

  draftMail(email: FormData) {
    return this.http.post<Email>(this.apiUrl + '/draft', email);
  }
  getMail()
}
