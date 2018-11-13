import { Pipe, PipeTransform } from '@angular/core';

/**
 * Implementa un pipe de fecha u hora utilizando moment.js
 *
 * @export
 * @class FechaPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
    transform(value: any, arg1: string): any {
        if (arg1 && arg1 === 'utc') {
            return moment(value).utc().format('DD/MM/YYYY');
        } else {
            return moment(value).format('DD/MM/YYYY');
        }
    }
}
