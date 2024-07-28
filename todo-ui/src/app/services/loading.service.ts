import { computed, Injectable, signal } from '@angular/core';
import { first, tap, timer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private minimumDelay = 500;
    private loadingSignal = signal<boolean>(false);
    public readonly loading = computed(() => this.loadingSignal());

    setLoading(isLoading: boolean): void {
        if (!isLoading && this.loadingSignal()) {
            timer(this.minimumDelay)
                .pipe(
                    first(),
                    tap(() => this.loadingSignal.set(isLoading)),
                )
                .subscribe();
        } else {
            this.loadingSignal.set(isLoading);
        }
    }
}
