
import { ChangeDetectorRef, Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Folder } from '../models/folder';
import { FolderService } from '../Services/folderService';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slidebar.component.html',
  styleUrls: ['./slidebar.component.css']
})
export class SidebarComponent implements OnInit {

  folders: Folder[] = [];
  showNewFolder = false;
  newFolderName = '';

  @Output() folderSelected = new EventEmitter<string>();
  @Output() toggleComposeSignal = new EventEmitter<void>();

  constructor(
    private folderService: FolderService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }


  ngOnInit() {
    this.loadFolders();
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
    this.router.navigate(['/mail/contacts']);
  }

  toggleCompose() {
    this.toggleComposeSignal.emit();
  }
}