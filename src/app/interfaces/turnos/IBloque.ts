import { ITipoPrestacion } from './../ITipoPrestacion';
import { ITurno } from './ITurno';
export interface IBloque {
    id: String;
    horaInicio: Date;
    horaFin: Date;
    cantidadTurnos: Number;
    duracionTurno: Number;
    descripcion: String;
    tipoPrestaciones: ITipoPrestacion[];
    accesoDirectoDelDia: Number;
    restantesDelDia: Number;
    accesoDirectoProgramado: Number;
    restantesProgramados: Number;
    reservadoGestion: Number;
    restantesGestion: Number;
    reservadoProfesional: Number;
    restantesProfesional: Number;
    pacienteSimultaneos: Boolean;
    cantidadSimultaneos: Number;
    citarPorBloque: Boolean;
    cantidadBloque: Number;
    turnos: ITurno[];
}
