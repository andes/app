import { Pipe, PipeTransform } from '@angular/core';

/**
 * Ejemplo:
 */
@Pipe({ name: 'replace' })
export class ReplacePipe implements PipeTransform {
    transform(value: string, replace: string[]): string {
        return value.replace(replace[0], replace[1]);
    }
}
