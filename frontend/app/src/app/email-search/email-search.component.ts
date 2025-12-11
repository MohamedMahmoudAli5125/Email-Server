// email-search.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Email } from '../models/email';
import { EmailPriority } from '../models/enums';
import { EmailSearchService, EmailSearchCriteria } from '../Services/email-search.service';
import { FolderService } from '../Services/folderService';
import { Folder } from '../models/folder';

@Component({
  selector: 'app-email-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-search.component.html',
  styleUrl: './email-search.component.css'
})
export class EmailSearchComponent implements OnInit, OnChanges {
  @Input() folderId!: string;

  emails: Email[] = [];
  filteredEmails: Email[] = [];
  loading = false;
  currentFolder!: Folder;

  
  searchTerm = '';
  showAdvancedFilter = false;

  
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

  
  Math = Math;
  EmailPriority = EmailPriority; 

  constructor(
    private searchService: EmailSearchService,
    private folderService: FolderService
  ) {}

  ngOnInit() {
  console.log('EmailSearchComponent loaded!');
  console.log('Folder ID received:', this.folderId);
  
  if (this.folderId) {
    this.loadFolder();
  }
}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['folderId'] && this.folderId) {
      this.loadFolder();
      this.loadEmails();
    }
  }

  loadFolder() {
    this.folderService.getFolderByID(this.folderId).subscribe({
      next: (folder) => {
        this.currentFolder = folder;
      },
      error: (error) => {
        console.error('Error loading folder:', error);
      }
    });
  }

  loadEmails() {
    this.loading = true;
    this.clearFilters();
    this.performSearch();
  }

  performSearch() {
    this.loading = true;

    const hasFilters = this.hasActiveFilters();

    if (hasFilters || this.searchTerm) {
     
      const filterDTO = this.searchService.buildFilterDTO({
        ...this.filters,
        searchKeyword: this.searchTerm
      });

      this.searchService.searchAndFilter(this.folderId, filterDTO).subscribe({
        next: (emails) => {
          this.filteredEmails = emails;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching/filtering emails:', error);
          this.loading = false;
        }
      });
    } else {
    

      this.filteredEmails = [];
      this.loading = false;
    }
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

  onSearchChange() {
    this.performSearch();
  }

  onFilterChange() {
    this.performSearch();
  }

  toggleAdvancedFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  clearFilters() {
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
    this.performSearch();
  }

  
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
    if (this.filters.isImportant === undefined) {
      this.filters.isImportant = true;
    } else if (this.filters.isImportant === true) {
      this.filters.isImportant = false;
    } else {
      this.filters.isImportant = undefined;
    }
    this.onFilterChange();
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

  openEmail(email: Email) {
    console.log('Opening email:', email.id);
   
    
  }
}