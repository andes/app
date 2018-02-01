import { ITipoPrestacion } from './../ITipoPrestacion';
import { ITurno } from './ITurno';
export interface IBloque {
    id: String;
    horaInicio: Date;
    horaFin: Date;
    cantidadTurnos: number;
    duracionTurno: number;
    descripcion: String;
    tipoPrestaciones: ITipoPrestacion[];
    accesoDirectoDelDia: number;
    accesoDirectoProgramado: number;
    reservadoGestion: number;
    reservadoProfesional: number;
    restantesDelDia: number;
    restantesProgramados: number;
    restantesGestion: number;
    restantesProfesional: number;
    pacienteSimultaneos: Boolean;
    cantidadSimultaneos: number;
    citarPorBloque: Boolean;
    cantidadBloque: number;
    turnos: ITurno[];
}
