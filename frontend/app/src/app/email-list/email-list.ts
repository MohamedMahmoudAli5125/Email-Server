import { Folder } from './../models/folder';
import { FolderService } from './../Services/folderService';
import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Email } from '../models/email';
import { EmailService } from '../Services/EmailService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-list.html',
  styleUrl: './email-list.css',
})
export class EmailList implements OnChanges {
@Input() folderId!: string;
  emails: Email[] = [];
  loading = false;
  currentPage = 0;
  totalPages = 0;
  totalEmails = 0;
  currentFolder!:Folder;
  // Bulk selection
  selectedEmails = new Set<string>();
  selectAll = false;
  
  // Toolbar actions
  showActions = false;
  currentFolderId = '';

  // For template use
  Math = Math;

  constructor(
    private emailService: EmailService,
    private folderService: FolderService,
    private router: Router,
        private cd: ChangeDetectorRef

  ) {}
  ngOnChanges(changes: SimpleChanges): void {
     this.folderService.getFolderByID(this.folderId).subscribe({

  next:(folder)=>{
    this.currentFolder=folder;
  }});

this.loadEmails()
  }

  ngOnInit() {

     const folder = this.folderService.folders.find(f => f.name === 'Inbox');
    if (!folder) {
      this.loading = false;
      return;
    }

    this.folderId=folder.id;

  this.folderService.getFolderByID(this.folderId).subscribe({

  next:(folder)=>{
    this.currentFolder=folder;
  }});


    
    this.loadEmails();
  }

  loadEmails() {
    this.loading = true;
    // const url = this.router.url;
    
  //   let name = 'inbox';
  //  const lastPart = url.split('/').pop();
  // console.log(lastPart);
  //   console.log('last part = '+lastPart);
    
   

    this.currentFolderId = this.folderId;
    
    this.emailService.getEmails(this.currentFolderId, 0, 20).subscribe({
      next: (response: any) => {
        this.emails = response.content ;
        this.totalPages = response.totalPages || 0;
        this.totalEmails = response.totalElements || 0;
        this.loading = false;
        console.log('now is the thing ');
        console.log(this.emails);
              this.cd.detectChanges();

      },
      error: (error) => {
        console.error('Error loading emails:', error);
        this.loading = false;
      }
    });
  }

  openEmail(email: Email, event: Event) {
    // Don't open if clicking checkbox or star
    const target = event.target as HTMLElement;
    if (target.closest('.email-checkbox') || target.closest('.email-star')) {
      return;
    }

    if (!email.isRead && email.id) {
      this.emailService.markRead(email.id).subscribe();
    }
    
    // Navigate to email detail this to open the file  
    // this.router.navigate(['', email.id]);
  }

  toggleSelect(emailId: string, event: Event) {
    event.stopPropagation();
    
    if (this.selectedEmails.has(emailId)) {
      this.selectedEmails.delete(emailId);
    } else {
      this.selectedEmails.add(emailId);
    }
    
    this.updateSelectAllState();
    this.showActions = this.selectedEmails.size > 0;
  }

  toggleSelectAll() {
    if (this.selectAll) {
      this.selectedEmails.clear();
    } else {
      this.emails.forEach(email => this.selectedEmails.add(email.id));
    }
    this.selectAll = !this.selectAll;
    this.showActions = this.selectedEmails.size > 0;
  }

  updateSelectAllState() {
    this.selectAll = this.emails.length > 0 && 
                     this.emails.every(email => this.selectedEmails.has(email.id));
  }

  isSelected(emailId: string): boolean {
    return this.selectedEmails.has(emailId);
  }

  toggleStar(email: Email, event: Event) {
    event.stopPropagation();
    this.emailService.toggleStar(email.id).subscribe({
      next: (updated) => {
        email.isImportant = updated.isImportant;
      }
    });
  }

  // Bulk actions
  bulkDelete() {
 if (this.selectedEmails.size === 0) return;




   
    
    if (confirm(`Delete ${this.selectedEmails.size} email(s)?`)) {
      const ids = Array.from(this.selectedEmails);
// make it in backend and fix here in folder service   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
if(this.currentFolder.name==='Trash'){
  this.emailService.deleteEmailPermanent(ids).subscribe({
        next: () => {
          this.selectedEmails.clear();
          this.selectAll = false;
          this.showActions = false;
          this.loadEmails();
        }
      });
}
else{


      this.emailService.bulkDelete(ids).subscribe({
        next: () => {
          this.selectedEmails.clear();
          this.selectAll = false;
          this.showActions = false;
          this.loadEmails();
        }
      });
    }





    }
  }

  bulkMove(targetFolderId: string) {
    if (this.selectedEmails.size === 0 || !targetFolderId) return;
    
    const ids = Array.from(this.selectedEmails);
    this.emailService.bulkMove(ids, targetFolderId).subscribe({
      next: () => {
        this.selectedEmails.clear();
        this.selectAll = false;
        this.showActions = false;
        this.loadEmails();
      }
    });
  }

  // Pagination
  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadEmails();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadEmails();
    }
  }

  // Formatting
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const emailDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (emailDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  getAvailableFolders() {
    return this.folderService.folders.filter(f => f.id !== this.currentFolderId);
  }
}