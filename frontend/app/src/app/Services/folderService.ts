// ============================================
// src/app/services/folder.service.ts - SIMPLE VERSION
// ============================================
import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Folder } from '../models/folder';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private apiUrl = 'http://localhost:8080/api/folders';
  folders: Folder[] = [];
  foldersUpdated = new EventEmitter<void>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get user folders
  getFolders(): Observable<Folder[]> {
    const userId = this.authService.getUserId();
    
    // Add check for userId
    if (!userId) {
      console.warn('No userId found, cannot fetch folders');
      return of([]); // Return empty observable
    }
    
    return this.http.get<Folder[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Create folder
  createFolder(name: string): Observable<Folder> {
    const userId = this.authService.getUserId();
    
    // Add check for userId
    if (!userId) {
      console.error('No userId found, cannot create folder');
      return of({} as Folder); // Return empty folder observable
    }
    
    return this.http.post<Folder>(`${this.apiUrl}/user/${userId}`, { name }).pipe(
       tap(newFolder => {
        // Add the new folder to local array
        this.folders = [...this.folders, newFolder];
        // Emit update event
        this.foldersUpdated.emit();
        console.log('Folder created, emitting update');
      })
    ); 
  }

  // Delete folder
  deleteFolder(folderId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${folderId}`).pipe(
      tap(() => {
     // Remove folder from local array
        this.folders = this.folders.filter(f => f.id !== folderId);
        // Emit update event
        this.foldersUpdated.emit();
        console.log('Folder deleted, emitting update');
      })
    );  }

  // Load and store folders
  loadFolders(): void {
    this.getFolders().subscribe({
      next: (folders) => {
        this.folders = folders;
        console.log('Folders loaded:', folders);
        this.foldersUpdated.emit();
      },
      error: (error) => {
        console.error('Error loading folders:', error);
        this.folders = []; // Set to empty array on error
        this.foldersUpdated.emit();
      }
    });
  }

  getFolderByID(Id: string): Observable<Folder> {
    return this.http.get<Folder>(`${this.apiUrl}/${Id}`);
  }

  // Get folder by type
  getFolderByType(type: string): Folder | undefined {
    return this.folders.find(f => f.type === type.toUpperCase());
  }

  // by name for custom 
  getFolderByName(name: string): Folder | undefined {
    return this.folders.find(f => f.name === name.toUpperCase());
  }
}