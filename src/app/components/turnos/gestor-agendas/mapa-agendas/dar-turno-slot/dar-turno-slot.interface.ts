import { IObraSocial } from '../../../../../interfaces/IObraSocial';
import { ITipoPrestacion } from '../../../../../interfaces/ITipoPrestacion';
import { IAgenda } from '../../../../../interfaces/turnos/IAgenda';
import { IBloque } from '../../../../../interfaces/turnos/IBloque';
import { ITurno } from '../../../../../interfaces/turnos/ITurno';
import { ISnomedConcept } from '../../../../../modules/rup/interfaces/snomed-concept.interface';

export interface SlotSeleccionado {
    fecha: Date;
    horaInicio: Date;
    horaFin: Date;
}

export interface TurnoEnSlot {
    bloque: IBloque;
    indiceBloque: number;
    turno: ITurno;
    indiceTurno: number;
    horaInicio: Date;
    horaFin: Date;
}

export interface AgendaEnSlot {
    agenda: IAgenda;
    turnos: TurnoEnSlot[];
    condicionLlave: boolean;
}

export interface SeleccionTurno {
    bloque: IBloque;
    indiceBloque: number;
    turno: ITurno;
    indiceTurno: number;
}

export interface DatosTurnoForm {
    tipoPrestacion: ITipoPrestacion;
    procedimiento?: ISnomedConcept;
    motivoConsulta: string;
    nota: string;
    telefono: string;
    financiador?: IObraSocial;
    link: string;
    videoConferencia: boolean;
    turnoTelefonico: boolean;
}
