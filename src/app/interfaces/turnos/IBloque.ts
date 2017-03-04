import { ITipoPrestacion } from './../ITipoPrestacion';
import { ITurno } from './ITurno';
export interface IBloque {
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
    pacienteSimultaneos: Boolean;
    cantidadSimultaneos: Number;
    citarPorBloque: Boolean;
    cantidadBloque: Number;
    turnos: ITurno[];
}
