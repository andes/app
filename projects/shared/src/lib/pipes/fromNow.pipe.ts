import { Pipe, PipeTransform } from '@angular/core';
import * as moment_ from 'moment';
const moment = moment_;

@Pipe({ name: 'fromNow' })
export class FromNowPipe implements PipeTransform {
    transform(value: any): any {
        return moment(value).fromNow();
    }
}
