import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        let unaFecha = moment(value).format('DD-MM-YYYY');
        return (unaFecha);
    }
}
