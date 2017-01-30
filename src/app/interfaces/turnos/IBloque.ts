import { ITurno } from './ITurno';
import { IPrestacion } from './IPrestacion';
export interface IBloque {
    horaInicio: Date;
    horaFin: Date;
    cantidadTurnos: Number;
    duracionTurno: Number;
    descripcion: String;
    prestaciones: IPrestacion[];
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
