import { Routes } from '@angular/router';
import { MailBox } from './mail/mail-box/mail-box';
import { MainLayout } from './layouts/main-layout/main-layout';
import { RegisterComponent } from './auth/register-component/register-component';
import { LoginComponent } from './auth/login-component/login-component';

export const routes: Routes = [
    // {path: 'inbox', component: MainLayout},
    // {path: 'sent', component: MainLayout},
    // {path: 'draft', component: MainLayout},
    // {path: '', component: MainLayout},
    {path: '', component: LoginComponent},
    // {path: 'register', component: RegisterComponent},
];
