import { computed, Injectable, signal } from '@angular/core';
import { Todo } from '../../shared/openapi-client';

export interface SidenavContent {
    type: 'details' | 'menu' | null;
    data?: any;
}

export interface SidenavState {
    content: SidenavContent;
    open: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class SidenavService {
    private readonly state = signal<SidenavState>({
        content: { type: null },
        open: false,
    });

    public readonly sidenavContent = computed(() => this.state().content);
    public readonly sidenavOpen = computed(() => this.state().open);

    public openDetails(todo: Todo): void {
        this.state.set({
            content: { type: 'details', data: todo },
            open: true,
        });
    }

    public toggleMenu(): void {
        if (this.sidenavOpen() && this.sidenavContent().type === 'menu') {
            this.close();
        } else {
            this.state.set({
                content: { type: 'menu' },
                open: true,
            });
        }
    }

    public close(): void {
        this.state.set({
            content: { type: null },
            open: false,
        });
    }
}
