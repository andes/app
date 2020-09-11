import { Pipe, PipeTransform } from '@angular/core';
import * as moment_ from 'moment';
const moment = moment_;

@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
    transform(value: any, arg1?: string): any {
        if (arg1 && arg1 === 'utc') {
            return moment(value).utc().format('DD/MM/YYYY');
        } else {
            return moment(value).format('DD/MM/YYYY');
        }
    }
}
