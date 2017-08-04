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
    accesoDirectoProgramado: Number;
    reservadoGestion: Number;
    reservadoProfesional: Number;
    restantesDelDia: Number;
    restantesProgramados: Number;
    restantesGestion: Number;
    restantesProfesional: Number;
    pacienteSimultaneos: Boolean;
    cantidadSimultaneos: Number;
    citarPorBloque: Boolean;
    cantidadBloque: Number;
    turnos: ITurno[];
}
