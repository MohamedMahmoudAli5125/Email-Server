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

  priorities: string[] = ['Normal', 'High', 'Urgent', 'Low'];
  @Input() showCompose = false;
  @Input() currentEmail!: Email;
  @Input() isDraft!: boolean;
  @Output() closeCompose = new EventEmitter<void>();
  composeEmail!: Email;
  toInput: string = '';
  priority = 'Normal';
  attachments: Attachment[] = [];

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
      this.priority = this.getPriorityAsString();
      this.attachments = email.attachments;
      console.log(this.attachments)
    }
    if (changes['showCompose'] && changes['showCompose']?.currentValue == false) {
      this.composeEmail = this.clearEmail();
      this.toInput = ''
      this.priority = 'Normal';
    }
  }


  removeSavedAttachment(att: Attachment, index: number) {
    this.attachments.splice(index, 1);
    
    this.attachmentService.removeAttachment(this.composeEmail.id, att.id).subscribe({
      next: (res) => {
        console.log('removed att')
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.composeEmail.attachmentFiles!.push(...Array.from(input.files));
  }

  sendEmail(emailForm: NgForm) {

    const formData = this.makeMailForm(emailForm);

    console.log('FormData ready to send:', formData);

    this.mailService.sendMail(formData).subscribe({
      next: (res: any) => {
        alert('Email sent successfully');
        console.log(res)
        this.onCloseCompose();
        if (this.isDraft) {
          this.mailService.deletePemanently(this.composeEmail.id).subscribe({
            next: (res) => {
              console.log("draft deleted.")
            },
            error: (err) => {
              console.log(err)
            }
          })
        }
      },
      error: (err) => {
        console.log('Error sending email:', err);
      }
    });
  }

  draftEmail(emailForm: NgForm) {

    const formData = this.makeMailForm(emailForm);

    this.mailService.draftMail(formData).subscribe({
      next: (res: Email) => {
        alert('Email sent successfully');
        console.log(res)
      },
      error: (err) => {
        console.log(err)
      }
    });
  }

  setPriority(priority: string): EmailPriority {
    switch (priority) {
      case 'High':
        return EmailPriority.HIGH;
      case 'Urgent':
        return EmailPriority.URGENT;
      case 'Low':
        return EmailPriority.LOW;
      default:
        return EmailPriority.NORMAL;
    }
  }

  makeMailForm(emailForm: NgForm) {
// i change the line of priority
    const email: Email = {
      fromEmail: localStorage.getItem('userEmail')!,
      to: emailForm.value.to.split(',').map((x: string) => x.trim()),
      cc: emailForm.value.cc ? emailForm.value.cc.split(',').map((x: string) => x.trim()) : [],
      bcc: emailForm.value.bcc ? emailForm.value.bcc.split(',').map((x: string) => x.trim()) : [],
      subject: emailForm.value.subject,
      body: emailForm.value.body,
      priority: this.composeEmail.priority,
      attachmentFiles: this.composeEmail.attachmentFiles || [],
      id: '',
      toList: [],
      sentDate: '',
      isRead: false,
      archived: false,
      isImportant: false
    };

    const formData = new FormData();

    formData.append('userId', localStorage.getItem('userId')!);
    formData.append('fromEmail', email.fromEmail);
    formData.append('to', (email.to ?? []).join(','));
    formData.append('cc', (email.cc ?? []).join(','));
    formData.append('bcc', (email.bcc ?? []).join(','));
    formData.append('subject', email.subject);
    formData.append('body', email.body);
    formData.append('priority', email.priority.toString());

    (email.attachmentFiles ?? []).forEach(file => {
      formData.append('attachmentFiles', file, file.name);
    });

    return formData;
  }

  removeAttachment(index: number) {
    this.composeEmail.attachmentFiles!.splice(index, 1);
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

  getPriorityAsString() {
    switch (this.composeEmail.priority) {
      case EmailPriority.HIGH:
        return 'High';
      case EmailPriority.URGENT:
        return 'Urgent';
      case EmailPriority.LOW:
        return 'Low';
      default:
        return 'Normal';
    }
  }

  onCloseCompose() {
    this.closeCompose.emit();
  }
}
