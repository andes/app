import moment from 'moment';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fromNow' })
export class FromNowPipe implements PipeTransform {
    transform(value: any): any {
        return moment(value).fromNow();
    }
}
