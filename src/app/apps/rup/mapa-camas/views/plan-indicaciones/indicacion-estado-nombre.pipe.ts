import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'indicacionLabel'
})
export class IndicacionLabelPipe implements PipeTransform {
    transform(estado: string): any {
        switch (estado) {
        case 'on-hold':
            return 'pausado';
        case 'cancelled':
            return 'suspendido';
        case 'draft':
            return 'borrador';
        case 'bypass':
            return 'bypass';
        default:
            return 'activo';
        }
    }
}
