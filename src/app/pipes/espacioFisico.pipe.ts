import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'espacioFisico' })
export class EspacioFisicoPipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        if (!value) {
            return null;
        } else if (value.espacioFisico) {
            return value.espacioFisico.nombre;
        } else {
            if (value.otroEspacioFisico) {
                return value.otroEspacioFisico.nombre;
            } else {
                return '';
            }
        }
    }
}
