import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

export const USER_OBSERVABLE_TOKEN = new InjectionToken<Observable<User | null>>('USER_OBSERVABLE_TOKEN');
