import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(value: string, search: string): SafeHtml {
        if (!search || !value) {
            return value;
        }
        const re = new RegExp(this.escapeRegExp(search), 'gi');
        const newValue = value.replace(re, match => `<mark>${match}</mark>`);
        return this.sanitizer.bypassSecurityTrustHtml(newValue);
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}