import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nombre', pure: false })

export class NombrePipe implements PipeTransform {
    transform(value: any): any {
        if (!value) {
            return null;
        }
        const data = (value.referencia && typeof value.referencia === 'object' && (value.referencia.nombre || value.referencia.apellido))
            ? value.referencia : value;
        if (data.alias) {
            return data.apellido + ', ' + data.alias;
        } else {
            if (data.apellido && data.nombre) {
                return data.apellido + ', ' + data.nombre;
            } else {
                return (data.apellido ? data.apellido : data.nombre);
            }
        }
    }
}
