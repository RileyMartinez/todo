import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SnackBarNotification } from '../interfaces';

@Injectable({
    providedIn: 'root',
})
export class SnackBarNotificationService {
    private notificiationsSubject = new Subject<SnackBarNotification>();
    readonly notifications$ = this.notificiationsSubject.asObservable();

    emit(notification: SnackBarNotification): void {
        notification.duration ??= 3000;
        notification.action ??= 'Close';
        this.notificiationsSubject.next(notification);
    }
}
