import { Auth } from '@andes/auth';
import { Pipe, PipeTransform } from '@angular/core';
import { IPrestacion } from '../../../modules/rup/interfaces/prestacion.interface';

@Pipe({
    name: 'botonesSolicitud'
})
export class BotonesSolicitudPipe implements PipeTransform {
    constructor(private auth: Auth) { }
    transform(prestacion: IPrestacion): any {
        const botones = {
            iniciarPrestacion: false,
            citarPaciente: false,
            darTurno: false,
            auditar: false,
            anular: false
        };
        if (this.esProfesionalDestino(prestacion) && prestacion.paciente && prestacion.estadoActual.tipo === 'asignada') {
            botones.iniciarPrestacion = true;
            botones.citarPaciente = true;
        }
        if (this.esEfectorDestino(prestacion)) {
            if (prestacion.estadoActual.tipo === 'pendiente' && prestacion ?.paciente && !prestacion.solicitud.turno) {
                botones.darTurno = true;
                botones.anular = true;
            }
            if (prestacion.estadoActual.tipo === 'auditoria' || prestacion.estadoActual.tipo === 'rechazada') {
                botones.auditar = true;
            }
        }
        return botones;

    }

    esEfectorDestino(prestacion) {
        return prestacion.solicitud.organizacion.id === this.auth.organizacion.id;
    }

    esProfesionalDestino(prestacion) {
        return prestacion.solicitud.profesional?.id === this.auth.profesional;
    }

}
