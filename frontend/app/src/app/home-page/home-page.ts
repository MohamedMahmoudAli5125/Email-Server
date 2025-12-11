import { CommonModule } from '@angular/common';
import { EmailList } from '../email-list/email-list';
import { SidebarComponent } from './../slidebar.component/sidebar.component';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-page',
  imports: [SidebarComponent,EmailList,CommonModule,FormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  currentFolderId:string='';
onFolderChange(folderId: string) {
  this.currentFolderId = folderId;
}

}
