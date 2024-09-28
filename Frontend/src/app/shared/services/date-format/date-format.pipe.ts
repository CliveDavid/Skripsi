import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string, format: string = 'dd/MM/yy'): string { // or 'dd/MM/yy HH:mm:ss'
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(value, format) || '';
  }
}
