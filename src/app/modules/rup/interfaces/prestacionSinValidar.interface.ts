import { IPrestacion } from './prestacion.interface';

export type AsistenciaTurno = 'asistio' | 'noAsistio' | 'sinDatos' | null;

export interface ITurnoInfoEncontrado {
    encontrado: true;
    id: string;
    idAgenda: string;
    tipoTurno: 'turno' | 'sobreturno';
    asistencia?: AsistenciaTurno;
}

export interface ITurnoInfoNoEncontrado {
    encontrado: false;
    id: string;
    asistencia?: AsistenciaTurno;
}

export interface IPrestacionSinValidar extends IPrestacion {
    turnoInfo?: ITurnoInfoEncontrado | ITurnoInfoNoEncontrado | null;
}

export interface IPrestacionesSinValidarResponse {
    items: IPrestacionSinValidar[];
    hasMore: boolean;
}
