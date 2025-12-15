// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Email } from '../../models/email';
// import { AuthService } from '../../auth/auth.service';
// import { map, Observable } from 'rxjs';
// export interface SpringPageResponse<T> {
//   content: T[];
//   pageable: {
//     sort: {
//       empty: boolean;
//       sorted: boolean;
//       unsorted: boolean;
//     };
//     offset: number;
//     pageNumber: number;
//     pageSize: number;
//     paged: boolean;
//     unpaged: boolean;
//   };
//   last: boolean;
//   totalPages: number;
//   totalElements: number;
//   size: number;
//   number: number;
//   sort: {
//     empty: boolean;
//     sorted: boolean;
//     unsorted: boolean;
//   };
//   first: boolean;
//   numberOfElements: number;
//   empty: boolean;
// }
// export interface EmailPage {
//   content: Email[];
//   totalElements: number;
//   totalPages: number;
//   number: number;
//   size: number;
//   first: boolean;
//   last: boolean;
// }
// @Injectable({
//   providedIn: 'root',
// })
// export class MailService {
//   private apiUrl = 'http://localhost:8080/api/emails'

//   constructor(private http: HttpClient, private authService: AuthService) { }

//   sendMail(email: FormData) {
//     return this.http.post<Email>(this.apiUrl + '/send', email);
//   }

//   draftMail(email: FormData) {
//     return this.http.post<Email>(this.apiUrl + '/draft', email);
//   }
//    getEmailById(emailId: string): Observable<Email> {
//     return this.http.get<Email>(`${this.apiUrl}/${emailId}`);
//   }
//   //  getFolderEmails(folderId: string, page: number = 0, size: number = 10): Observable<EmailPage> {
//   //   const params = new HttpParams()
//   //     .set('page', page.toString())
//   //     .set('size', size.toString());
    
//   //   return this.http.get<EmailPage>(`${this.apiUrl}/folder/${folderId}`, { params });
//   // }
  
//  getFolderEmails(folderId: string, page: number = 0, size: number = 10): Observable<EmailPage> {
//     const params = new HttpParams()
//       .set('page', page.toString())
//       .set('size', size.toString());

//     console.log('Calling API:', `${this.apiUrl}/folder/${folderId}`, 'with params:', { page, size });

//     return this.http.get<SpringPageResponse<Email>>(`${this.apiUrl}/folder/${folderId}`, { params })
//       .pipe(
//         map((response: { content: any; totalElements: any; totalPages: any; number: any; size: any; first: any; last: any; }) => {
//           console.log('Raw Spring Boot response:', response);
          
//           // Transform Spring Boot Page to simplified EmailPage
//           const emailPage: EmailPage = {
//             content: response.content || [],
//             totalElements: response.totalElements || 0,
//             totalPages: response.totalPages || 0,
//             number: response.number || 0,
//             size: response.size || 0,
//             first: response.first || false,
//             last: response.last || false
//           };
          
//           console.log('Transformed EmailPage:', emailPage);
//           return emailPage;
//         })
//       );
//   }
// }import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Email, Attachment } from '../../models/email';
import { AuthService } from '../../auth/auth.service';
import { map, Observable } from 'rxjs';

export interface SpringPageResponse<T> {
  content: T[];
  pageable: {
    sort: { empty: boolean; sorted: boolean; unsorted: boolean; };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean; };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface EmailPage {
  content: Email[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private apiUrl = 'http://localhost:8080/api/emails';

  constructor(private http: HttpClient, private authService: AuthService) {}

  sendMail(email: FormData): Observable<Email> {
    return this.http.post<Email>(this.apiUrl + '/send', email);
  }

  draftMail(email: FormData): Observable<Email> {
    return this.http.post<Email>(this.apiUrl + '/draft', email);
  }

  getEmailById(emailId: string): Observable<Email> {
    return this.http.get<Email>(`${this.apiUrl}/${emailId}`);
  }

  getFolderEmails(folderId: string, page: number = 0, size: number = 10): Observable<EmailPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    console.log('Calling API:', `${this.apiUrl}/folder/${folderId}`, 'with params:', { page, size });
    
    return this.http.get<SpringPageResponse<any>>(`${this.apiUrl}/folder/${folderId}`, { params })
      .pipe(
        map((response) => {
          console.log('Raw Spring Boot response:', response);
          
          // Normalize email data
          const normalizedContent = response.content.map(email => ({
            ...email,
            isRead: email.read,
            to: email.toList || email.to || [],
            cc: email.cc || [],
            bcc: email.bcc || [],
            date: email.sentDate ? new Date(email.sentDate) : new Date(),
            attachmentFiles: email.attachments || [],
            attachments: email.attachments || []
          }));

          const emailPage: EmailPage = {
            content: normalizedContent,
            totalElements: response.totalElements || 0,
            totalPages: response.totalPages || 0,
            number: response.number || 0,
            size: response.size || 0,
            first: response.first || false,
            last: response.last || false
          };

          console.log('Transformed EmailPage:', emailPage);
          return emailPage;
        })
      );
  }

  // Download attachment
  downloadAttachment(emailId: string, attachmentId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${emailId}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    );
  }

  // Download all attachments as ZIP
  downloadAllAttachments(emailId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${emailId}/attachments/download-all`,
      { responseType: 'blob' }
    );
  }

  // Get attachment URL for preview/download
  getAttachmentUrl(emailId: string, attachmentId: string): string {
    return `${this.apiUrl}/${emailId}/attachments/${attachmentId}/download`;
  }

  // Get preview URL (inline)
  getAttachmentPreviewUrl(emailId: string, attachmentId: string): string {
    return `${this.apiUrl}/${emailId}/attachments/${attachmentId}/preview`;
  }
}