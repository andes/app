import { TurnoService } from '../services/turnos/turno.service';
import { LogService } from '../services/log.service';

export function cantidadTurnosPorEstadoPaciente(userLogged, serviceTurno) {
    let datosTurno = { estado: 'asignado', userName: userLogged.username, userDoc: userLogged.documento };
    let countTemporal = 0;
    let countValidado = 0;

    serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
        turnos.forEach(turno => {
            if (turno.paciente.estado === 'temporal') {
                countTemporal++;
            } else {
                countValidado++;
            }
        });
        console.log([countTemporal, countValidado]);
        return countTemporal;
    });
}

export function cantidadTotalDeTurnosAsignados(serviceTurno) {
    let datosTurno = { estado: 'asignado' };

    serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
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
export function cantidadTurnosconAsistenciaVerificada(serviceTurno, userLogged?) {
    // TurnosChequeados por usuario o total depende si se envia el usuario
    let datosTurno = { asistencia: true };
    if (userLogged) {
        datosTurno['usuario'] = userLogged;
    }
    serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
        return turnos.length;
    });
}

export function cantidadTurnosCodificados(serviceTurno) {
    let datosTurno = { codificado: true };
    serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
        return turnos.length;
    });
}

export function cantidadTurnosDeUnaFechaPorEfector(fecha: Date, efector, tipos, serviceTurno) {
    let datosTurno = { organizacion: efector, horaInicio: fecha, tipoTurno: tipos };
    serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
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











