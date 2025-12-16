import { CommonModule } from '@angular/common';
import { EmailList } from '../email-list/email-list';
import { SidebarComponent } from './../slidebar.component/sidebar.component';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComposeBox } from "../mail/compose-box/compose-box"; // Fix this import
import { Email } from '../models/email';
import { EmailPriority } from '../models/enums';
@Component({
  selector: 'app-home-page',
  imports: [SidebarComponent, EmailList, CommonModule, FormsModule, ComposeBox],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

  currentFolderId: string = '';
  folderType = ''
  showCompose = false;
  currentDraftEmail = this.clearEmail();
  isDraft = false;

  constructor(private router: Router) { }



  setFolderType(folderType: string) {
    this.folderType = folderType;
  }
  onFolderChange(folderId: string) {
    this.currentFolderId = folderId;
  }
  onEmailOpened(event: { emailId: string; folderId: string }) {
    console.log("ok");
    // Navigate to mail-page component with both IDs
    this.router.navigate(['/mail', event.folderId, event.emailId]);

    // OR if you're using a modal/overlay approach:
    // this.openMailPage(event.emailId, event.folderId);
  }

  toggleCompose() {
    this.showCompose = !this.showCompose;
    this.isDraft = false;
    this.currentDraftEmail = this.clearEmail();
  }

  openDraftEmail(email: Email) {
    this.currentDraftEmail = email;
    this.isDraft = true;
    this.showCompose = true;
  }

  clearEmail(): Email {
    return {
      id: '',
      fromEmail: '',
      to: [],
      toList: [],
      cc: [],
      bcc: [],
      subject: '',
      body: '',
      priority: EmailPriority.NORMAL,
      attachmentFiles: [],
      attachments: [],
      sentDate: '',
      isRead: false,
      archived: false,
      isImportant: false
    };
  }
}
