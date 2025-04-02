import { computed, Injectable, signal } from '@angular/core';
import { UserContextDto } from '../../shared/openapi-client';

interface UserContextState {
    userContext: UserContextDto | null;
}

const initialState: UserContextState = {
    userContext: null,
};

@Injectable({
    providedIn: 'root',
})
export class UserContextService {
    private state = signal<UserContextState>(initialState);

    readonly userContext = computed(() => this.state().userContext);

    setUserContext(userContext: UserContextDto | null): void {
        this.state.update((state) => ({
            ...state,
            userContext,
        }));
    }

    clearUserContext(): void {
        this.state.set(initialState);
    }
}
