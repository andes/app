import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'indicacionLabel'
})
export class IndicacionLabelPipe implements PipeTransform {
    transform(estado: string): any {
        switch (estado) {
            case 'on-hold':
                return 'pausado';
            case 'completed':
                return 'completado';
            case 'stopped':
            case 'cancelled':
                return 'suspendido';
            default:
                return 'activo';
        }
    }
}
