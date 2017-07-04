import { TurnoService } from '../services/turnos/turno.service';
import { LogService } from '../services/log.service';

export function cantidadTurnosPorEstadoPaciente(userLogged) {
    let serviceTurno: TurnoService;
    let datosTurno = { estado: 'asignado', usuario: userLogged };
    let countTemporal = 0;
    let countValidado = 0;

    serviceTurno.get(datosTurno).subscribe(turnos => {
        turnos.forEach(turno => {
            if (turno.paciente.estado === 'temporal') {
                countTemporal++;
            } else {
                countValidado++;
            }
        });

        return [countTemporal, countValidado];
    });
}

export function cantidadTotalDeTurnosAsignados() {
    debugger;
    let serviceTurno: TurnoService;
    let datosTurno = { estado: 'asignado' };

    serviceTurno.get(datosTurno).subscribe(turnos => {
        return turnos.length;
    });
}

/**
 * Devuelve la cantidad de turnos a los que se hizo revisión de la asistencia,
 * Posee el valor de asistió, no asistió o sin datos
 * 
 * @export
 * @param {any} userLogged
 */
export function cantidadTurnosconAsistenciaVerificada(userLogged?) {
    // TurnosChequeados por usuario o total depende si se envia el usuario
    let serviceTurno: TurnoService;
    let datosTurno = { asistencia: true };
    if (userLogged) {
        datosTurno['usuario'] = userLogged;
    }
    serviceTurno.get(datosTurno).subscribe(turnos => {
        return turnos.length;
    });
}

export function cantidadTurnosCodificados() {
    let serviceTurno: TurnoService;
    let datosTurno = { codificado: true };
    serviceTurno.get(datosTurno).subscribe(turnos => {
        return turnos.length;
    });
}

export function cantidadTurnosDeUnaFechaPorEfector(fecha: Date, efector, tipos) {
    let serviceTurno: TurnoService;
    let datosTurno = { organizacion: efector, horaInicio: fecha, tipoTurno: tipos };
    serviceTurno.get(datosTurno).subscribe(turnos => {
        return turnos.length;
    });
}

export function cantidadDeContactosActualizados() {
    let logService: LogService;
    let datosLog = {};

    logService.get('mpi', datosLog).subscribe(logs => {
        return logs.length;
    });
}











