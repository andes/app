import { Auth } from '@andes/auth';
import { Pipe, PipeTransform } from '@angular/core';
import { IPrestacion } from '../../../modules/rup/interfaces/prestacion.interface';

@Pipe({
    name: 'estadoSolicitud'
})
export class EstadoSolicitudPipe implements PipeTransform {
    constructor(private auth: Auth) { }
    transform(prestacion: IPrestacion): any {

        if (prestacion.solicitud.turno && prestacion.estadoActual.tipo !== 'validada') {
            return 'Turno dado';
        }
        if (prestacion.solicitud.organizacion.id === this.auth.organizacion.id) {
            if (prestacion.estadoActual.tipo === 'pendiente' && prestacion?.paciente && !prestacion.solicitud.turno) {
                return 'pendiente';
            }
            const esAuditoria = prestacion.estadoActual.tipo === 'auditoria' || prestacion.estadoActual.tipo === 'rechazada';
            if (esAuditoria) {
                return prestacion.estadoActual.tipo === 'auditoria' ? 'auditoria' : 'rechazada';
            }
            if (prestacion.paciente && prestacion.estadoActual.tipo === 'asignada' && prestacion.solicitud.profesional?.id === this.auth.profesional) {
                return 'asignada';
            }
        }
        if (prestacion.solicitud.organizacion && prestacion.solicitud.organizacion.id !== this.auth.organizacion.id) {
            return 'referida';
        }
        if (prestacion.estadoActual.tipo === 'validada') {
            return 'validada';
        }
        if (prestacion.estadoActual.tipo === 'anulada') {
            return 'anulada';
        }
        if (prestacion.estadoActual.tipo === 'ejecucion') {
            return 'ejecucion';
        }
        if (prestacion.estadoActual.tipo === 'rechazada') {
            return 'rechazada';
        }

    }
}
