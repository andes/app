import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
    transform(value: any, args: string[], hora = false): any {
        return hora ? moment(value).format('DD/MM/YYYY H:m:s') : moment(value).format('DD/MM/YYYY');
    }
}
