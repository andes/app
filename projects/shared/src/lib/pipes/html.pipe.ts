import { Pipe, PipeTransform } from '@angular/core';

/**
 * Borra automaticamente las tags del HTML.
 * Para mostrar las observaciones en texto plano.
 */

@Pipe({ name: 'html' })
export class Html2TextPipe implements PipeTransform {
    transform(value: any): any {
        return value.replace(/<[^>]*>/g, '');
    }
}
