// ============================================
// src/app/services/folder.service.ts - SIMPLE VERSION
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Folder } from '../models/folder';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private apiUrl = 'http://localhost:8080/api/folders';
  folders: Folder[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get user folders
  getFolders(): Observable<Folder[]> {
    const userId = this.authService.getUserId();
    return this.http.get<Folder[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Create folder
  createFolder(name: string): Observable<Folder> {
    const userId = this.authService.getUserId();
    return this.http.post<Folder>(`${this.apiUrl}/user/${userId}`, { name });
  }

  // Delete folder
  deleteFolder(folderId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${folderId}`);
  }

  // Load and store folders
  loadFolders(): void {
    this.getFolders().subscribe(
      folders => this.folders = folders,
      error => console.error('Error loading folders:', error)
    );
  }


  getFolderByID(Id: string) :Observable<Folder>  {
    return this.http.get<Folder>(`${this.apiUrl}/${Id}`);
  }


//   Get folder by type
  getFolderByType(type: string): Folder | undefined {
    return this.folders.find(f => f.type === type.toUpperCase());
  }

// by name for custom 
  getFolderByName(name: string): Folder | undefined {
    return this.folders.find(f => f.name === name.toUpperCase());
  }
}