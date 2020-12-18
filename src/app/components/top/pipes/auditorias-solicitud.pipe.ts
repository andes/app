import { Auth } from '@andes/auth';
import { Pipe, PipeTransform } from '@angular/core';
import { IPrestacion } from '../../../modules/rup/interfaces/prestacion.interface';

@Pipe({
    name: 'auditoriasSolicitud'
})
export class AuditoriasSolicitudPipe implements PipeTransform {
    constructor(private auth: Auth) { }
    transform(prestacion: IPrestacion): any {
        const accionesAuditorias = [
            'rechazada',
            'pendiente',
            'referir',
            'devolver'
        ];
        return prestacion.solicitud.historial.filter(e => accionesAuditorias.includes(e.accion)).length;
    }
}
