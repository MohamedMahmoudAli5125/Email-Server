import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {
  apiUrl = 'http://localhost:8080/api/emails'

  constructor(private http: HttpClient) {}

  removeAttachment(emailId: string, attachmentId: string) {

    return this.http.delete(this.apiUrl + 
      `/${encodeURI(emailId)}/attachments/${encodeURI(attachmentId)}`)
  }
}
