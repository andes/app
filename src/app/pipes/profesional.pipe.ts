import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'profesional' })
export class ProfesionalPipe implements PipeTransform {
    transform(value: any, args?: string[]): any {
        if (value) {
            if (value.apellido && value.nombre) {
                return value.apellido + ', ' + value.nombre;
            } else {
                return (value.apellido ? value.apellido : value.nombre);
            }
        }
    }
}
