import { computed, Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private minimumDelay = 500;
    private loadingSignal = signal<boolean>(false);
    public readonly loading = computed(() => this.loadingSignal());

    setLoading(isLoading: boolean): void {
        if (!isLoading && this.loadingSignal()) {
            setTimeout(() => this.loadingSignal.set(isLoading), this.minimumDelay);
        } else {
            this.loadingSignal.set(isLoading);
        }
    }
}
