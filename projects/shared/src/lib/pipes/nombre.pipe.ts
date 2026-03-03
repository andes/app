import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nombre', pure: false })

export class NombrePipe implements PipeTransform {
    transform(value: any): any {
        if (!value) {
            return null;
        } else if (value.alias) {
            return value.apellido + ', ' + value.alias;
        } else {
            if (value.apellido && value.nombre) {
                return value.apellido + ', ' + value.nombre;
            } else {
                return (value.apellido ? value.apellido : value.nombre);
            }
        }
    }
}
