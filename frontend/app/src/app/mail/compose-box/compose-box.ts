import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Injectable, Input, Output, SimpleChanges } from '@angular/core';
import { Form, FormsModule, NgForm } from '@angular/forms';
import { Attachment, Email } from '../../models/email';
import { AuthService } from '../../auth/auth.service';
import { EmailPriority } from '../../models/enums';
import { setPriority } from 'os';
import { MailService } from '../service/mail.service';
import { AttachmentService } from '../../Services/attachment.service';

@Injectable()
@Component({
  selector: 'app-compose-box',
  imports: [CommonModule, FormsModule],
  templateUrl: './compose-box.html',
  styleUrl: './compose-box.css',
})
export class ComposeBox {
  EmailPriority = EmailPriority;
  priorities: string[] = ['Normal', 'High', 'Urgent', 'Low'];
  @Input() showCompose = false;
  @Input() currentEmail!: Email;
  @Input() isDraft!: boolean;
  @Output() closeCompose = new EventEmitter<void>();
  composeEmail!: Email;
  toInput: string = '';
  // priority = 'Normal';
  attachments: Attachment[] = [];
  draftId: string = ''; // Track draft ID for updates

  constructor(
    private authService: AuthService, 
    private mailService: MailService,
    private attachmentService: AttachmentService
  ) { }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['currentEmail']?.currentValue) {
      const email = changes['currentEmail'].currentValue;

      this.composeEmail = structuredClone(email);
      this.toInput = (email.toList ?? []).join(', ');
      // this.priority = this.getPriorityAsString();
      this.attachments = email.attachments ? [...email.attachments] : [];
      this.draftId = email.id || ''; // Store draft ID
      
      // Initialize attachmentFiles if not exists
      if (!this.composeEmail.attachmentFiles) {
        this.composeEmail.attachmentFiles = [];
      }
      
      console.log('Draft loaded with attachments:', this.attachments);
      console.log('Draft ID:', this.draftId);
    }
    
    if (changes['showCompose'] && changes['showCompose']?.currentValue == false) {
      this.resetCompose();
    }
  }

  removeSavedAttachment(att: Attachment, index: number) {
    this.attachments.splice(index, 1);
    
    this.attachmentService.removeAttachment(this.composeEmail.id, att.id).subscribe({
      next: (res) => {
        console.log('Attachment removed successfully');
      },
      error: (err) => {
        console.error('Error removing attachment:', err);
        // Re-add on error
        this.attachments.splice(index, 0, att);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    if (!this.composeEmail.attachmentFiles) {
      this.composeEmail.attachmentFiles = [];
    }

    this.composeEmail.attachmentFiles.push(...Array.from(input.files));
    console.log('Files selected:', this.composeEmail.attachmentFiles);
  }

  sendEmail(emailForm: NgForm) {
    // Update priority from dropdown before sending
    // this.composeEmail.priority = this.setPriority(this.priority);

    const formData = this.makeMailForm(emailForm, false);

    console.log('Sending email with attachments...');

    this.mailService.sendMail(formData).subscribe({
      next: (res: any) => {
        alert('Email sent successfully');
        console.log('Email sent:', res);
        
        // Delete draft if this was a draft
        if (this.isDraft && this.draftId) {
          this.mailService.deletePemanently(this.draftId).subscribe({
            next: () => {
              console.log("Draft deleted after sending.");
            },
            error: (err) => {
              console.error('Error deleting draft:', err);
            }
          });
        }
        
        this.onCloseCompose();
      },
      error: (err) => {
        console.error('Error sending email:', err);
        alert('Failed to send email. Please try again.');
      }
    });
  }

  draftEmail(emailForm: NgForm) {
    // Update priority from dropdown before drafting
    // this.composeEmail.priority = this.setPriority(this.priority);

    const formData = this.makeMailForm(emailForm, true);

    // Check if we're updating an existing draft or creating new one
    if (this.draftId) {
      // Update existing draft
      console.log('Updating existing draft:', this.draftId);
      
      this.mailService.updateDraft(this.draftId, formData).subscribe({
        next: (res: Email) => {
          alert('Draft updated successfully');
          console.log('Draft updated:', res);
          this.draftId = res.id; // Update ID in case it changed
        },
        error: (err) => {
          console.error('Error updating draft:', err);
          alert('Failed to update draft. Please try again.');
        }
      });
    } else {
      // Create new draft
      console.log('Creating new draft');
      
      this.mailService.draftMail(formData).subscribe({
        next: (res: Email) => {
          alert('Draft saved successfully');
          console.log('Draft created:', res);
          this.draftId = res.id; // Store the new draft ID
          this.isDraft = true; // Mark as draft for future operations
        },
        error: (err) => {
          console.error('Error creating draft:', err);
          alert('Failed to save draft. Please try again.');
        }
      });
    }
  }

  // setPriority(priority: string): EmailPriority {
  //   switch (priority) {
  //     case 'High':
  //       return EmailPriority.HIGH;
  //     case 'Urgent':
  //       return EmailPriority.URGENT;
  //     case 'Low':
  //       return EmailPriority.LOW;
  //     default:
  //       return EmailPriority.NORMAL;
  //   }
  // }

  makeMailForm(emailForm: NgForm, isDraft: boolean) {
    const formData = new FormData();
console.log( this.composeEmail.priority.toString());
    formData.append('userId', localStorage.getItem('userId')!);
    formData.append('fromEmail', localStorage.getItem('userEmail')!);
    formData.append('to', emailForm.value.to.split(',').map((x: string) => x.trim()).join(','));
    formData.append('cc', emailForm.value.cc ? emailForm.value.cc.split(',').map((x: string) => x.trim()).join(',') : '');
    formData.append('bcc', emailForm.value.bcc ? emailForm.value.bcc.split(',').map((x: string) => x.trim()).join(',') : '');
    formData.append('subject', emailForm.value.subject || '');
    formData.append('body', emailForm.value.body || '');
    formData.append('priority', this.composeEmail.priority.toString());

    // Add existing attachment IDs (for drafts being sent)
    if (this.attachments && this.attachments.length > 0) {
      const attachmentIds = this.attachments.map(att => att.id).join(',');
      formData.append('existingAttachmentIds', attachmentIds);
      console.log('Adding existing attachments:', attachmentIds);
    }

    // Add new attachment files
    if (this.composeEmail.attachmentFiles && this.composeEmail.attachmentFiles.length > 0) {
      this.composeEmail.attachmentFiles.forEach(file => {
        formData.append('attachmentFiles', file, file.name);
      });
      console.log('Adding new attachment files:', this.composeEmail.attachmentFiles.length);
    }

    // If updating draft, add draft ID
    if (isDraft && this.draftId) {
      formData.append('draftId', this.draftId);
    }

    return formData;
  }

  removeAttachment(index: number) {
    if (this.composeEmail.attachmentFiles) {
      this.composeEmail.attachmentFiles.splice(index, 1);
    }
  }

  resetCompose() {
    this.composeEmail = this.clearEmail();
    this.toInput = '';
    // this.priority = 'Normal';
    this.attachments = [];
    this.draftId = '';
    this.isDraft = false;
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

  // getPriorityAsString() {
  //   switch (this.composeEmail.priority) {
  //     case EmailPriority.HIGH:
  //       return 'High';
  //     case EmailPriority.URGENT:
  //       return 'Urgent';
  //     case EmailPriority.LOW:
  //       return 'Low';
  //     default:
  //       return 'Normal';
  //   }
  // }

  onCloseCompose() {
    this.resetCompose();
    this.closeCompose.emit();
  }
}