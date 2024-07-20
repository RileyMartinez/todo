import { Injectable } from '@angular/core';
import { BehaviorSubject, first, tap, timer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private minimumDelay = 500;
    private loading = new BehaviorSubject<boolean>(false);
    public readonly loading$ = this.loading.asObservable();

    setLoading(isLoading: boolean): void {
        if (!isLoading && this.loading.value) {
            timer(this.minimumDelay)
                .pipe(
                    first(),
                    tap(() => this.loading.next(isLoading)),
                )
                .subscribe();
        } else {
            this.loading.next(isLoading);
        }
    }
}
