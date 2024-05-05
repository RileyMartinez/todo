import { Routes } from '@angular/router';
import { LoginOrRegisterComponent } from './components/login-or-register/login-or-register.component';

export const routes: Routes = [
    { path: '', redirectTo: 'loginOrRegister', pathMatch: 'full' },
    { path: 'loginOrRegister', component: LoginOrRegisterComponent },
];
