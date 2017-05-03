import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'fromNow'})
export class fromNowPipe implements PipeTransform {
  transform(value: any): any {
    debugger;
    
    let fecha = value;

    return moment(fecha, 'YYYYMMDD').fromNow();

  }
}
