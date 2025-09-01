import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'pluralizar' })
export class PluralizarPipe implements PipeTransform {
    transform(value: number, type: string[]): string {
        return value + ' ' + ((value === 1) ? type[0] : type[1]);
    }
}
