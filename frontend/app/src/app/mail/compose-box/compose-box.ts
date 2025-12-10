import { CommonModule } from '@angular/common';
import { Component, Injectable } from '@angular/core';
import { Form, FormsModule, NgForm } from '@angular/forms';
import { Email } from '../../models/email';
import { AuthService } from '../../auth/auth.service';
import { EmailPriority } from '../../models/enums';
import { setPriority } from 'os';
import { MailService } from '../service/mail.service';

@Injectable()
@Component({
  selector: 'app-compose-box',
  imports: [CommonModule, FormsModule],
  templateUrl: './compose-box.html',
  styleUrl: './compose-box.css',
})
export class ComposeBox {
  files: File[] = []
  priorities: string[] = ['Normal', 'High', 'Urgent', 'Low']

  constructor(private authService: AuthService, private mailService: MailService) { }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = Array.from(input.files);
      console.log(this.files)
    }
  }

  sendEmail(emailForm: NgForm) {

    const formData = this.makeMailForm(emailForm);

    console.log('FormData ready to send:', formData);

    this.mailService.sendMail(formData).subscribe({
      next: (res: any) => {
        console.log('Email sent successfully:', res);
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

    const email: Email = {
      from: this.authService.currentUser.email,
      to: emailForm.value.to.split(',').map((x: string) => x.trim()),
      cc: emailForm.value.cc ? emailForm.value.cc.split(',').map((x: string) => x.trim()) : [],
      bcc: emailForm.value.bcc ? emailForm.value.bcc.split(',').map((x: string) => x.trim()) : [],
      subject: emailForm.value.subject,
      body: emailForm.value.body,
      priority: this.setPriority(emailForm.value.priority),
      attachmentFiles: this.files || []
    };

    const formData = new FormData();

    formData.append('userId', this.authService.currentUser.id);
    formData.append('fromEmail', email.from);
    formData.append('to', email.to.join(','));
    formData.append('cc', email.cc.join(','));
    formData.append('bcc', email.bcc.join(','));
    formData.append('subject', email.subject);
    formData.append('body', email.body);
    formData.append('priority', email.priority.toString());

    email.attachmentFiles.forEach(file => {
      formData.append('attachmentFiles', file, file.name);
    });

    return formData;
  }
}
