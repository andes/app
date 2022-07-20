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
            anular: false,
            continuarRegistro: false
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
        // Si es el mismo usuario que creó la solicitud
        if (this.esUsuarioCreador(prestacion)) {
            // Si está en estado auditoria Y no tuvo movimientos después de crearse, se podrá anular
            if (prestacion.estadoActual.tipo === 'auditoria' && prestacion.solicitud.historial.length === 1) {
                botones.anular = true;
            }
        }
        // Si el usuario tiene permisos para rup e inicio el registro de atencion medica o tiene permisos especiales podra continuar con la prestacion
        if (this.auth.getPermissions('rup:?').length) {
            botones.continuarRegistro = ((prestacion.estadoActual.tipo === 'ejecucion') &&
                (prestacion.estadoActual.createdBy.username === this.auth.usuario.username)) || (this.auth.check(`rup:validacion:${prestacion.solicitud.tipoPrestacion.id}`));
        }
        return botones;
    }

    esEfectorDestino(prestacion) {
        return prestacion.solicitud.organizacion.id === this.auth.organizacion.id;
    }

    esProfesionalDestino(prestacion) {
        return prestacion.solicitud.profesional?.id === this.auth.profesional;
    }

    esUsuarioCreador(prestacion) {
        return this.auth.usuario.id === prestacion.createdBy.id;
    }

}
