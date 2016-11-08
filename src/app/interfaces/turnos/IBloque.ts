import { IPrestacion } from './IPrestacion';
export interface IBloque{
    horaInicio: Date,
    horaFin: Date,
    cantidadTurnos: Number,
    descripcion: String,
    prestacion: IPrestacion,
    
    deldiaAccesoDirecto: Number,
    deldiaReservado: Number,
    programadosAccesoDirecto: Number,
    programadosReservado: Number,
    programadosAutocitado: Number,

    pacienteSimultaneos: Boolean,
    cantidadSimultaneos: Number,
    citarPorBloque: Boolean
    
}