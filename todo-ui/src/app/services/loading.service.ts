import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private readonly timer: number = 1000;
    private loading = new BehaviorSubject<boolean>(false);
    loading$ = this.loading.asObservable();

    setLoading(isLoading: boolean): void {
        this.loading.next(isLoading);
    }

    triggerLoading(): void {
        this.loading.next(true);
        setTimeout(() => {
            this.loading.next(false);
        }, this.timer);
    }
}
