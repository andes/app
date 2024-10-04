import { Auth } from '@andes/auth';
import { Pipe, PipeTransform } from '@angular/core';
import { IAgenda } from '../../../../interfaces/turnos/IAgenda';

@Pipe({
    name: 'botonesTurnos'
})
export class BotonesTurnosPipe implements PipeTransform {
    constructor(private auth: Auth) { }
    transform(agenda: IAgenda, turnos: any[]): any {
        const botones = {
            darAsistencia: false,
            sacarAsistencia: false,
            suspender: false,
            liberar: false,
            listaDeEspera: false,
            turnoDoble: false,
            quitarTurnoDoble: false,
            nota: false,
            sms: false,
            editarCarpeta: false,
            cambiarDisponible: false
        };

        const puedeRegistrarAsistencia = this.auth.check('turnos:turnos:registrarAsistencia');
        const puedeSuspenderTurno = this.auth.check('turnos:turnos:suspenderTurno');
        const puedeLiberarTurno = this.auth.check('turnos:turnos:liberarTurno');
        const puedeEditarCarpeta = this.auth.check('turnos:turnos:editarCarpeta');
        const puedeMarcarTurnDoble = this.auth.check('turnos:turnos:turnoDoble');

        if (agenda && turnos.length) {
            // Dar asistencia: el turno está con paciente asignado, sin asistencia ==> pasa a estar con paciente asignado, con asistencia
            botones.darAsistencia = puedeRegistrarAsistencia && this.agendaNoCerrada(agenda) && this.tienenPacientes(turnos) && this.agendaNoSuspendida(agenda) && (this.noTienenAsistencia(turnos) && this.ningunoConEstado('suspendido', turnos)) && this.agendaHoy(agenda) && !this.tienenDiagnostico(turnos);
            // Sacar asistencia: el turno está con paciente asignado, con asistencia ==> pasa a estar "sin asistencia" (mantiene el paciente)
            botones.sacarAsistencia = puedeRegistrarAsistencia && this.agendaNoCerrada(agenda) && this.tienenAsistencia(turnos) && this.tienenPacientes(turnos) && !this.tienenDiagnostico(turnos);
            botones.nota = this.agendaNoCerrada(agenda);
            // Suspender turno: El turno no tiene asistencia ==> el estado pasa a "suspendido"
            botones.suspender = puedeSuspenderTurno && this.agendaNoCerrada(agenda) && this.agendaNoSuspendida(agenda) && this.noTienenAsistencia(turnos) && this.ningunoConEstado('suspendido', turnos) && this.ningunoConEstado('turnoDoble', turnos) && !this.tienenDiagnostico(turnos);
            // Enviar SMS
            botones.sms = this.agendaNoSuspendida(agenda) && this.todosConEstado('asignado', turnos) && this.todosConEstado('suspendido', turnos) && this.noTienenAsistencia(turnos) && (!this.hayTurnosTarde(agenda, turnos));
            botones.cambiarDisponible = !this.tienenPacientes(turnos) && this.todosConEstado('suspendido', turnos);
        }
        if (agenda && turnos.length === 1) {
            // Liberar turno: está "asignado" ==> el estado pasa a "disponible" y se elimina el paciente
            botones.liberar = puedeLiberarTurno && this.agendaNoCerrada(agenda) && (this.agendaNoSuspendida(agenda) && this.tienenPacientes(turnos) && this.noTienenAsistencia(turnos) && this.todosConEstado('asignado', turnos)) && !this.tienenDiagnostico(turnos);
            // Se verifica si el siguiente turno se encuentra disponible
            botones.turnoDoble = puedeMarcarTurnDoble && this.agendaNoCerrada(agenda) && this.agendaNoSuspendida(agenda) && this.tienenPacientes(turnos) && this.noTienenAsistencia(turnos) && this.todosConEstado('asignado', turnos) && this.siguienteDisponible(agenda, turnos);
            // Se puede quitar turno doble sólo si está en ese estado
            botones.quitarTurnoDoble = puedeMarcarTurnDoble && this.agendaNoCerrada(agenda) && this.agendaNoSuspendida(agenda) && this.todosConEstado('turnoDoble', turnos) && !this.isDobleSuspendido(agenda, turnos) && !this.tienenDiagnostico(turnos);
            // Se puede editar carpeta si el turno tiene paciente
            botones.editarCarpeta = puedeEditarCarpeta && this.agendaNoCerrada(agenda) && this.tienenPacientes(turnos);
        }
        return botones;
    }

    agendaNoCerrada(agenda) {
        return agenda.estado !== 'pendienteAuditoria' && agenda.estado !== 'pendienteAsistencia' && agenda.estado !== 'codificada' && agenda.estado !== 'auditada';
    }


    tienenPacientes(turnos) {
        return turnos.filter((turno) => {
            return (turno.paciente && turno.paciente.id);
        }).length === turnos.length;
    }

    agendaNoSuspendida(agenda) {
        return agenda.estado !== 'suspendida' || agenda.enviarSms;
    }

    noTienenAsistencia(turnos) {
        for (let x = 0; x < turnos.length; x++) {
            if (turnos[x].asistencia === 'asistio') {
                return false;
            }
        }
        return turnos.length > 0;
    }

    ningunoConEstado(estado, turnos) {
        for (let x = 0; x < turnos.length; x++) {
            if (turnos[x].estado === estado && turnos[x].avisoSuspension !== 'no enviado') {
                return false;
            }
        }
        return turnos.length > 0;
    }

    agendaHoy(agenda) {
        return moment(agenda.horaInicio).startOf('day').format() === moment().startOf('day').format();
    }

    /**
 * Devuelve true si uno de los turnos seleccionados tiene un diagnóstico.
 * Devuelve falso solo cuando ninguno de los turnos tiene diagnóstico.
 * @returns {Boolean}
 * @memberof TurnosComponent
 */
    tienenDiagnostico(turnos): Boolean {
        return turnos.some(x => {
            return x.diagnostico.codificaciones.length > 0;
        });
    }

    tienenAsistencia(turnos) {
        for (let x = 0; x < turnos.length; x++) {
            if (turnos[x].asistencia !== 'asistio') {
                return false;
            }
        }
        return true;
    }

    todosConEstado(estado, turnos) {
        for (let x = 0; x < turnos.length; x++) {
            if (turnos[x].estado !== estado) {
                return false;
            }
        }
        return turnos.length > 0;
    }

    siguienteDisponible(agenda, turnos) {
        let index;
        let bloqueTurno;
        let turnoSeleccionado;
        for (let x = 0; x < turnos.length; x++) {
            // Se busca la posición del turno y se verifica que el siguiente turno se encuentre disponible
            turnoSeleccionado = turnos[x];
            bloqueTurno = agenda.bloques.find(bloque => (bloque.turnos.findIndex(t => (t._id === turnoSeleccionado._id)) >= 0));
            if (bloqueTurno) {
                index = bloqueTurno.turnos.findIndex(t => {
                    return t._id === turnoSeleccionado._id;
                });
                if ((index === -1) || ((index < bloqueTurno.turnos.length - 1) && (bloqueTurno.turnos[index + 1].estado !== 'disponible')) || (index === (bloqueTurno.turnos.length - 1))) {
                    return false;
                }
                if (bloqueTurno.citarPorBloque) {
                    if (String(bloqueTurno.turnos[index].horaInicio) !== String(bloqueTurno.turnos[index + 1].horaInicio)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    isDobleSuspendido(agenda, turnos) {
        let response = false;

        const indiceTurnoPadre = agenda.bloques[0].turnos.indexOf(turnos[0]) - 1;
        if (indiceTurnoPadre > 0) {
            response = (agenda.bloques[0].turnos[indiceTurnoPadre].estado === 'suspendido');
        }

        return response;
    }

    hayTurnosTarde(agenda, turnos) {
        // Si la Agenda actual tiene fecha de hoy...
        if (moment(agenda.horaInicio).startOf('day').format() >= moment().startOf('day').format()) {
            return turnos.filter((turno) => {
                // hay turnos tarde (ya se les pasó la hora)
                return moment(turno.horaInicio).format() < moment().format();
            }).length;
        }
    }
}
