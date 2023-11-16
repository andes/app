import { Pipe, PipeTransform } from '@angular/core';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';

@Pipe({
    name: 'estadoPrestacion'
})
export class EstadoPrestacionPipe implements PipeTransform {
    constructor() { }

    transform(prestacion: IPrestacion): any {

        const badge = {
            'auditoria': 'info',
            'pendiente': 'info',
            'rechazada': 'warning',
            'ejecucion': 'default',
            'asignada': 'success',
            'turnoDado': 'success',
            'validada': 'success',
            'anulada': 'danger',
            'vencida': 'danger'
        };

        return prestacion.solicitud.turno ? 'success' : badge[prestacion.estadoActual.tipo];
    }
}
