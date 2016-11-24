import { IPrestacion } from './IPrestacion';
export interface IBloque{
    horaInicio: Date,
    horaFin: Date,
    cantidadTurnos: Number,
    descripcion: String,
    prestacion: IPrestacion,
    
    accesoDirectoDelDia: Number,
    accesoDirectoProgramado: Number,
    reservadoProgramado: Number,
    reservadoProfesional: Number,

    pacienteSimultaneos: Boolean,
    cantidadSimultaneos: Number,
    citarPorBloque: Boolean
}