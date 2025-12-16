



import { ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MailService, EmailPage } from '../service/mail.service';
import { Email, Attachment } from '../../models/email';
import { EmailPriority } from '../../models/enums';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SideBar } from "../../shared/side-bar/side-bar";
import { ActivatedRoute, Router } from '@angular/router';
import { Folder } from '../../models/folder';
import { FolderService } from '../../Services/folderService';
import { EmailService } from '../../Services/EmailService';
import { SidebarComponent } from "../../slidebar.component/sidebar.component"

@Component({
  selector: 'app-mail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SideBar, SidebarComponent],
  templateUrl: './mail-page.component.html',
  styleUrls: ['./mail-page.component.css']
})
export class MailPageComponent implements OnInit {
  currentFolderName: string = '';
  loadEmailId: string = '';
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
  // downloadingAttachments: Set<string> = new Set();
  downloadingAll: boolean = false;
  folders: Folder[] = [];
  showMoveDropdown = false;
  selectedTargetFolderId: string = '';
  movingEmail = false;

  constructor(
    private mailService: MailService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private folderService: FolderService,
    private emailservice: EmailService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Close dropdown if clicking outside the move dropdown wrapper
    if (!target.closest('.move-dropdown-wrapper')) {
      this.showMoveDropdown = false;
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.folderId = params.get('folderId') || '';
      this.loadEmailId = params.get('emailId') || '';
      
      if (this.folderId) {
        this.loadCurrentFolderName();
        this.loadFolders();
        this.loadFolderEmails();
        
        if (this.loadEmailId) {
          // Email will be loaded in loadFolderEmails callback
        }
      }
    });
  }

  loadCurrentFolderName() {
    if (!this.folderId) return;
    
    this.folderService.getFolderByID(this.folderId).subscribe({
      next: (folder) => {
        this.currentFolderName = folder.name;
      },
      error: (error) => {
        console.error('Error loading folder:', error);
        this.currentFolderName = '';
      }
    });
  }

  loadFolders() {
    this.folderService.getFolders().subscribe({
      next: (folders) => {
        this.folders = folders.filter(f => f.id !== this.folderId);
      },
      error: (error) => {
        console.error('Error loading folders:', error);
      }
    });
  }

  getAvailableFolders(): Folder[] {
    return this.folders.filter(folder => folder.id !== this.folderId);
  }

  onFolderSelected(folderId: string) {
    this.router.navigate(['/mail', folderId]);
  }

  loadFolderEmails(page: number = 0) {
    this.isError = false;
    this.mailService.getFolderEmails(this.folderId, page, this.pageSize)
      .subscribe({
        next: (emailPage: EmailPage) => {
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
            if (this.loadEmailId) {
              this.findAndLoadEmail(this.loadEmailId);
            } else {
              this.loadEmailByIndex(0);
            }
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

  private findAndLoadEmail(emailId: string) {
    const index = this.emailList.findIndex(e => e.id === emailId);
    if (index !== -1) {
      this.loadEmailByIndex(index);
      return true;
    }
    
    if (this.emailList.length > 0) {
      this.loadEmailByIndex(0);
      console.log(`Email with ID ${emailId} not found on current page, loading first email instead`);
    } else {
      this.currentEmail = null;
    }
    return false;
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

  archiveEmail(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (this.currentEmail) {
      this.currentEmail.archived = !this.currentEmail.archived;
      this.showActionFeedback(this.currentEmail.archived ? 'Email archived' : 'Email unarchived');
    }
  }

  deleteEmail(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.currentEmail?.id) return;
    
    if (confirm('Move this email to trash?')) {
      this.emailservice.deleteEmail(this.currentEmail.id).subscribe({
        next: (response) => {
          console.log('Email moved to trash - response received');
          this.showActionFeedback('Email moved to trash');
          
          const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
          if (index !== -1) {
            this.emailList.splice(index, 1);
            this.totalEmails--;
            
            if (this.emailList.length > 0) {
              const newIndex = Math.min(index, this.emailList.length - 1);
              this.loadEmailByIndex(newIndex);
            } else {
              this.currentEmail = null;
            }
          }
          
          // Force change detection
          this.cdr.detectChanges();
          console.log('Change detection triggered');
        },
        error: (error) => {
          console.error('Error deleting email:', error);
          this.showActionFeedback('Failed to delete email');
        }
      });
    }
  }

  permanentlyDeleteEmail(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.currentEmail?.id) return;
    
    if (confirm('Permanently delete this email? This action cannot be undone.')) {
      const isTrash = this.folderId === 'trash' || this.currentFolderName === 'Trash';
      
      if (isTrash) {
        this.emailservice.deleteEmailPermanent([this.currentEmail.id]).subscribe({
          next: (response) => {
            console.log('Email permanently deleted - response received');
            this.showActionFeedback('Email permanently deleted');
            
            const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
            if (index !== -1) {
              this.emailList.splice(index, 1);
              this.totalEmails--;
              
              if (this.emailList.length > 0) {
                const newIndex = Math.min(index, this.emailList.length - 1);
                this.loadEmailByIndex(newIndex);
              } else {
                this.currentEmail = null;
              }
            }
            
            // Force change detection
            this.cdr.detectChanges();
            console.log('Change detection triggered');
          },
          error: (error) => {
            console.error('Error permanently deleting email:', error);
            this.showActionFeedback('Failed to delete email');
          }
        });
      } else {
        this.deleteEmail();
      }
    }
  }

  markAsUnread(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.currentEmail?.id || !this.currentEmail.isRead) return;
    
    this.emailservice.markAsUnread(this.currentEmail.id).subscribe({
      next: (response) => {
        console.log('Marked as unread - response received');
        
        // Update current email
        this.currentEmail!.isRead = false;
        
        // Update the email in the list
        const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
        if (index !== -1) {
          this.emailList[index].isRead = false;
        }
        
        this.showActionFeedback('Marked as unread');
        
        // Force change detection
        this.cdr.detectChanges();
        console.log('Change detection triggered - email isRead:', this.currentEmail!.isRead);
      },
      error: (error) => {
        console.error('Error marking email as unread:', error);
        this.showActionFeedback('Failed to mark as unread');
      }
    });
  }

  markAsRead(email: Email,event?: Event) {
        if (event) {
      event.stopPropagation();
    }
    if (!email.id || email.isRead) return;
    
    this.emailservice.markRead(email.id).subscribe({
      next: (response) => {
        email.isRead = true;
        const index = this.emailList.findIndex(e => e.id === email.id);
        if (index !== -1) {
          this.emailList[index].isRead = true;
        }
                this.showActionFeedback('Marked as read');
        
        // Force change detection
        this.cdr.detectChanges();
        console.log('Change detection triggered - email isRead:', this.currentEmail!.isRead);
      },
      error: (error) => {
        console.error('Error marking email as read:', error);
      }
    });
  }

  moveTo(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showMoveDropdown = !this.showMoveDropdown;
  }

  moveEmailToFolder(targetFolderId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.currentEmail?.id || !targetFolderId) return;
    
    this.movingEmail = true;
    
    this.emailservice.moveEmail(this.currentEmail.id, targetFolderId).subscribe({
      next: (response) => {
        console.log('Email moved successfully - response received');
        this.showActionFeedback('Email moved successfully');
        this.showMoveDropdown = false;
        this.movingEmail = false;
        
        const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
        if (index !== -1) {
          this.emailList.splice(index, 1);
          this.totalEmails--;
          
          if (this.emailList.length > 0) {
            const newIndex = Math.min(index, this.emailList.length - 1);
            this.loadEmailByIndex(newIndex);
          } else {
            this.currentEmail = null;
          }
        }
        
        // Force change detection
        this.cdr.detectChanges();
        console.log('Change detection triggered');
      },
      error: (error) => {
        console.error('Error moving email:', error);
        this.showActionFeedback('Failed to move email');
        this.movingEmail = false;
      }
    });
  }

  changeFolder(folderId: string) {
    this.folderId = folderId;
    this.loadFolderEmails(0);
  }

  // Attachment methods
  downloadAttachment(attachment: Attachment) {
    if (!this.currentEmail?.id) return;
    
    // this.downloadingAttachments.add(attachment.id);
    
    this.mailService.downloadAttachment(this.currentEmail.id, attachment.id)
      .subscribe({
        next: (blob) => {
          this.saveBlob(blob, attachment.fileName);
          // this.downloadingAttachments.delete(attachment.id);
          this.showActionFeedback(`Downloaded ${attachment.fileName}`);
        },
        error: (error) => {
          console.error('Error downloading attachment:', error);
          // this.downloadingAttachments.delete(attachment.id);
          this.showActionFeedback('Failed to download attachment');
        }
      });
  }

  downloadAllAttachments() {
    if (!this.currentEmail?.attachments || this.currentEmail.attachments.length === 0) {
      return;
    }
    
    this.downloadingAll = true;
    
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
    
    const url = this.mailService.getAttachmentPreviewUrl(this.currentEmail.id, attachment.id);
    window.open(url, '_blank');
  }

  getAttachmentDirectUrl(attachment: Attachment): string {
    if (!this.currentEmail?.id) return '#';
    return this.mailService.getAttachmentUrl(this.currentEmail.id, attachment.id);
  }

  // isDownloading(attachmentId: string): boolean {
  //   return this.downloadingAttachments.has(attachmentId);
  // }

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
  handleKeyboardEvent(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') this.navigateEmail('next');
  if (event.key === 'ArrowLeft') this.navigateEmail('prev');
}
}



























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










// 
// 
// 
// 
// 
// 
// 
// 
// 
// 









// import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MailService, EmailPage } from '../service/mail.service';
// import { Email, Attachment } from '../../models/email';
// import { EmailPriority } from '../../models/enums';
// import { timeout, catchError } from 'rxjs/operators';
// import { of } from 'rxjs';
// import { SideBar } from "../../shared/side-bar/side-bar";
// import { ActivatedRoute, Router } from '@angular/router';
// import { Folder } from '../../models/folder';
// import { FolderService } from '../../Services/folderService';
// import { EmailService } from '../../Services/EmailService';
// import { SidebarComponent } from "../../slidebar.component/sidebar.component" // Note: based on your component filename


// @Component({
//   selector: 'app-mail-page',
//   standalone: true,
//   imports: [CommonModule, FormsModule, SideBar,SidebarComponent],
//   templateUrl: './mail-page.component.html',
//   styleUrls: ['./mail-page.component.css']
// })
// export class MailPageComponent implements OnInit {
//   currentFolderName: string = '';

//   // Email data
//   loadEmailId: string = '';

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
//  folders: Folder[] = [];
//   showMoveDropdown = false;
//   selectedTargetFolderId: string = '';
//   movingEmail = false;
//   constructor(
//     private mailService: MailService,
//     private cdr: ChangeDetectorRef,
//     private route: ActivatedRoute,
//   private router: Router,
//       private folderService: FolderService , // Add this
//       private emailservice :EmailService

//   ) {}
//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent) {
//     const target = event.target as HTMLElement;
//     // Close dropdown if clicking outside the move dropdown wrapper
//     if (!target.closest('.move-dropdown-wrapper')) {
//       this.showMoveDropdown = false;
//     }
//   }
//   ngOnInit() {
//     // console.log('MailPageComponent ngOnInit called');
//     // this.folderId = 'dcd27585-25c7-4508-8946-0b469855cc1a';
//     // this.loadFolderEmails();
//      this.route.paramMap.subscribe(params => {
//     this.folderId = params.get('folderId') || '';
//     this.loadEmailId = params.get('emailId') || '';
    
//      if (this.folderId) {
//             this.loadCurrentFolderName(); // Load the actual folder name

//       this.loadFolders();
//       this.loadFolderEmails(); 
//       console.log(this.currentFolderName);// Load emails for the folder
      
//       // If emailId is provided, wait for emails to load then find it
//       if (this.loadEmailId) {
//         // We'll find the email after emails are loaded
//         // The actual finding will happen in loadFolderEmails callback
//       }
//     }
//   });
//   }
//   loadCurrentFolderName() {
//   if (!this.folderId) return;
  
//   this.folderService.getFolderByID(this.folderId).subscribe({
//     next: (folder) => {
//       this.currentFolderName = folder.name;
//     },
//     error: (error) => {
//       console.error('Error loading folder:', error);
//       this.currentFolderName = '';
//     }
//   });
// }
//  loadFolders() {
//     this.folderService.getFolders().subscribe({
//       next: (folders) => {
//         this.folders = folders;
//         // Filter out current folder from the list
//         this.folders = this.folders.filter(f => f.id !== this.folderId);
//       },
//       error: (error) => {
//         console.error('Error loading folders:', error);
//       }
//     });
//   }
//   getAvailableFolders(): Folder[] {
//     return this.folders.filter(folder => folder.id !== this.folderId);
//   }
//   // loadFolderEmails(page: number = 0) {
//   //   this.isError = false;
//   //   this.mailService.getFolderEmails(this.folderId, page, this.pageSize)
//   //     .subscribe({
//   //       next: (emailPage: EmailPage) => {
//   //         // Ensure all emails have proper array initialization
//   //         this.emailList = emailPage.content.map(email => ({
//   //           ...email,
//   //           to: email.to || email.toList || [],
//   //           cc: email.cc || [],
//   //           bcc: email.bcc || [],
//   //           attachments: email.attachments || []
//   //         }));
          
//   //         this.totalEmails = emailPage.totalElements;
//   //         this.totalPages = emailPage.totalPages;
//   //         this.currentPage = emailPage.number;
//   //         this.cdr.markForCheck();
          
//   //         if (this.emailList.length > 0) {
//   //           this.loadEmailByIndex(0);
//   //         } else {
//   //           this.currentEmail = null;
//   //         }
          
//   //         setTimeout(() => {
//   //           this.cdr.detectChanges();
//   //         });
//   //       },
//   //       error: (error) => {
//   //         console.error('Error loading emails:', error);
//   //         this.isError = true;
//   //         this.errorMessage = 'Failed to load emails. Please try again.';
//   //         this.cdr.markForCheck();
//   //       }
//   //     });
//   // }
//   onFolderSelected(folderId: string) {
//   // Navigate to the selected folder
//   this.router.navigate(['/mail', folderId]);
  
//   // Or if you want to load directly without navigation:
//   // this.folderId = folderId;
//   // this.loadCurrentFolderName();
//   // this.loadFolderEmails();
//   // this.loadFolders(); // Refresh folder list to update current folder
// }
// loadFolderEmails(page: number = 0) {
//   this.isError = false;
//   this.mailService.getFolderEmails(this.folderId, page, this.pageSize)
//     .subscribe({
//       next: (emailPage: EmailPage) => {
//         // Ensure all emails have proper array initialization
//         this.emailList = emailPage.content.map(email => ({
//           ...email,
//           to: email.to || email.toList || [],
//           cc: email.cc || [],
//           bcc: email.bcc || [],
//           attachments: email.attachments || []
//         }));
        
//         this.totalEmails = emailPage.totalElements;
//         this.totalPages = emailPage.totalPages;
//         this.currentPage = emailPage.number;
//         this.cdr.markForCheck();
        
//         if (this.emailList.length > 0) {
//           // First, try to find the specific email if loadEmailId is provided
//           if (this.loadEmailId) {
//             this.findAndLoadEmail(this.loadEmailId);
//           } else {
//             // Otherwise load the first email
//             this.loadEmailByIndex(0);
//           }
//         } else {
//           this.currentEmail = null;
//         }
        
//         setTimeout(() => {
//           this.cdr.detectChanges();
//         });
//       },
//       error: (error) => {
//         console.error('Error loading emails:', error);
//         this.isError = true;
//         this.errorMessage = 'Failed to load emails. Please try again.';
//         this.cdr.markForCheck();
//       }
//     });
// }
// private findAndLoadEmail(emailId: string) {
//   // First check current page
//   const index = this.emailList.findIndex(e => e.id === emailId);
//   if (index !== -1) {
//     this.loadEmailByIndex(index);
//     return true;
//   }
  
//   // If not found on current page, you might want to search through all pages
//   // For now, just load the first email if not found
//   if (this.emailList.length > 0) {
//     this.loadEmailByIndex(0);
//     console.log(`Email with ID ${emailId} not found on current page, loading first email instead`);
//   } else {
//     this.currentEmail = null;
//   }
//   return false;
// }
//   loadEmailByIndex(index: number) {
//     if (index >= 0 && index < this.emailList.length) {
//       this.currentEmail = this.emailList[index];
//       this.currentEmailIndex = index;
      
//       if (!this.currentEmail.isRead) {
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
//   if (!this.currentEmail?.id) return;
  
//   if (confirm('Move this email to trash?')) {
//     this.emailservice.deleteEmail(this.currentEmail.id).subscribe({
//       next: (response) => {
//         this.showActionFeedback('Email moved to trash');
        
//         // Remove the email from current list
//         const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//         if (index !== -1) {
//           this.emailList.splice(index, 1);
//           this.totalEmails--;
          
//           // Navigate to next email or previous
//           if (this.emailList.length > 0) {
//             const newIndex = Math.min(index, this.emailList.length - 1);
//             this.loadEmailByIndex(newIndex);
//           } else {
//             this.currentEmail = null;
//           }
//         }
//       },
//       error: (error) => {
//         console.error('Error deleting email:', error);
//         this.showActionFeedback('Failed to delete email');
//       }
//     });
//   }
// }
// permanentlyDeleteEmail() {
//   if (!this.currentEmail?.id) return;
  
//   if (confirm('Permanently delete this email? This action cannot be undone.')) {
//     // Check if current folder is Trash
//     const isTrash = this.folderId === 'trash' || this.currentFolderName === 'Trash';
    
//     if (isTrash) {
//       // Use permanent delete
//       console.log("fggg");
//       this.emailservice.deleteEmailPermanent([this.currentEmail.id]).subscribe({
//         next: (response) => {
//           this.showActionFeedback('Email permanently deleted');
          
//           // Remove from list
//           const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//           if (index !== -1) {
//             this.emailList.splice(index, 1);
//             this.totalEmails--;
            
//             if (this.emailList.length > 0) {
//               const newIndex = Math.min(index, this.emailList.length - 1);
//               this.loadEmailByIndex(newIndex);
//             } else {
//               this.currentEmail = null;
//             }
//           }
//         },
//         error: (error) => {
//           console.error('Error permanently deleting email:', error);
//           this.showActionFeedback('Failed to delete email');
//         }
//       });
//     } else {
//       // Regular delete (move to trash)
//       this.deleteEmail();
//     }
//   }
// }

//  markAsUnread() {
//   if (!this.currentEmail?.id || !this.currentEmail.isRead) return;
  
//   this.emailservice.markAsUnread(this.currentEmail.id).subscribe({
//     next: (response) => {
//       this.currentEmail!.isRead = false;
//       this.showActionFeedback('Marked as unread');
      
//       // Update the email in the list too
//       const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//       if (index !== -1) {
//         this.emailList[index].isRead = false;
//       }
//     },
//     error: (error) => {
//       console.error('Error marking email as unread:', error);
//       this.showActionFeedback('Failed to mark as unread');
//     }
//   });
// }

//   markAsRead(email: Email) {
//   if (!email.id || email.isRead) return;
  
//   this.emailservice.markRead(email.id).subscribe({
//     next: (response) => {
//       email.isRead = true;
//       // Update the email in the list too
//       const index = this.emailList.findIndex(e => e.id === email.id);
//       if (index !== -1) {
//         this.emailList[index].isRead = true;
//       }
//     },
//     error: (error) => {
//       console.error('Error marking email as read:', error);
//     }
//   });
// }

//   // Replace the existing moveTo() method with this:
// moveTo() {
//   this.showMoveDropdown = !this.showMoveDropdown;
// }

// // Add this method to actually move the email
// moveEmailToFolder(targetFolderId: string) {
//   if (!this.currentEmail?.id || !targetFolderId) return;
  
//   this.movingEmail = true;
  
//   this.emailservice.moveEmail(this.currentEmail.id, targetFolderId).subscribe({
//     next: (response) => {
//       this.showActionFeedback('Email moved successfully');
//       this.showMoveDropdown = false;
//       this.movingEmail = false;
      
//       // Option 1: Remove the email from current list
//       const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//       if (index !== -1) {
//         this.emailList.splice(index, 1);
//         this.totalEmails--;
        
//         // Navigate to next email or previous
//         if (this.emailList.length > 0) {
//           const newIndex = Math.min(index, this.emailList.length - 1);
//           this.loadEmailByIndex(newIndex);
//         } else {
//           this.currentEmail = null;
//         }
//       }
      
//       // Option 2: Or reload the current folder
//       // this.loadFolderEmails(this.currentPage);
//     },
//     error: (error) => {
//       console.error('Error moving email:', error);
//       this.showActionFeedback('Failed to move email');
//       this.movingEmail = false;
//     }
//   });
// }

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
    
//     // Use the new download-all endpoint that returns a ZIP
//     this.mailService.downloadAllAttachments(this.currentEmail.id!)
//       .subscribe({
//         next: (blob) => {
//           const filename = `attachments_${this.currentEmail!.subject.substring(0, 20)}.zip`;
//           this.saveBlob(blob, filename);
//           this.downloadingAll = false;
//           this.showActionFeedback(`Downloaded all attachments as ZIP`);
//         },
//         error: (error) => {
//           console.error('Error downloading all attachments:', error);
//           this.downloadingAll = false;
//           this.showActionFeedback('Failed to download attachments');
//         }
//       });
//   }

//   previewAttachment(attachment: Attachment) {
//     if (!this.currentEmail?.id) return;
    
//     // Use preview endpoint instead of download endpoint
//     const url = this.mailService.getAttachmentPreviewUrl(this.currentEmail.id, attachment.id);
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



// 
// 
// 
// 
// 




// import { ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MailService, EmailPage } from '../service/mail.service';
// import { Email, Attachment } from '../../models/email';
// import { EmailPriority } from '../../models/enums';
// import { timeout, catchError } from 'rxjs/operators';
// import { of } from 'rxjs';
// import { SideBar } from "../../shared/side-bar/side-bar";
// import { ActivatedRoute, Router } from '@angular/router';
// import { Folder } from '../../models/folder';
// import { FolderService } from '../../Services/folderService';
// import { EmailService } from '../../Services/EmailService';
// import { SidebarComponent } from "../../slidebar.component/sidebar.component"

// @Component({
//   selector: 'app-mail-page',
//   standalone: true,
//   imports: [CommonModule, FormsModule, SideBar, SidebarComponent],
//   templateUrl: './mail-page.component.html',
//   styleUrls: ['./mail-page.component.css']
// })
// export class MailPageComponent implements OnInit {
//   currentFolderName: string = '';
//   loadEmailId: string = '';
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
//   folders: Folder[] = [];
//   showMoveDropdown = false;
//   selectedTargetFolderId: string = '';
//   movingEmail = false;

//   constructor(
//     private mailService: MailService,
//     private cdr: ChangeDetectorRef,
//     private route: ActivatedRoute,
//     private router: Router,
//     private folderService: FolderService,
//     private emailservice: EmailService
//   ) {}

//   // Add global click listener to close dropdown when clicking outside
//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent) {
//     const target = event.target as HTMLElement;
//     // Close dropdown if clicking outside the move dropdown wrapper
//     if (!target.closest('.move-dropdown-wrapper')) {
//       this.showMoveDropdown = false;
//     }
//   }

//   ngOnInit() {
//     this.route.paramMap.subscribe(params => {
//       this.folderId = params.get('folderId') || '';
//       this.loadEmailId = params.get('emailId') || '';
      
//       if (this.folderId) {
//         this.loadCurrentFolderName();
//         this.loadFolders();
//         this.loadFolderEmails();
        
//         if (this.loadEmailId) {
//           // Email will be loaded in loadFolderEmails callback
//         }
//       }
//     });
//   }

//   loadCurrentFolderName() {
//     if (!this.folderId) return;
    
//     this.folderService.getFolderByID(this.folderId).subscribe({
//       next: (folder) => {
//         this.currentFolderName = folder.name;
//       },
//       error: (error) => {
//         console.error('Error loading folder:', error);
//         this.currentFolderName = '';
//       }
//     });
//   }

//   loadFolders() {
//     this.folderService.getFolders().subscribe({
//       next: (folders) => {
//         this.folders = folders.filter(f => f.id !== this.folderId);
//       },
//       error: (error) => {
//         console.error('Error loading folders:', error);
//       }
//     });
//   }

//   getAvailableFolders(): Folder[] {
//     return this.folders.filter(folder => folder.id !== this.folderId);
//   }

//   onFolderSelected(folderId: string) {
//     this.router.navigate(['/mail', folderId]);
//   }

//   loadFolderEmails(page: number = 0) {
//     this.isError = false;
//     this.mailService.getFolderEmails(this.folderId, page, this.pageSize)
//       .subscribe({
//         next: (emailPage: EmailPage) => {
//           this.emailList = emailPage.content.map(email => ({
//             ...email,
//             to: email.to || email.toList || [],
//             cc: email.cc || [],
//             bcc: email.bcc || [],
//             attachments: email.attachments || []
//           }));
          
//           this.totalEmails = emailPage.totalElements;
//           this.totalPages = emailPage.totalPages;
//           this.currentPage = emailPage.number;
//           this.cdr.markForCheck();
          
//           if (this.emailList.length > 0) {
//             if (this.loadEmailId) {
//               this.findAndLoadEmail(this.loadEmailId);
//             } else {
//               this.loadEmailByIndex(0);
//             }
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

//   private findAndLoadEmail(emailId: string) {
//     const index = this.emailList.findIndex(e => e.id === emailId);
//     if (index !== -1) {
//       this.loadEmailByIndex(index);
//       return true;
//     }
    
//     if (this.emailList.length > 0) {
//       this.loadEmailByIndex(0);
//       console.log(`Email with ID ${emailId} not found on current page, loading first email instead`);
//     } else {
//       this.currentEmail = null;
//     }
//     return false;
//   }

//   loadEmailByIndex(index: number) {
//     if (index >= 0 && index < this.emailList.length) {
//       this.currentEmail = this.emailList[index];
//       this.currentEmailIndex = index;
      
//       if (!this.currentEmail.isRead) {
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

//   archiveEmail(event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
    
//     if (this.currentEmail) {
//       this.currentEmail.archived = !this.currentEmail.archived;
//       this.showActionFeedback(this.currentEmail.archived ? 'Email archived' : 'Email unarchived');
//     }
//     console.log('Archive email clicked');
//   }

//   deleteEmail(event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
    
//     if (!this.currentEmail?.id) return;
    
//       this.emailservice.deleteEmail(this.currentEmail.id).subscribe({
//         next: (response) => {
//           this.showActionFeedback('Email moved to trash');
          
//           const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//           if (index !== -1) {
//             this.emailList.splice(index, 1);
//             this.totalEmails--;
            
//             if (this.emailList.length > 0) {
//               const newIndex = Math.min(index, this.emailList.length - 1);
//               this.loadEmailByIndex(newIndex);
//             } else {
//               this.currentEmail = null;
//             }
//           }
//           console.log('Email moved to trash');
//         },
//         error: (error) => {
//           console.error('Error deleting email:', error);
//           this.showActionFeedback('Failed to delete email');
//         }
//       });
    
//   }

//   permanentlyDeleteEmail(event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
    
//     if (!this.currentEmail?.id) return;
    
//     if (confirm('Permanently delete this email? This action cannot be undone.')) {
//       const isTrash = this.folderId === 'trash' || this.currentFolderName === 'Trash';
      
//       if (isTrash) {
//         this.emailservice.deleteEmailPermanent([this.currentEmail.id]).subscribe({
//           next: (response) => {
//             this.showActionFeedback('Email permanently deleted');
            
//             const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//             if (index !== -1) {
//               this.emailList.splice(index, 1);
//               this.totalEmails--;
              
//               if (this.emailList.length > 0) {
//                 const newIndex = Math.min(index, this.emailList.length - 1);
//                 this.loadEmailByIndex(newIndex);
//               } else {
//                 this.currentEmail = null;
//               }
//             }
//           },
//           error: (error) => {
//             console.error('Error permanently deleting email:', error);
//             this.showActionFeedback('Failed to delete email');
//           }
//         });
//       } else {
//         this.deleteEmail();
//       }
//     }
//   }

//   markAsUnread(event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
    
//     if (!this.currentEmail?.id || !this.currentEmail.isRead) return;
    
//     this.emailservice.markAsUnread(this.currentEmail.id).subscribe({
//       next: (response) => {
//         this.currentEmail!.isRead = false;
//         this.showActionFeedback('Marked as unread');
        
//         const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//         if (index !== -1) {
//           this.emailList[index].isRead = false;
//         }
//         console.log('Email marked as unread');
//       },
//       error: (error) => {
//         console.error('Error marking email as unread:', error);
//         this.showActionFeedback('Failed to mark as unread');
//       }
//     });
//   }

//   markAsRead(email: Email) {
//     if (!email.id || email.isRead) return;
    
//     this.emailservice.markRead(email.id).subscribe({
//       next: (response) => {
//         email.isRead = true;
//         const index = this.emailList.findIndex(e => e.id === email.id);
//         if (index !== -1) {
//           this.emailList[index].isRead = true;
//         }
//         console.log('Email marked as read');
//       },
//       error: (error) => {
//         console.error('Error marking email as read:', error);
//       }
//     });
//   }

//   moveTo(event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
//     this.showMoveDropdown = !this.showMoveDropdown;
//   }

//   moveEmailToFolder(targetFolderId: string, event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
    
//     if (!this.currentEmail?.id || !targetFolderId) return;
    
//     this.movingEmail = true;
    
//     this.emailservice.moveEmail(this.currentEmail.id, targetFolderId).subscribe({
//       next: (response) => {
//         this.showActionFeedback('Email moved successfully');
//         this.showMoveDropdown = false;
//         this.movingEmail = false;
        
//         const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//         if (index !== -1) {
//           this.emailList.splice(index, 1);
//           this.totalEmails--;
          
//           if (this.emailList.length > 0) {
//             const newIndex = Math.min(index, this.emailList.length - 1);
//             this.loadEmailByIndex(newIndex);
//           } else {
//             this.currentEmail = null;
//           }
//         }
//         console.log('Email moved successfully');
//         console.log(response);
//       },
//       error: (error) => {
//         console.error('Error moving email:', error);
//         this.showActionFeedback('Failed to move email');
//         this.movingEmail = false;
//       }
//     });
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
    
//     this.mailService.downloadAllAttachments(this.currentEmail.id!)
//       .subscribe({
//         next: (blob) => {
//           const filename = `attachments_${this.currentEmail!.subject.substring(0, 20)}.zip`;
//           this.saveBlob(blob, filename);
//           this.downloadingAll = false;
//           this.showActionFeedback(`Downloaded all attachments as ZIP`);
//         },
//         error: (error) => {
//           console.error('Error downloading all attachments:', error);
//           this.downloadingAll = false;
//           this.showActionFeedback('Failed to download attachments');
//         }
//       });
//   }

//   previewAttachment(attachment: Attachment) {
//     if (!this.currentEmail?.id) return;
    
//     const url = this.mailService.getAttachmentPreviewUrl(this.currentEmail.id, attachment.id);
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

//
//
//

// import { ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MailService, EmailPage } from '../service/mail.service';
// import { Email, Attachment } from '../../models/email';
// import { EmailPriority } from '../../models/enums';
// import { timeout, catchError } from 'rxjs/operators';
// import { of } from 'rxjs';
// import { SideBar } from "../../shared/side-bar/side-bar";
// import { ActivatedRoute, Router } from '@angular/router';
// import { Folder } from '../../models/folder';
// import { FolderService } from '../../Services/folderService';
// import { EmailService } from '../../Services/EmailService';
// import { SidebarComponent } from "../../slidebar.component/sidebar.component"

// @Component({
//   selector: 'app-mail-page',
//   standalone: true,
//   imports: [CommonModule, FormsModule, SideBar, SidebarComponent],
//   templateUrl: './mail-page.component.html',
//   styleUrls: ['./mail-page.component.css']
// })
// export class MailPageComponent implements OnInit {
//   currentFolderName: string = '';
//   loadEmailId: string = '';
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
//   folders: Folder[] = [];
//   showMoveDropdown = false;
//   selectedTargetFolderId: string = '';
//   movingEmail = false;

//   constructor(
//     private mailService: MailService,
//     private cdr: ChangeDetectorRef,
//     private route: ActivatedRoute,
//     private router: Router,
//     private folderService: FolderService,
//     private emailservice: EmailService
//   ) {}

//   // Add global click listener to close dropdown when clicking outside
//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent) {
//     const target = event.target as HTMLElement;
//     // Close dropdown if clicking outside the move dropdown wrapper
//     if (!target.closest('.move-dropdown-wrapper')) {
//       this.showMoveDropdown = false;
//     }
//   }

//   ngOnInit() {
//     this.route.paramMap.subscribe(params => {
//       this.folderId = params.get('folderId') || '';
//       this.loadEmailId = params.get('emailId') || '';
      
//       if (this.folderId) {
//         this.loadCurrentFolderName();
//         this.loadFolders();
//         this.loadFolderEmails();
        
//         if (this.loadEmailId) {
//           // Email will be loaded in loadFolderEmails callback
//         }
//       }
//     });
//   }

//   loadCurrentFolderName() {
//     if (!this.folderId) return;
    
//     this.folderService.getFolderByID(this.folderId).subscribe({
//       next: (folder) => {
//         this.currentFolderName = folder.name;
//       },
//       error: (error) => {
//         console.error('Error loading folder:', error);
//         this.currentFolderName = '';
//       }
//     });
//   }

//   loadFolders() {
//     this.folderService.getFolders().subscribe({
//       next: (folders) => {
//         this.folders = folders.filter(f => f.id !== this.folderId);
//       },
//       error: (error) => {
//         console.error('Error loading folders:', error);
//       }
//     });
//   }

//   getAvailableFolders(): Folder[] {
//     return this.folders.filter(folder => folder.id !== this.folderId);
//   }

//   onFolderSelected(folderId: string) {
//     this.router.navigate(['/mail', folderId]);
//   }

//   loadFolderEmails(page: number = 0) {
//     this.isError = false;
//     this.mailService.getFolderEmails(this.folderId, page, this.pageSize)
//       .subscribe({
//         next: (emailPage: EmailPage) => {
//           this.emailList = emailPage.content.map(email => ({
//             ...email,
//             to: email.to || email.toList || [],
//             cc: email.cc || [],
//             bcc: email.bcc || [],
//             attachments: email.attachments || []
//           }));
          
//           this.totalEmails = emailPage.totalElements;
//           this.totalPages = emailPage.totalPages;
//           this.currentPage = emailPage.number;
//           this.cdr.markForCheck();
          
//           if (this.emailList.length > 0) {
//             if (this.loadEmailId) {
//               this.findAndLoadEmail(this.loadEmailId);
//             } else {
//               this.loadEmailByIndex(0);
//             }
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

//   private findAndLoadEmail(emailId: string) {
//     const index = this.emailList.findIndex(e => e.id === emailId);
//     if (index !== -1) {
//       this.loadEmailByIndex(index);
//       return true;
//     }
    
//     if (this.emailList.length > 0) {
//       this.loadEmailByIndex(0);
//       console.log(`Email with ID ${emailId} not found on current page, loading first email instead`);
//     } else {
//       this.currentEmail = null;
//     }
//     return false;
//   }

//   loadEmailByIndex(index: number) {
//     if (index >= 0 && index < this.emailList.length) {
//       this.currentEmail = this.emailList[index];
//       this.currentEmailIndex = index;
      
//       if (!this.currentEmail.isRead) {
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

//   archiveEmail(event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
    
//     if (this.currentEmail) {
//       this.currentEmail.archived = !this.currentEmail.archived;
//       this.showActionFeedback(this.currentEmail.archived ? 'Email archived' : 'Email unarchived');
//     }
//   }

//   deleteEmail(event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
    
//     if (!this.currentEmail?.id) return;
    
//     if (confirm('Move this email to trash?')) {
//       this.emailservice.deleteEmail(this.currentEmail.id).subscribe({
//         next: (response) => {
//           console.log('Email moved to trash - response received');
//           this.showActionFeedback('Email moved to trash');
          
//           const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//           if (index !== -1) {
//             this.emailList.splice(index, 1);
//             this.totalEmails--;
            
//             if (this.emailList.length > 0) {
//               const newIndex = Math.min(index, this.emailList.length - 1);
//               this.loadEmailByIndex(newIndex);
//             } else {
//               this.currentEmail = null;
//             }
//           }
          
//           // Force change detection
//           this.cdr.detectChanges();
//           console.log('Change detection triggered');
//         },
//         error: (error) => {
//           console.error('Error deleting email:', error);
//           this.showActionFeedback('Failed to delete email');
//         }
//       });
//     }
//   }

//   permanentlyDeleteEmail(event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
    
//     if (!this.currentEmail?.id) return;
    
//     if (confirm('Permanently delete this email? This action cannot be undone.')) {
//       const isTrash = this.folderId === 'trash' || this.currentFolderName === 'Trash';
      
//       if (isTrash) {
//         this.emailservice.deleteEmailPermanent([this.currentEmail.id]).subscribe({
//           next: (response) => {
//             console.log('Email permanently deleted - response received');
//             this.showActionFeedback('Email permanently deleted');
            
//             const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//             if (index !== -1) {
//               this.emailList.splice(index, 1);
//               this.totalEmails--;
              
//               if (this.emailList.length > 0) {
//                 const newIndex = Math.min(index, this.emailList.length - 1);
//                 this.loadEmailByIndex(newIndex);
//               } else {
//                 this.currentEmail = null;
//               }
//             }
            
//             // Force change detection
//             this.cdr.detectChanges();
//             console.log('Change detection triggered');
//           },
//           error: (error) => {
//             console.error('Error permanently deleting email:', error);
//             this.showActionFeedback('Failed to delete email');
//           }
//         });
//       } else {
//         this.deleteEmail();
//       }
//     }
//   }

//   markAsUnread(event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
    
//     if (!this.currentEmail?.id || !this.currentEmail.isRead) return;
    
//     this.emailservice.markAsUnread(this.currentEmail.id).subscribe({
//       next: (response) => {
//         this.currentEmail!.isRead = false;
//         this.showActionFeedback('Marked as unread');
        
//         const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//         if (index !== -1) {
//           this.emailList[index].isRead = false;
//         }
//       },
//       error: (error) => {
//         console.error('Error marking email as unread:', error);
//         this.showActionFeedback('Failed to mark as unread');
//       }
//     });
//   }

//   markAsRead(email: Email) {
//     if (!email.id || email.isRead) return;
    
//     this.emailservice.markRead(email.id).subscribe({
//       next: (response) => {
//         email.isRead = true;
//         const index = this.emailList.findIndex(e => e.id === email.id);
//         if (index !== -1) {
//           this.emailList[index].isRead = true;
//         }
//       },
//       error: (error) => {
//         console.error('Error marking email as read:', error);
//       }
//     });
//   }

//   moveTo(event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
//     this.showMoveDropdown = !this.showMoveDropdown;
//   }

//   moveEmailToFolder(targetFolderId: string, event?: Event) {
//     if (event) {
//       event.stopPropagation();
//     }
    
//     if (!this.currentEmail?.id || !targetFolderId) return;
    
//     this.movingEmail = true;
    
//     this.emailservice.moveEmail(this.currentEmail.id, targetFolderId).subscribe({
//       next: (response) => {
//         console.log('Email moved successfully - response received');
//         this.showActionFeedback('Email moved successfully');
//         this.showMoveDropdown = false;
//         this.movingEmail = false;
        
//         const index = this.emailList.findIndex(e => e.id === this.currentEmail?.id);
//         if (index !== -1) {
//           this.emailList.splice(index, 1);
//           this.totalEmails--;
          
//           if (this.emailList.length > 0) {
//             const newIndex = Math.min(index, this.emailList.length - 1);
//             this.loadEmailByIndex(newIndex);
//           } else {
//             this.currentEmail = null;
//           }
//         }
        
//         // Force change detection
//         this.cdr.detectChanges();
//         console.log('Change detection triggered');
//       },
//       error: (error) => {
//         console.error('Error moving email:', error);
//         this.showActionFeedback('Failed to move email');
//         this.movingEmail = false;
//       }
//     });
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
    
//     this.mailService.downloadAllAttachments(this.currentEmail.id!)
//       .subscribe({
//         next: (blob) => {
//           const filename = `attachments_${this.currentEmail!.subject.substring(0, 20)}.zip`;
//           this.saveBlob(blob, filename);
//           this.downloadingAll = false;
//           this.showActionFeedback(`Downloaded all attachments as ZIP`);
//         },
//         error: (error) => {
//           console.error('Error downloading all attachments:', error);
//           this.downloadingAll = false;
//           this.showActionFeedback('Failed to download attachments');
//         }
//       });
//   }

//   previewAttachment(attachment: Attachment) {
//     if (!this.currentEmail?.id) return;
    
//     const url = this.mailService.getAttachmentPreviewUrl(this.currentEmail.id, attachment.id);
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
