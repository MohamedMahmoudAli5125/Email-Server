// ============================================
// src/app/services/email.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Email } from '../models/email';


@Injectable({
  providedIn: 'root'
})
export class EmailService {
  apiUrl = 'http://localhost:8080/api/emails';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getEmails(folderId: string, page: number = 0,size:number=10): Observable<any> {
    return this.http.get(`${this.apiUrl}/folder/${folderId}?page=${page}&size=10`);
  }

  getEmail(id: string): Observable<Email> {
    return this.http.get<Email>(`${this.apiUrl}/${id}`);
  }

  sendEmail(formData: FormData): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.post(`${this.apiUrl}/send?userId=${userId}`, formData);
  }

  saveDraft(formData: FormData): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.post(`${this.apiUrl}/draft?userId=${userId}`, formData);
  }

  markRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {});
  }

  toggleStar(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/important`, {});
  }

  moveEmail(id: string, folderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/move?targetFolderId=${folderId}`, {});
  }

  deleteEmail(id: string): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.delete(`${this.apiUrl}/${id}?userId=${userId}`);
  }
    deleteEmailPermanent(ids: string[]): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.delete(`${this.apiUrl}/${ids}?userId=${userId}`);
  }

  bulkDelete(ids: string[]): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.delete(`${this.apiUrl}/bulk`, { body: { emailIds: ids, userId } });
  }

  bulkMove(ids: string[], folderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/bulk/move`, { emailIds: ids, targetFolderId: folderId });
  }

  search(folderId: string, keyword: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/folder/${folderId}/search/subject?keyword=${keyword}`);
  }
}