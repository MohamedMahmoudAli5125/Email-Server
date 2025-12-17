import { Folder } from './../models/folder';
import { FolderService } from './../Services/folderService';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Email } from '../models/email';
import { EmailService } from '../Services/EmailService';
import { EmailSearchService, EmailSearchCriteria } from '../Services/email-search.service';
import { EmailPriority } from '../models/enums';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-list.html',
  styleUrl: './email-list.css',
})
export class EmailList implements OnChanges {

  @Input() folderType = ''
  @Input() folderId!: string;
  @Output() emailOpened = new EventEmitter<{ emailId: string; folderId: string }>();
  @Output() openCompose = new EventEmitter<Email>()

  emails: Email[] = [];
  loading = false;
  currentPage = 0;
  totalPages = 0;
  totalEmails = 0;
  sortByPriority = false;
  currentFolder!: Folder;
  
  // Search and Filter properties
  searchTerm = '';
  showAdvancedFilter = false;
  isSearching = false;
  
  filters: EmailSearchCriteria = {
    searchKeyword: '',
    from: '',
    to: '',
    subject: '',
    body: '',
    startDate: '',
    endDate: '',
    priority: undefined,
    hasAttachments: undefined,
    isRead: undefined,
    isImportant: undefined,
    page: 0,
    size: 20,
    sortBy: 'sentDate',
    sortDirection: 'desc'
  };
  
  EmailPriority = EmailPriority;
  
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
    private searchService: EmailSearchService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.folderService.getFolderByID(this.folderId).subscribe({
      next: (folder) => {
        this.currentFolder = folder;
      }
    });
    
    this.clearSearch();
    this.loadEmails();
  }

  ngOnInit() {
    const folder = this.folderService.folders.find(f => f.name === 'Inbox');
    if (!folder) {
      this.loading = false;
      return;
    }

    this.folderId = folder.id;

    this.folderService.getFolderByID(this.folderId).subscribe({
      next: (folder) => {
        this.currentFolder = folder;
      }
    });

    this.loadEmails();
  }



togglePrioritySort() {
  this.sortByPriority = !this.sortByPriority;
  this.currentPage = 0; // Reset to first page

  this.loadEmails();
}



 loadEmails() {
  this.loading = true;
  this.currentFolderId = this.folderId;
  this.isSearching = false;
  console.log(this.sortByPriority);
  const emailRequest = this.sortByPriority 
    ? this.emailService.getEmailsSortedByPriority(this.currentFolderId, this.currentPage, 10)
    : this.emailService.getEmails(this.currentFolderId, this.currentPage, 10);
  
  emailRequest.subscribe({
    next: (response: any) => {
      this.emails = response.content;
      this.totalPages = response.totalPages || 0;
      this.totalEmails = response.totalElements || 0;
      this.loading = false;
      this.cd.detectChanges();
      console.log(this.emails);
    },
    error: (error) => {
      console.error('Error loading emails:', error);
      this.loading = false;
    }
  });
}

  // Search functionality
  onSearchChange() {
    if (this.searchTerm.trim() === '' && !this.hasActiveFilters()) {
      this.loadEmails();
    } else {
      this.performSearch();
    }
  }

  performSearch() {
    this.loading = true;
    this.isSearching = true;

    const filterDTO = this.searchService.buildFilterDTO({
      ...this.filters,
      searchKeyword: this.searchTerm
    });

    this.searchService.searchAndFilter(this.folderId, filterDTO).subscribe({
      next: (emails) => {
        this.emails = emails;
        this.totalEmails = emails.length;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error searching emails:', error);
        this.loading = false;
      }
    });
  }

  toggleAdvancedFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  onFilterChange() {
    this.performSearch();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.from ||
      this.filters.to ||
      this.filters.subject ||
      this.filters.body ||
      this.filters.startDate ||
      this.filters.endDate ||
      this.filters.priority ||
      this.filters.hasAttachments !== undefined ||
      this.filters.isRead !== undefined ||
      this.filters.isImportant !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.filters.from) count++;
    if (this.filters.to) count++;
    if (this.filters.subject) count++;
    if (this.filters.body) count++;
    if (this.filters.startDate) count++;
    if (this.filters.endDate) count++;
    if (this.filters.priority) count++;
    if (this.filters.hasAttachments !== undefined) count++;
    if (this.filters.isRead !== undefined) count++;
    if (this.filters.isImportant !== undefined) count++;
    return count;
  }

  clearSearch() {
    this.searchTerm = '';
    this.filters = {
      searchKeyword: '',
      from: '',
      to: '',
      subject: '',
      body: '',
      startDate: '',
      endDate: '',
      priority: undefined,
      hasAttachments: undefined,
      isRead: undefined,
      isImportant: undefined,
      page: 0,
      size: 20,
      sortBy: 'sentDate',
      sortDirection: 'desc'
    };
    this.showAdvancedFilter = false;
    this.loadEmails();
  }

  // Toggle filters
  toggleHasAttachments() {
    if (this.filters.hasAttachments === undefined) {
      this.filters.hasAttachments = true;
    } else if (this.filters.hasAttachments === true) {
      this.filters.hasAttachments = false;
    } else {
      this.filters.hasAttachments = undefined;
    }
    this.onFilterChange();
  }

  toggleIsRead() {
    if (this.filters.isRead === undefined) {
      this.filters.isRead = false;
    } else if (this.filters.isRead === false) {
      this.filters.isRead = true;
    } else {
      this.filters.isRead = undefined;
    }
    this.onFilterChange();
  }

  toggleIsImportant() {
    console.log('we here you see ');
    if (this.filters.isImportant === undefined) {
      this.filters.isImportant = true;
    } else if (this.filters.isImportant === true) {
      this.filters.isImportant = false;
    } else {
      this.filters.isImportant = undefined;
    }
    this.onFilterChange();
  }

  openEmail(email: Email, event: Event) {
    const target = event.target as HTMLElement;
    console.log("---------------------")
    console.log(this.folderType)
    if (target.closest('.email-checkbox') || target.closest('.email-star')) {
      return;
    }

    if(email && this.folderType.toUpperCase() === 'DRAFT') {
      this.openCompose.emit(email);
      return
    }

    if (!email.isRead && email.id) {
      this.emailService.markRead(email.id).subscribe();
    }
  }
  
  onEmailDoubleClick(email: Email) {
    if (email.id) {
      console.log(email.id,this.folderId);
      this.emailOpened.emit({ 
        emailId: email.id, 
        folderId: this.folderId 
      });
    }
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

  // Check if current folder is Trash
  isTrashFolder(): boolean {
    return this.currentFolder && this.currentFolder.name.toUpperCase() === 'TRASH';
  }

 isCustomFolder(): boolean {
  if (!this.currentFolder) return false;
  const systemFolders = ['INBOX', 'SENT', 'DRAFTS', 'TRASH'];
  return !systemFolders.includes(this.currentFolder.name.toUpperCase());
}

  // Modified bulk delete to handle different folder types
  bulkDelete() {
    if (this.selectedEmails.size === 0) return;
    
    const ids = Array.from(this.selectedEmails);
    
    // If in Trash folder, permanently delete
    if (this.isTrashFolder()) {
      if (confirm(`Permanently delete ${this.selectedEmails.size} email(s)? This cannot be undone.`)) {
        this.emailService.deleteEmailsPermanently(ids).subscribe({
          next: () => {
            this.selectedEmails.clear();
            this.selectAll = false;
            this.showActions = false;
            this.loadEmails();
          },
          error: (error) => {
            console.error('Error permanently deleting emails:', error);
            alert('Failed to permanently delete emails');
          }
        });
      }
    } 
    // If in custom folder, remove from folder only
    else if (this.isCustomFolder()) {
      if (confirm(`Remove ${this.selectedEmails.size} email(s) from this folder?`)) {
        this.removeFromCustomFolder(ids);
      }
    } 
    // Otherwise, move to trash (soft delete)
    else {
      if (confirm(`Move ${this.selectedEmails.size} email(s) to trash?`)) {
        this.emailService.bulkDelete(ids).subscribe({
          next: () => {
            this.selectedEmails.clear();
            this.selectAll = false;
            this.showActions = false;
            this.loadEmails();
          },
          error: (error) => {
            console.error('Error deleting emails:', error);
            alert('Failed to delete emails');
          }
        });
      }
    }
  }

  // NEW: Remove emails from custom folder
  removeFromCustomFolder(ids: string[]) {
    let completedRequests = 0;
    const totalRequests = ids.length;
    let hasError = false;

    ids.forEach(emailId => {
      this.emailService.removeEmailFromFolder(emailId, this.folderId).subscribe({
        next: () => {
          completedRequests++;
          if (completedRequests === totalRequests && !hasError) {
            this.selectedEmails.clear();
            this.selectAll = false;
            this.showActions = false;
            this.loadEmails();
          }
        },
        error: (error) => {
          console.error('Error removing email from folder:', error);
          hasError = true;
          completedRequests++;
          if (completedRequests === totalRequests) {
            alert('Some emails could not be removed');
            this.loadEmails();
          }
        }
      });
    });
  }

  // NEW: Restore emails from trash
  bulkRestore() {
    if (this.selectedEmails.size === 0) return;
    
    if (confirm(`Restore ${this.selectedEmails.size} email(s) from trash?`)) {
      const ids = Array.from(this.selectedEmails);
      let completedRequests = 0;
      const totalRequests = ids.length;
      let hasError = false;

      ids.forEach(emailId => {
        this.emailService.restoreEmailFromTrash(emailId).subscribe({
          next: () => {
            completedRequests++;
            if (completedRequests === totalRequests && !hasError) {
              this.selectedEmails.clear();
              this.selectAll = false;
              this.showActions = false;
              this.loadEmails();
            }
          },
          error: (error) => {
            console.error('Error restoring email:', error);
            hasError = true;
            completedRequests++;
            if (completedRequests === totalRequests) {
              alert('Some emails could not be restored');
              this.loadEmails();
            }
          }
        });
      });
    }
  }

  // Modified bulk move to show only custom folders
  bulkMove(targetFolderId: string) {
    if (this.selectedEmails.size === 0 || !targetFolderId) return;
    
    const ids = Array.from(this.selectedEmails);
    this.emailService.bulkMove(ids, targetFolderId).subscribe({
      next: () => {
        this.selectedEmails.clear();
        this.selectAll = false;
        this.showActions = false;
        this.loadEmails();
      },
      error: (error) => {
        console.error('Error moving emails:', error);
        alert('Failed to move emails');
      }
    });
  }

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
  const systemFolders = ['INBOX', 'SENT', 'DRAFTS', 'TRASH'];
  return this.folderService.folders.filter(f => 
    f.id !== this.currentFolderId && 
    !systemFolders.includes(f.name.toUpperCase())
  );
}

  // Check if there are any custom folders available for moving
  hasCustomFolders(): boolean {
  return this.getAvailableFolders().length > 0;
}

  // Get button text based on folder type
  getDeleteButtonText(): string {
    if (this.isTrashFolder()) {
      return 'Delete Forever';
    } else if (this.isCustomFolder()) {
      return 'Remove from Folder';
    } else {
      return 'Delete';
    }
  }

  // Get button tooltip based on folder type
  getDeleteButtonTooltip(): string {
    if (this.isTrashFolder()) {
      return 'Permanently delete selected emails';
    } else if (this.isCustomFolder()) {
      return 'Remove selected emails from this folder';
    } else {
      return 'Move selected emails to trash';
    }
  }
}
