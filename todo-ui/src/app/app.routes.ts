import { Routes } from '@angular/router';
import { LoginOrRegisterComponent } from './components/login-or-register/login-or-register.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'loginOrRegister', pathMatch: 'full' },
    { path: 'loginOrRegister', component: LoginOrRegisterComponent },
    { path: 'todoList', component: TodoListComponent },
];
