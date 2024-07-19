import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil, tap, timer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private loading = new BehaviorSubject<boolean>(false);
    public readonly loading$ = this.loading.asObservable();
    private readonly destroy$ = new Subject<void>();

    private minimumDelay = 500;

    setLoading(isLoading: boolean): void {
        if (!isLoading && this.loading.value) {
            timer(this.minimumDelay)
                .pipe(
                    takeUntil(this.destroy$),
                    tap(() => this.loading.next(isLoading)),
                )
                .subscribe();
        } else {
            this.loading.next(isLoading);
        }
    }

    destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
