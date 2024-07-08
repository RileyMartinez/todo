import { Routes } from '@angular/router';
import { LoginOrRegisterComponent } from './components/login-or-register/login-or-register.component';
import { TodoListComponent } from './components/todo-lists/todo-list/todo-list.component';
import { RouteConstants } from './constants/route.constants';

export const routes: Routes = [
    { path: RouteConstants.ROOT, redirectTo: RouteConstants.LOGIN_OR_REGISTER, pathMatch: 'full' },
    { path: RouteConstants.LOGIN_OR_REGISTER, component: LoginOrRegisterComponent },
    { path: RouteConstants.TODO_LIST, component: TodoListComponent },
];
