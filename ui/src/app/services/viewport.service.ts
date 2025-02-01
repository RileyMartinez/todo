import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
    providedIn: 'root',
})
export class ViewPortService {
    private readonly breakpointObserver = inject(BreakpointObserver);
    readonly isMobile = signal(false);

    constructor() {
        this.breakpointObserver
            .observe([Breakpoints.Handset])
            .pipe(takeUntilDestroyed())
            .subscribe((result) => {
                this.isMobile.set(result.matches);
            });
    }
}
