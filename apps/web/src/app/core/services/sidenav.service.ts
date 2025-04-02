import { Injectable, Signal, signal } from '@angular/core';
import { Todo } from '../../shared/openapi-client';

export interface SidenavContent {
    type: 'details' | 'menu' | null;
    data?: any;
}

@Injectable({
    providedIn: 'root',
})
export class SidenavService {
    private sidenavContentSignal = signal<SidenavContent>({ type: null });
    public readonly sidenavContent: Signal<SidenavContent> = this.sidenavContentSignal.asReadonly();

    private sidenavOpenSignal = signal<boolean>(false);
    public readonly sidenavOpen: Signal<boolean> = this.sidenavOpenSignal.asReadonly();

    public openDetails(todo: Todo): void {
        this.sidenavContentSignal.set({ type: 'details', data: todo });
        this.sidenavOpenSignal.set(true);
    }

    public toggleMenu(): void {
        const currentContent = this.sidenavContentSignal();
        const isOpen = this.sidenavOpenSignal();

        if (isOpen && currentContent.type === 'menu') {
            this.close();
        } else {
            this.sidenavContentSignal.set({ type: 'menu' });
            this.sidenavOpenSignal.set(true);
        }
    }

    public close(): void {
        this.sidenavContentSignal.set({ type: null });
        this.sidenavOpenSignal.set(false);
    }
}
