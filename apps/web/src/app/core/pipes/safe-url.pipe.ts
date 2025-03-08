import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
    name: 'safeUrl',
    standalone: true,
})
export class SafeUrlPipe implements PipeTransform {
    private readonly domSanitizer = inject(DomSanitizer);

    transform(url: string | null | undefined): SafeUrl {
        if (!url) {
            return '';
        }

        return this.domSanitizer.bypassSecurityTrustUrl(url);
    }
}
