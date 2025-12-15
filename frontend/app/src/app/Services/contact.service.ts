// src/app/Services/contact.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable ,throwError} from 'rxjs';
import { Contact } from '../models/contact';
import { catchError } from 'rxjs/operators';
interface EmailCheckResponse {
  existsInContacts: boolean;
  contact: {
    id: string;
    name: string;
  } | null;
}
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8080/api/contacts';

  constructor(private http: HttpClient) {}

  getUserContacts(userId: string): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/user/${userId}`)
          .pipe(catchError(this.handleError));
;
  }

  getContactById(contactId: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${contactId}`)      .pipe(catchError(this.handleError));
;
  }

  createContact(userId: string, contact: Contact): Observable<Contact> {
    return this.http.post<Contact>(`${this.apiUrl}/user/${userId}`, contact)      .pipe(catchError(this.handleError));
;
  }

  updateContact(contactId: string, contact: Contact): Observable<Contact> {
    return this.http.put<Contact>(`${this.apiUrl}/${contactId}`, contact)      .pipe(catchError(this.handleError));
;
  }
   deleteContact(contactId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${contactId}`)      .pipe(catchError(this.handleError));

  }
  checkEmailInContacts(userId: string, email: string): Observable<EmailCheckResponse> {
    return this.http.get<EmailCheckResponse>(
      `${this.apiUrl}/user/${userId}/check-email?email=${encodeURIComponent(email)}`
    ).pipe(catchError(this.handleError));
  }

   private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}