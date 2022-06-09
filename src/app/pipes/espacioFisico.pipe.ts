import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'espacioFisico' })
export class EspacioFisicoPipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        if (!value) {
            return null;
        } else if (value.espacioFisico) {
            const servicio = (value.espacioFisico.servicio?.nombre) ? '(' + value.espacioFisico.servicio.nombre + ')' : '';
            const edificio = (value.espacioFisico.edificio?.descripcion) ? '(' + value.espacioFisico.edificio.descripcion + ')' : '';
            return value.espacioFisico.nombre + servicio + edificio;
        } else {
            if (value.otroEspacioFisico) {
                return value.otroEspacioFisico.nombre;
            } else {
                return '';
            }
        }
    }
}
