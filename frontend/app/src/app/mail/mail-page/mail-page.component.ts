// // mail/mail-page/mail-page.component.ts
// import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MailService, EmailPage } from '../service/mail.service';
// import { Email } from '../../models/email';
// import { EmailPriority } from '../../models/enums';
// import { timeout, catchError } from 'rxjs/operators';
// import { of } from 'rxjs';


// @Component({
//   selector: 'app-mail-page',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './mail-page.component.html',
//   styleUrls: ['./mail-page.component.css']
// })
// export class MailPageComponent implements OnInit {
//   // Email data
//   currentEmail: Email | null = null;
  
//   // Real email data from API
//   emailList: Email[] = [];
  
//   // Pagination
//   currentEmailIndex: number = 0;
//   currentPage: number = 0;
//   pageSize: number = 10;
//   totalEmails: number = 0;
//   totalPages: number = 0;
  
//   // Folder ID (temporary fixed value)
//   folderId: string =''; // You can change this to 'sent', 'draft', etc.
  
//   // Loading states
//   isError: boolean = false;
//   errorMessage: string = '';
  
//   // Button feedback states
//   actionFeedback: string = '';
//   showFeedback: boolean = false;
  
//   constructor(private mailService: MailService,    private cdr: ChangeDetectorRef // Add this
// ) {}
  
//   ngOnInit() {
//       console.log('MailPageComponent ngOnInit called');
// this.folderId= 'dcd27585-25c7-4508-8946-0b469855cc1a';
//     this.loadFolderEmails();
//   }
  
//   // Load emails from folder
//   loadFolderEmails(page: number = 0) {
//     this.isError = false;
    
//     this.mailService.getFolderEmails(this.folderId, page, this.pageSize)
//       .subscribe({
//         next: (emailPage: EmailPage) => {
//           this.emailList = emailPage.content;
//           this.totalEmails = emailPage.totalElements;
//           this.totalPages = emailPage.totalPages;
//           this.currentPage = emailPage.number;
//           this.totalEmails=emailPage.totalElements
//                     // this.cdr.detectChanges(); // Force change detection
// this.cdr.markForCheck();
//           console.log("FUCK",this)
//           // Load first email if available
//           if (this.emailList.length > 0) {
//             this.loadEmailByIndex(0);
//           } else {
//             this.currentEmail = null;
//           }
//            setTimeout(() => {
//           this.cdr.detectChanges();
//         });
//         },
//         error: (error) => {
//           console.error('Error loading emails:', error);
//           this.isError = true;
//           this.errorMessage = 'Failed to load emails. Please try again.';
          
//           // Fallback to mock data if API fails
//         this.cdr.markForCheck();
//         }
//       });
//   }
  
//   // Load email by index
//   loadEmailByIndex(index: number) {
//     if (index >= 0 && index < this.emailList.length) {
//       this.currentEmail = this.emailList[index];
//       this.currentEmailIndex = index;
      
//       // Mark as read when opened
//       if (!this.currentEmail.read) {
//         this.markAsRead(this.currentEmail);
//       }
//     }
//   }
  
//   // Load email when clicking from list
//   loadEmail(emailId: string) {
//     const index = this.emailList.findIndex(e => e.id === emailId);
//     if (index !== -1) {
//       this.loadEmailByIndex(index);
//     }
//   }
  
//   // Navigation methods
//   navigateEmail(direction: 'next' | 'prev') {
//     let newIndex = this.currentEmailIndex;
    
//     if (direction === 'next') {
//       // Check if we need to load next page
//       if (this.currentEmailIndex === this.emailList.length - 1 && 
//           this.currentPage < this.totalPages - 1) {
//         this.loadNextPage();
//         return;
//       }
//       newIndex = this.currentEmailIndex + 1;
//     } else if (direction === 'prev') {
//       // Check if we need to load previous page
//       if (this.currentEmailIndex === 0 && this.currentPage > 0) {
//         this.loadPrevPage();
//         return;
//       }
//       newIndex = this.currentEmailIndex - 1;
//     }
    
//     if (newIndex >= 0 && newIndex < this.emailList.length && newIndex !== this.currentEmailIndex) {
//       this.loadEmailByIndex(newIndex);
//     }
//   }
  
//   // Load next page
//   loadNextPage() {
//     if (this.currentPage < this.totalPages - 1) {
//       this.loadFolderEmails(this.currentPage + 1);
//     }
//   }
  
//   // Load previous page
//   loadPrevPage() {
//     if (this.currentPage > 0) {
//       this.loadFolderEmails(this.currentPage - 1);
//     }
//   }
  
//   // Jump to specific email
//   navigateToIndex(index: number) {
//     if (index >= 0 && index < this.emailList.length) {
//       this.loadEmailByIndex(index);
//     }
//   }
  
//   // Action methods with feedback
//   archiveEmail() {
//     if (this.currentEmail) {
//       this.currentEmail.archived = !this.currentEmail.archived;
//       this.showActionFeedback(this.currentEmail.archived ? 'Email archived' : 'Email unarchived');
//     }
//   }
  
//   deleteEmail() {
//     if (this.currentEmail) {
//       // In real app, call delete API
//       this.showActionFeedback('Email moved to trash');
//     }
//   }
  
//   markAsUnread() {
//     if (this.currentEmail) {
//       this.currentEmail.read = false;
//       this.showActionFeedback('Marked as unread');
//     }
//   }
  
//   markAsRead(email: Email) {
//     // In a real app, you would call an API to mark as read
//     email.read = true;
//   }
  
//   moveTo() {
//     this.showActionFeedback('Move to dialog would open here');
//   }
  
//   // Change folder (for testing different folders)
//   changeFolder(folderId: string) {
//     this.folderId = folderId;
//     this.loadFolderEmails(0);
//   }
  
//   // Helper method to show feedback
//   private showActionFeedback(message: string) {
//     this.actionFeedback = message;
//     this.showFeedback = true;
    
//     // Hide feedback after 2 seconds
//     setTimeout(() => {
//       this.showFeedback = false;
//     }, 2000);
//   }
  
//   // Format date nicely
//   formatDate(date: Date | string): string {
//     if (!date) return 'No date';
    
//     const dateObj = typeof date === 'string' ? new Date(date) : date;
//     return dateObj.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }
  
//   // Format file size
//   formatFileSize(bytes: number): string {
//     if (!bytes) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   }
  
//   // Get priority class for CSS
//   getPriorityClass(priority: string): string {
//     if (!priority) return 'normal';
//     return priority.toLowerCase();
//   }
  
//   // Get navigation status text
//   get navigationStatus(): string {
//     const globalIndex = (this.currentPage * this.pageSize) + (this.currentEmailIndex + 1);
//     return `${globalIndex} of ${this.totalEmails}`;
//   }
  
//   // Check if previous button should be enabled
//   get canGoPrev(): boolean {
//     return this.currentEmailIndex > 0 || this.currentPage > 0;
//   }
  
//   // Check if next button should be enabled
//   get canGoNext(): boolean {
//     return this.currentEmailIndex < this.emailList.length - 1 || this.currentPage < this.totalPages - 1;
//   }
  
//   // Get current folder name for display
//   get folderName(): string {
//     return this.folderId.charAt(0).toUpperCase() + this.folderId.slice(1);
//   }
// // }
// import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MailService, EmailPage } from '../service/mail.service';
// import { Email, Attachment } from '../../models/email';
// import { EmailPriority } from '../../models/enums';
// import { timeout, catchError } from 'rxjs/operators';
// import { of } from 'rxjs';

// @Component({
//   selector: 'app-mail-page',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './mail-page.component.html',
//   styleUrls: ['./mail-page.component.css']
// })
// export class MailPageComponent implements OnInit {
//   // Email data
//   currentEmail: Email | null = null;
//   emailList: Email[] = [];
  
//   // Pagination
//   currentEmailIndex: number = 0;
//   currentPage: number = 0;
//   pageSize: number = 10;
//   totalEmails: number = 0;
//   totalPages: number = 0;
  
//   // Folder ID
//   folderId: string = '';
  
//   // Loading states
//   isError: boolean = false;
//   errorMessage: string = '';
  
//   // Button feedback states
//   actionFeedback: string = '';
//   showFeedback: boolean = false;
  
//   // Download states
//   downloadingAttachments: Set<string> = new Set();
//   downloadingAll: boolean = false;

//   constructor(
//     private mailService: MailService,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     console.log('MailPageComponent ngOnInit called');
//     this.folderId = 'dcd27585-25c7-4508-8946-0b469855cc1a';
//     this.loadFolderEmails();
//   }

//   loadFolderEmails(page: number = 0) {
//     this.isError = false;
//     this.mailService.getFolderEmails(this.folderId, page, this.pageSize)
//       .subscribe({
//         next: (emailPage: EmailPage) => {
//           this.emailList = emailPage.content;
//           this.totalEmails = emailPage.totalElements;
//           this.totalPages = emailPage.totalPages;
//           this.currentPage = emailPage.number;
//           this.cdr.markForCheck();
          
//           if (this.emailList.length > 0) {
//             this.loadEmailByIndex(0);
//           } else {
//             this.currentEmail = null;
//           }
          
//           setTimeout(() => {
//             this.cdr.detectChanges();
//           });
//         },
//         error: (error) => {
//           console.error('Error loading emails:', error);
//           this.isError = true;
//           this.errorMessage = 'Failed to load emails. Please try again.';
//           this.cdr.markForCheck();
//         }
//       });
//   }

//   loadEmailByIndex(index: number) {
//     if (index >= 0 && index < this.emailList.length) {
//       this.currentEmail = this.emailList[index];
//       this.currentEmailIndex = index;
      
//       if (!this.currentEmail.read) {
//         this.markAsRead(this.currentEmail);
//       }
//     }
//   }

//   loadEmail(emailId: string) {
//     const index = this.emailList.findIndex(e => e.id === emailId);
//     if (index !== -1) {
//       this.loadEmailByIndex(index);
//     }
//   }

//   navigateEmail(direction: 'next' | 'prev') {
//     let newIndex = this.currentEmailIndex;
    
//     if (direction === 'next') {
//       if (this.currentEmailIndex === this.emailList.length - 1 && this.currentPage < this.totalPages - 1) {
//         this.loadNextPage();
//         return;
//       }
//       newIndex = this.currentEmailIndex + 1;
//     } else if (direction === 'prev') {
//       if (this.currentEmailIndex === 0 && this.currentPage > 0) {
//         this.loadPrevPage();
//         return;
//       }
//       newIndex = this.currentEmailIndex - 1;
//     }
    
//     if (newIndex >= 0 && newIndex < this.emailList.length && newIndex !== this.currentEmailIndex) {
//       this.loadEmailByIndex(newIndex);
//     }
//   }

//   loadNextPage() {
//     if (this.currentPage < this.totalPages - 1) {
//       this.loadFolderEmails(this.currentPage + 1);
//     }
//   }

//   loadPrevPage() {
//     if (this.currentPage > 0) {
//       this.loadFolderEmails(this.currentPage - 1);
//     }
//   }

//   navigateToIndex(index: number) {
//     if (index >= 0 && index < this.emailList.length) {
//       this.loadEmailByIndex(index);
//     }
//   }

//   archiveEmail() {
//     if (this.currentEmail) {
//       this.currentEmail.archived = !this.currentEmail.archived;
//       this.showActionFeedback(this.currentEmail.archived ? 'Email archived' : 'Email unarchived');
//     }
//   }

//   deleteEmail() {
//     if (this.currentEmail) {
//       this.showActionFeedback('Email moved to trash');
//     }
//   }

//   markAsUnread() {
//     if (this.currentEmail) {
//       this.currentEmail.read = false;
//       this.showActionFeedback('Marked as unread');
//     }
//   }

//   markAsRead(email: Email) {
//     email.read = true;
//   }

//   moveTo() {
//     this.showActionFeedback('Move to dialog would open here');
//   }

//   changeFolder(folderId: string) {
//     this.folderId = folderId;
//     this.loadFolderEmails(0);
//   }

//   // Attachment methods
//   downloadAttachment(attachment: Attachment) {
//     if (!this.currentEmail?.id) return;
    
//     this.downloadingAttachments.add(attachment.id);
    
//     this.mailService.downloadAttachment(this.currentEmail.id, attachment.id)
//       .subscribe({
//         next: (blob) => {
//           this.saveBlob(blob, attachment.fileName);
//           this.downloadingAttachments.delete(attachment.id);
//           this.showActionFeedback(`Downloaded ${attachment.fileName}`);
//         },
//         error: (error) => {
//           console.error('Error downloading attachment:', error);
//           this.downloadingAttachments.delete(attachment.id);
//           this.showActionFeedback('Failed to download attachment');
//         }
//       });
//   }

//   downloadAllAttachments() {
//     if (!this.currentEmail?.attachments || this.currentEmail.attachments.length === 0) {
//       return;
//     }
    
//     this.downloadingAll = true;
//     let completed = 0;
//     const total = this.currentEmail.attachments.length;
    
//     this.currentEmail.attachments.forEach(attachment => {
//       this.mailService.downloadAttachment(this.currentEmail!.id!, attachment.id)
//         .subscribe({
//           next: (blob) => {
//             this.saveBlob(blob, attachment.fileName);
//             completed++;
//             if (completed === total) {
//               this.downloadingAll = false;
//               this.showActionFeedback(`Downloaded ${total} attachment(s)`);
//             }
//           },
//           error: (error) => {
//             console.error('Error downloading attachment:', error);
//             completed++;
//             if (completed === total) {
//               this.downloadingAll = false;
//               this.showActionFeedback('Some downloads failed');
//             }
//           }
//         });
//     });
//   }

//   previewAttachment(attachment: Attachment) {
//     if (!this.currentEmail?.id) return;
    
//     const url = this.mailService.getAttachmentUrl(this.currentEmail.id, attachment.id);
//     window.open(url, '_blank');
//   }

//   getAttachmentDirectUrl(attachment: Attachment): string {
//     if (!this.currentEmail?.id) return '#';
//     return this.mailService.getAttachmentUrl(this.currentEmail.id, attachment.id);
//   }

//   isDownloading(attachmentId: string): boolean {
//     return this.downloadingAttachments.has(attachmentId);
//   }

//   getAttachmentIcon(fileType: string): string {
//     if (fileType.startsWith('image/')) return '🖼️';
//     if (fileType.includes('pdf')) return '📄';
//     if (fileType.includes('word')) return '📝';
//     if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
//     if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
//     if (fileType.includes('video')) return '🎥';
//     if (fileType.includes('audio')) return '🎵';
//     return '📎';
//   }

//   private saveBlob(blob: Blob, fileName: string) {
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(url);
//   }

//   private showActionFeedback(message: string) {
//     this.actionFeedback = message;
//     this.showFeedback = true;
//     setTimeout(() => {
//       this.showFeedback = false;
//     }, 2000);
//   }

//   formatDate(date: Date | string): string {
//     if (!date) return 'No date';
//     const dateObj = typeof date === 'string' ? new Date(date) : date;
//     return dateObj.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

//   formatFileSize(bytes: number): string {
//     if (!bytes) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   }

//   getPriorityClass(priority: string): string {
//     if (!priority) return 'normal';
//     return priority.toLowerCase();
//   }

//   get navigationStatus(): string {
//     const globalIndex = (this.currentPage * this.pageSize) + (this.currentEmailIndex + 1);
//     return `${globalIndex} of ${this.totalEmails}`;
//   }

//   get canGoPrev(): boolean {
//     return this.currentEmailIndex > 0 || this.currentPage > 0;
//   }

//   get canGoNext(): boolean {
//     return this.currentEmailIndex < this.emailList.length - 1 || this.currentPage < this.totalPages - 1;
//   }

//   get folderName(): string {
//     return this.folderId.charAt(0).toUpperCase() + this.folderId.slice(1);
//   }
// }
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MailService, EmailPage } from '../service/mail.service';
import { Email, Attachment } from '../../models/email';
import { EmailPriority } from '../../models/enums';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SideBar } from "../../shared/side-bar/side-bar";

@Component({
  selector: 'app-mail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SideBar],
  templateUrl: './mail-page.component.html',
  styleUrls: ['./mail-page.component.css']
})
export class MailPageComponent implements OnInit {
  // Email data
  currentEmail: Email | null = null;
  emailList: Email[] = [];
  
  // Pagination
  currentEmailIndex: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  totalEmails: number = 0;
  totalPages: number = 0;
  
  // Folder ID
  folderId: string = '';
  
  // Loading states
  isError: boolean = false;
  errorMessage: string = '';
  
  // Button feedback states
  actionFeedback: string = '';
  showFeedback: boolean = false;
  
  // Download states
  downloadingAttachments: Set<string> = new Set();
  downloadingAll: boolean = false;

  constructor(
    private mailService: MailService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('MailPageComponent ngOnInit called');
    this.folderId = 'dcd27585-25c7-4508-8946-0b469855cc1a';
    this.loadFolderEmails();
  }

  loadFolderEmails(page: number = 0) {
    this.isError = false;
    this.mailService.getFolderEmails(this.folderId, page, this.pageSize)
      .subscribe({
        next: (emailPage: EmailPage) => {
          // Ensure all emails have proper array initialization
          this.emailList = emailPage.content.map(email => ({
            ...email,
            to: email.to || email.toList || [],
            cc: email.cc || [],
            bcc: email.bcc || [],
            attachments: email.attachments || []
          }));
          
          this.totalEmails = emailPage.totalElements;
          this.totalPages = emailPage.totalPages;
          this.currentPage = emailPage.number;
          this.cdr.markForCheck();
          
          if (this.emailList.length > 0) {
            this.loadEmailByIndex(0);
          } else {
            this.currentEmail = null;
          }
          
          setTimeout(() => {
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error('Error loading emails:', error);
          this.isError = true;
          this.errorMessage = 'Failed to load emails. Please try again.';
          this.cdr.markForCheck();
        }
      });
  }


  loadEmailByIndex(index: number) {
    if (index >= 0 && index < this.emailList.length) {
      this.currentEmail = this.emailList[index];
      this.currentEmailIndex = index;
      
      if (!this.currentEmail.isRead) {
        this.markAsRead(this.currentEmail);
      }
    }
  }

  loadEmail(emailId: string) {
    const index = this.emailList.findIndex(e => e.id === emailId);
    if (index !== -1) {
      this.loadEmailByIndex(index);
    }
  }

  navigateEmail(direction: 'next' | 'prev') {
    let newIndex = this.currentEmailIndex;
    
    if (direction === 'next') {
      if (this.currentEmailIndex === this.emailList.length - 1 && this.currentPage < this.totalPages - 1) {
        this.loadNextPage();
        return;
      }
      newIndex = this.currentEmailIndex + 1;
    } else if (direction === 'prev') {
      if (this.currentEmailIndex === 0 && this.currentPage > 0) {
        this.loadPrevPage();
        return;
      }
      newIndex = this.currentEmailIndex - 1;
    }
    
    if (newIndex >= 0 && newIndex < this.emailList.length && newIndex !== this.currentEmailIndex) {
      this.loadEmailByIndex(newIndex);
    }
  }

  loadNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.loadFolderEmails(this.currentPage + 1);
    }
  }

  loadPrevPage() {
    if (this.currentPage > 0) {
      this.loadFolderEmails(this.currentPage - 1);
    }
  }

  navigateToIndex(index: number) {
    if (index >= 0 && index < this.emailList.length) {
      this.loadEmailByIndex(index);
    }
  }

  archiveEmail() {
    if (this.currentEmail) {
      this.currentEmail.archived = !this.currentEmail.archived;
      this.showActionFeedback(this.currentEmail.archived ? 'Email archived' : 'Email unarchived');
    }
  }

  deleteEmail() {
    if (this.currentEmail) {
      this.showActionFeedback('Email moved to trash');
    }
  }

  markAsUnread() {
    if (this.currentEmail) {
      this.currentEmail.isRead = false;
      this.showActionFeedback('Marked as unread');
    }
  }

  markAsRead(email: Email) {
    email.isRead = true;
  }

  moveTo() {
    this.showActionFeedback('Move to dialog would open here');
  }

  changeFolder(folderId: string) {
    this.folderId = folderId;
    this.loadFolderEmails(0);
  }

  // Attachment methods
  downloadAttachment(attachment: Attachment) {
    if (!this.currentEmail?.id) return;
    
    this.downloadingAttachments.add(attachment.id);
    
    this.mailService.downloadAttachment(this.currentEmail.id, attachment.id)
      .subscribe({
        next: (blob) => {
          this.saveBlob(blob, attachment.fileName);
          this.downloadingAttachments.delete(attachment.id);
          this.showActionFeedback(`Downloaded ${attachment.fileName}`);
        },
        error: (error) => {
          console.error('Error downloading attachment:', error);
          this.downloadingAttachments.delete(attachment.id);
          this.showActionFeedback('Failed to download attachment');
        }
      });
  }

  downloadAllAttachments() {
    if (!this.currentEmail?.attachments || this.currentEmail.attachments.length === 0) {
      return;
    }
    
    this.downloadingAll = true;
    
    // Use the new download-all endpoint that returns a ZIP
    this.mailService.downloadAllAttachments(this.currentEmail.id!)
      .subscribe({
        next: (blob) => {
          const filename = `attachments_${this.currentEmail!.subject.substring(0, 20)}.zip`;
          this.saveBlob(blob, filename);
          this.downloadingAll = false;
          this.showActionFeedback(`Downloaded all attachments as ZIP`);
        },
        error: (error) => {
          console.error('Error downloading all attachments:', error);
          this.downloadingAll = false;
          this.showActionFeedback('Failed to download attachments');
        }
      });
  }

  previewAttachment(attachment: Attachment) {
    if (!this.currentEmail?.id) return;
    
    // Use preview endpoint instead of download endpoint
    const url = this.mailService.getAttachmentPreviewUrl(this.currentEmail.id, attachment.id);
    window.open(url, '_blank');
  }

  getAttachmentDirectUrl(attachment: Attachment): string {
    if (!this.currentEmail?.id) return '#';
    return this.mailService.getAttachmentUrl(this.currentEmail.id, attachment.id);
  }

  isDownloading(attachmentId: string): boolean {
    return this.downloadingAttachments.has(attachmentId);
  }

  getAttachmentIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    return '📎';
  }

  private saveBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private showActionFeedback(message: string) {
    this.actionFeedback = message;
    this.showFeedback = true;
    setTimeout(() => {
      this.showFeedback = false;
    }, 2000);
  }

  formatDate(date: Date | string): string {
    if (!date) return 'No date';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getPriorityClass(priority: string): string {
    if (!priority) return 'normal';
    return priority.toLowerCase();
  }

  get navigationStatus(): string {
    const globalIndex = (this.currentPage * this.pageSize) + (this.currentEmailIndex + 1);
    return `${globalIndex} of ${this.totalEmails}`;
  }

  get canGoPrev(): boolean {
    return this.currentEmailIndex > 0 || this.currentPage > 0;
  }

  get canGoNext(): boolean {
    return this.currentEmailIndex < this.emailList.length - 1 || this.currentPage < this.totalPages - 1;
  }

  get folderName(): string {
    return this.folderId.charAt(0).toUpperCase() + this.folderId.slice(1);
  }
}