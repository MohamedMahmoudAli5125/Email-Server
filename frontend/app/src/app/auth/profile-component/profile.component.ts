// profile.component.ts
import { Component, OnInit, Input, Output, EventEmitter,ChangeDetectorRef, NgZone} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @Input() compactView: boolean = false; // For sidebar vs expanded view
  @Output() closeProfile = new EventEmitter<void>();
  @Output() compactClick = new EventEmitter<void>(); 
  @Output() profileUpdated = new EventEmitter<void>();
  @Input() user: any = null; 

  // User data
//   user: any = null;
  userId: string | null = null;
  
  // Edit mode
  isEditing: boolean = false;
  editName: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  // Loading states
  loading: boolean = false;
  deleting: boolean = false;
  
  // Messages
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  
  constructor(
    private authService: AuthService,
            private cdr: ChangeDetectorRef,

    private router: Router,
    private ngZone: NgZone
  ) {}
  
  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (this.userId) {
      this.loadUserProfile();
      
    } else {
      // Try to get from localStorage
      this.user = this.authService.getCurrentUser();
      this.cdr.detectChanges();
    }
  }
  
  loadUserProfile(): void {
    this.loading = true;
    this.authService.getProfile(this.userId!).subscribe({
      next: (response) => {
        this.user = response;
        this.loading = false;
        this.authService.updateLocalStorage({
        id: response.id,
        email: response.email,
        name: response.name
      });

    console.log(this.user);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.user = this.authService.getCurrentUser();
        this.loading = false;
        this.showMessage('Failed to load profile data', 'error');
        this.cdr.detectChanges();
      }
    });
  }
    onCompactClick(): void {
    if (this.compactView) {
      this.compactClick.emit();
    }
  }
  
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editName = this.user?.name || '';
      // Clear password fields
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.message = '';
    }
  }
  
  updateProfile(): void {
    if (!this.userId) {
      this.showMessage('User not found', 'error');
      return;
    }
    
    // Validation
    if (!this.editName.trim()) {
      this.showMessage('Name cannot be empty', 'error');
      return;
    }
    
    // Check if password is being changed
    const updateData: any = { name: this.editName.trim() };
    
    if (this.newPassword) {
      if (this.newPassword !== this.confirmPassword) {
        this.showMessage('New passwords do not match', 'error');
        return;
      }
      if (this.newPassword.length < 8) {
        this.showMessage('Password must be at least 8 characters', 'error');
        return;
      }
      updateData.password = this.newPassword;
    }
    
    this.loading = true;
    this.authService.updateProfile(this.userId, updateData).subscribe({
      next: (response) => {
        this.user = response;
        this.isEditing = false;
        this.loading = false;
        this.showMessage('Profile updated successfully', 'success');
        this.authService.updateLocalStorage({
        id: response.id,
        email: response.email,
        name: response.name
      });
      this.showMessage('Profile updated successfully', 'success');
    //     this.profileUpdated.emit();
    //   this.cdr.markForCheck();
    //     this.cdr.detectChanges();
        
        // Clear password fields
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
                 this.profileUpdated.emit();

     this.ngZone.run(() => {
        this.cdr.markForCheck();
      });
  
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.loading = false;
        this.showMessage(error.error?.error || 'Failed to update profile', 'error');
            this.ngZone.run(() => {
        this.cdr.markForCheck();
        });
      }
    });
  }
  
  deleteAccount(): void {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    if (!this.userId) return;
    
    this.deleting = true;
    this.authService.deleteAccount(this.userId).subscribe({
      next: () => {
        this.deleting = false;
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error deleting account:', error);
        this.deleting = false;
        this.showMessage(error.error?.error || 'Failed to delete account', 'error');
      }
    });
  }
  
  showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    setTimeout(() => {
      this.message = '';
    }, 2000);
  }
  
  close(): void {
    this.closeProfile.emit();
  }
}