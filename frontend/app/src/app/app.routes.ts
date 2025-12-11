import { Routes } from '@angular/router';
import { MailBox } from './mail/mail-box/mail-box';
import { MainLayout } from './layouts/main-layout/main-layout';
import { RegisterComponent } from './auth/register-component/register-component';
import { LoginComponent } from './auth/login-component/login-component';
import { App } from './app';
import{MailPageComponent }from './mail/mail-page/mail-page.component'
import { SidebarComponent } from './slidebar.component/sidebar.component';
import { HomePage } from './home-page/home-page';

export const routes: Routes = [
    // {path: 'inbox', component: MainLayout},
    // {path: 'sent', component: MainLayout},
    // {path: 'draft', component: MainLayout},
    // {path: '', component: MainLayout},
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    { path: 'app', component: MainLayout },
    { path: 'mailpage', component: MailPageComponent },
    {path:'slidebar',component:SidebarComponent},
{path:'home',component:HomePage},
// {path:'home/Trash',component:HomePage},
// {path:'home/Custom',component:HomePage},
// {path:'home/Drafts',component:HomePage},
    // {path: 'register', component: RegisterComponent},
];
