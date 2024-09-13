import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(value: any, search: string): SafeHtml {
        if (!search || !value) {
            return value;
        }

        // Convert value to string if it's not already
        const stringValue = String(value);

        const re = new RegExp(this.escapeRegExp(search), 'gi');
        const match = stringValue.match(re);

        if (!match) {
            return stringValue;
        }

        const replacedValue = stringValue.replace(re, "<mark>$&</mark>");
        return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}