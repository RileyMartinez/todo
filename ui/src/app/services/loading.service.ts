import { computed, Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private loadingSignal = signal<boolean>(false);
    public readonly loading = computed(() => this.loadingSignal());

    setLoading(isLoading: boolean): void {
        this.loadingSignal.set(isLoading);
    }
}
