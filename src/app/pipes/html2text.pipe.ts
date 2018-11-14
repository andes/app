import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

/**
 * Borra automaticamente las tags del HTML.
 * Para mostrar las observaciones en texto plano.
 */

@Pipe({ name: 'html' })
export class Html2TextPipe implements PipeTransform {
    transform(value: any, args: string[], hora = false): any {
        return value.replace(/<[^>]*>/g, '');
    }
}
