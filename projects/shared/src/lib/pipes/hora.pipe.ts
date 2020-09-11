import { Pipe, PipeTransform } from '@angular/core';
import * as moment_ from 'moment';
const moment = moment_;

@Pipe({ name: 'hora' })
export class HoraPipe implements PipeTransform {
    transform(value: any): any {
        return moment(value).format('HH:mm');
    }
}
