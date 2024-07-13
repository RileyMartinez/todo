import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, catchError, first, of, takeUntil, timer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private minimumDelay = 500;
    private loading = new BehaviorSubject<boolean>(false);
    private unsubscribe$ = new Subject<void>();
    loading$ = this.loading.asObservable();

    setLoading(isLoading: boolean): void {
        if (!isLoading) {
            timer(this.minimumDelay)
                .pipe(
                    first(() => this.loading.value === true),
                    takeUntil(this.unsubscribe$),
                    catchError(() => {
                        return of(false);
                    }),
                )
                .subscribe(() => {
                    this.loading.next(isLoading);
                });
        } else {
            this.loading.next(isLoading);
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
