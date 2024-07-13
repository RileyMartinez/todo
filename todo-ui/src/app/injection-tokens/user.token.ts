import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';

export const USER_OBSERVABLE_TOKEN = new InjectionToken<Observable<User | null>>('USER_OBSERVABLE_TOKEN');
