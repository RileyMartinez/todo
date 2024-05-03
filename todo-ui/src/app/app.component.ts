import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from './loading.service';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        MatToolbarModule,
        MatButtonModule,
        MatIcon,
        RouterLink,
        MatProgressBarModule,
        CommonModule,
        MatMenuModule,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    constructor(
        public loadingService: LoadingService,
        public authService: AuthService,
    ) {
        this.loadingService.triggerLoading();
    }

    title = 'todo-ui';
}
