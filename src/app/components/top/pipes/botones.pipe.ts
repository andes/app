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
            volverAuditoria: false,
            referir: false,
            anular: false,
            continuarRegistro: false,
            verHuds: false,
            devolverDeshacer: false,
            cancelar: false,
            comunicacionPaciente: false
        };
        if (prestacion?.paciente) {
            if (prestacion.estadoActual.tipo === 'asignada') {
                if (this.esEfectorDestino(prestacion)) {
                    botones.devolverDeshacer = true;

                    if (this.esProfesionalDestino(prestacion)) {
                        botones.iniciarPrestacion = true;
                        botones.citarPaciente = true;
                        botones.verHuds = true;
                    }
                }
            }
            if (prestacion.estadoActual.tipo === 'rechazada') {
                botones.referir = true;
            }
            if (!prestacion.solicitud.turno) {
                if (prestacion.estadoActual.tipo === 'pendiente') {
                    if (this.esEfectorDestino(prestacion)) {
                        botones.darTurno = true;
                        botones.anular = true;
                        botones.volverAuditoria = true;
                    }
                    if (prestacion.solicitud.historial.length) {
                        botones.comunicacionPaciente = true;
                    }
                }
                if (prestacion.estadoActual.tipo === 'auditoria' && prestacion.solicitud.historial.length) {
                    botones.comunicacionPaciente = true;
                }
                if ((this.esEfectorDestino(prestacion) && prestacion.estadoActual.tipo === 'auditoria')) {
                    botones.auditar = true;
                }
            }
        }
        if (this.esEfectorOrigen(prestacion) && prestacion.estadoActual.tipo === 'pendiente' && !prestacion.solicitud.turno) {
            botones.cancelar = true;
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

    esEfectorOrigen(prestacion) {
        return prestacion.solicitud.organizacionOrigen.id === this.auth.organizacion.id;
    }

    esProfesionalDestino(prestacion) {
        return prestacion.solicitud.profesional?.id === this.auth.profesional;
    }

    esUsuarioCreador(prestacion) {
        return this.auth.usuario.id === prestacion.createdBy.id;
    }

}
