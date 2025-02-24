import { Routes } from '@angular/router';
import { RouteConstants } from '../../core/constants/route.constants';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoListsComponent } from './todo-lists/todo-lists.component';

export const TODO_ROUTES: Routes = [
    { path: RouteConstants.LISTS, component: TodoListsComponent },
    { path: `${RouteConstants.LIST}/:id`, component: TodoListComponent },
];
