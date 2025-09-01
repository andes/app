import { ITipoPrestacion } from './../ITipoPrestacion';
import { ITurno } from './ITurno';
export interface IBloque {
    id: string;
    horaInicio: Date;
    horaFin: Date;
    cantidadTurnos: number;
    duracionTurno: number;
    descripcion: string;
    tipoPrestaciones: ITipoPrestacion[];
    accesoDirectoDelDia: number;
    accesoDirectoProgramado: number;
    reservadoGestion: number;
    reservadoProfesional: number;
    restantesDelDia: number;
    restantesProgramados: number;
    restantesGestion: number;
    restantesProfesional: number;
    restantesMobile: number;
    cupoMobile: number;
    pacienteSimultaneos: boolean;
    cantidadSimultaneos: number;
    citarPorBloque: boolean;
    cantidadBloque: number;
    turnos: ITurno[];
}
