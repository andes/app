import { Pipe, PipeTransform } from '@angular/core';

/**
 * Ejemplo A: 1 | pluralizar:['turno','turnos'] => 1 turno
 * Ejemplo B: 55 | pluralizar:['turno','turnos'] => 55 turnos
 */
@Pipe({ name: 'pluralizar' })
export class PluralizarPipe implements PipeTransform {
    transform(value: Number, type: string[]): string {
        return value + ' ' + ((value === 1) ? type[0] : type[1]);
    }
}
