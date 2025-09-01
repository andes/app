import { IDerivacionHistorial } from './IDerivacionHistorial.interface';
import { IObraSocial } from 'src/app/interfaces/IObraSocial';

export interface IDerivacion {
    id: string;
    fecha: Date;
    organizacionOrigen: {
        nombre: string;
        id: string;
    };
    organizacionDestino: {
        nombre: string;
        direccion: string;
        id: string;
    };
    profesionalSolicitante: {
        nombre: string;
        apellido: string;
        documento: number;
        id: string;
    };
    paciente: {
        id: string;
        documento: string;
        sexo: string;
        genero: string;
        nombre: string;
        apellido: string;
        fechaNacimiento: Date;
        obraSocial: IObraSocial;
    };
    estado: string;
    detalle: string;
    adjuntos: any;
    historial: [IDerivacionHistorial];
    cancelada: boolean;
    prioridad: string;
}
