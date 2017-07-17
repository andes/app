import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'profesional' })
export class ProfesionalPipe implements PipeTransform {
    transform(value: any, args?: string[]): any {
        if (value) {
            return value.apellido + ', ' + value.nombre;
        }
    }
}
