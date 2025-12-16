
import { ChangeDetectorRef, Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Folder } from '../models/folder';
import { FolderService } from '../Services/folderService';
import { ProfileComponent } from '../auth/profile-component/profile.component';
import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileComponent],
  templateUrl: './slidebar.component.html',
  styleUrls: ['./slidebar.component.css']
})
export class SidebarComponent implements OnInit {

  folders: Folder[] = [];
  showNewFolder = false;
  newFolderName = '';
    showProfile: boolean = false;

  currentUser: any = null;

  @Output() folderSelected = new EventEmitter<string>();
  @Output() toggleComposeSignal = new EventEmitter<void>();

  constructor(
    private folderService: FolderService,
    private router: Router,
    private cd: ChangeDetectorRef,
        private authService: AuthService // Inject AuthService

  ) { }


  ngOnInit() {
    this.loadFolders();
    this.currentUser = this.authService.getCurrentUser();
    this.cd.detectChanges();
  }


  loadFolders() {
    this.folderService.getFolders().subscribe(
      folders => {
        this.folders = folders;
        this.folderService.folders = folders;
        console.log(folders);
        this.cd.detectChanges();
      }
    );
  }

  navigateToFolder(folderId: string) {
    console.log(folderId);
    // const name = folder.name.toLowerCase();
    // this.router.navigate([name]);
    this.folderSelected.emit(folderId);
  }

  showCreateFolder() {
    this.showNewFolder = true;
  }

  createFolder() {
    if (this.newFolderName.trim()) {
      this.folderService.createFolder(this.newFolderName.trim()).subscribe(
        () => {
          this.newFolderName = '';
          this.showNewFolder = false;
          this.loadFolders();
        }
      );
    }
  }

  cancelCreate() {
    this.newFolderName = '';
    this.showNewFolder = false;
  }

  deleteFolder(folderId: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this folder?')) {
      this.folderService.deleteFolder(folderId).subscribe(
        () => this.loadFolders()
      );
    }
  }

  getFolderIcon(type: string): string {
    const icons: any = {
      'INBOX': 'inbox',
      'SENT': 'send',
      'DRAFT': 'drafts',
      'TRASH': 'delete',
      'CUSTOM': 'folder'
    };
    return icons[type] || 'folder';
  }

  goToContacts() {
    console.log("Navigating to contacts");
    this.router.navigate(['/contacts']);
  }

  toggleCompose() {
    this.toggleComposeSignal.emit();
  }
   toggleProfile(): void {
    this.showProfile = !this.showProfile;
    this.cd.detectChanges();
  }
   closeProfile(): void {
    this.showProfile = false;
    this.cd.detectChanges();
  }
  onProfileUpdated(): void {
    // Reload the user data from localStorage after profile update
    this.currentUser = this.authService.getCurrentUser();
    
    // Force UI update
    this.cd.detectChanges();
    
    console.log('Profile updated - user data refreshed');
  }
}