import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'rupiah'
})
export class RupiahPipe implements PipeTransform {
    transform(value: number | string): string {
        if (value === null || value === undefined) {
            return '';
        }

        // Convert to number if it's a string
        const numValue = typeof value === 'string' ? parseFloat(value) : value;

        // Round to nearest integer
        const roundedValue = Math.round(numValue);

        // Convert to string and add thousand separators
        return roundedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
}