import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { AuthService } from '../../auth/auth.service';
import { FolderService } from '../../Services/folderService';
import { CommonModule } from '@angular/common';
import { EmailSearchComponent } from '../../email-search/email-search.component';

@Component({
  selector: 'app-mail-box',
  standalone: true,
  imports: [CommonModule, EmailSearchComponent],
  templateUrl: './mail-box.html',
  styleUrl: './mail.css',
})
export class MailBox implements OnInit {
  currentUser!: User;
  selectedFolderId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    public folderService: FolderService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('=== MailBox Initialization Started ===');
    
    // Step 1: Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      console.error('❌ User not logged in!');
      this.errorMessage = 'Please log in to access your mailbox';
      this.isLoading = false;
      // Uncomment the line below if you want to redirect to login
      // this.router.navigate(['/login']);
      return;
    }

    const userId = this.authService.getUserId();
    console.log('✓ User ID from localStorage:', userId);

    // Step 2: Get current user
    this.currentUser = this.authService.currentUser;
    
    if (!this.currentUser) {
      console.warn('⚠️ currentUser is undefined, attempting to restore from localStorage');
      
      if (userId) {
        // Reconstruct user object from localStorage
        this.currentUser = {
          id: userId,
          email: localStorage.getItem('userEmail') || '',
          name: localStorage.getItem('userName') || '',
          password: '' // Not stored in localStorage for security
        } as User;
        console.log('✓ User object reconstructed:', this.currentUser);
      } else {
        console.error('❌ No userId found in localStorage');
        this.errorMessage = 'User session expired. Please log in again.';
        this.isLoading = false;
        return;
      }
    }

    console.log('✓ Current User:', this.currentUser);
    
    // Step 3: Load folders
    this.loadFolders();
  }

  loadFolders() {
    console.log('📁 Loading folders...');
    this.isLoading = true;
    this.errorMessage = '';
    
    this.folderService.getFolders().subscribe({
      next: (folders) => {
        console.log('✓ Folders received from backend:', folders);
        this.folderService.folders = folders;
        
        if (folders.length === 0) {
          console.warn('⚠️ No folders found for user');
          this.errorMessage = 'No folders found. You may need to create folders first.';
          this.isLoading = false;
          return;
        }
        
        console.log(`✓ ${folders.length} folder(s) loaded successfully`);
        this.selectInboxFolder();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading folders:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        if (error.status === 404) {
          this.errorMessage = 'Folders endpoint not found. Please check your backend.';
        } else if (error.status === 401) {
          this.errorMessage = 'Unauthorized. Please log in again.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.errorMessage = `Failed to load folders: ${error.status} ${error.statusText}`;
        }
        
        this.isLoading = false;
      }
    });
  }

  selectInboxFolder() {
    console.log('📮 Selecting inbox folder...');
    console.log('Available folders:', this.folderService.folders.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type
    })));
    
    // Try to find inbox folder (case-insensitive)
    const inboxFolder = this.folderService.folders.find(
      f => f.name.toLowerCase() === 'inbox'
    );
    
    if (inboxFolder) {
      this.selectedFolderId = inboxFolder.id;
      console.log('✓ Inbox folder selected!');
      console.log('  - Folder Name:', inboxFolder.name);
      console.log('  - Folder ID:', this.selectedFolderId);
      console.log('  - Folder Type:', inboxFolder.type);
    } else {
      console.warn('⚠️ No "inbox" folder found, trying first available folder');
      
      if (this.folderService.folders.length > 0) {
        const firstFolder = this.folderService.folders[0];
        this.selectedFolderId = firstFolder.id;
        console.log('✓ First folder selected:');
        console.log('  - Folder Name:', firstFolder.name);
        console.log('  - Folder ID:', this.selectedFolderId);
        console.log('  - Folder Type:', firstFolder.type);
      } else {
        console.error('❌ No folders available to select!');
        this.errorMessage = 'No folders available';
        this.selectedFolderId = '';
      }
    }
  }

  retryLoadFolders() {
    console.log('🔄 Retrying to load folders...');
    this.loadFolders();
  }
}