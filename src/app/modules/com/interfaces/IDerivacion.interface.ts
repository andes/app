import { IDerivacionHistorial } from './IDerivacionHistorial.interface';
import { IObraSocial } from 'src/app/interfaces/IObraSocial';

export interface IDerivacion {
    id: String;
    fecha: Date;
    organizacionOrigen: {
        nombre: String;
        id: String;
    };
    organizacionDestino: {
        nombre: String;
        direccion: String;
        id: String;
    };
    profesionalSolicitante: {
        nombre: String;
        apellido: String;
        documento: Number;
        id: String;
    };
    paciente: {
        id: String;
        documento: String;
        sexo: String;
        genero: String;
        nombre: String;
        apellido: String;
        fechaNacimiento: Date;
        obraSocial: IObraSocial;
    };
    estado: String;
    detalle: String;
    adjuntos: any;
    historial: [IDerivacionHistorial];
    cancelada: Boolean;
    prioridad: String;
}
