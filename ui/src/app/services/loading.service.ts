import { computed, Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private loadingState = signal<boolean>(false);
    public readonly loading = computed(() => this.loadingState());

    setLoading(isLoading: boolean): void {
        this.loadingState.set(isLoading);
    }
}
