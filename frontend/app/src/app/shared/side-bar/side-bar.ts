import { Component, Output, EventEmitter } from '@angular/core';
import { User } from '../../models/user';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router'; // Add Router import


@Component({
  selector: 'app-side-bar',
  imports: [],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {

  @Output() showCompose = new EventEmitter<boolean>()

  currentUser!: User;

  constructor(private authService: AuthService,    private router: Router // Add Router to constructor
) { }

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
  }

  openCompose() {
    this.showCompose.emit(true);
  }
  

  closeCompose() {
    this.showCompose.emit();
  }
   goToMailPage() {
    this.router.navigate(['/mailpage']);
  }
}
