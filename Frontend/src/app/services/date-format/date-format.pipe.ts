import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string, format: string = 'dd/MM/yy HH:mm:ss'): string {
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(value, format) || '';
  }
}
