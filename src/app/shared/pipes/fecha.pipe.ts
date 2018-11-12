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
    transform(value: any, args: string[]): any {

        return (args[0] === 'utc') ? moment(value).utc().format('DD/MM/YYYY') : moment(value).format('DD/MM/YYYY');
    }
}
