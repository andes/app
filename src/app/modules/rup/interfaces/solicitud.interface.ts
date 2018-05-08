import { IPrestacionRegistro } from './prestacion.registro.interface';
import { ISnomedConcept } from './snomed-concept.interface';

export class ISolicitud {

    // Tipo de prestación de ejecutarse
    tipoPrestacion: ISnomedConcept;
    // Fecha de solicitud
    // Nota: Este dato podría obtener del array de estados, pero está aquí para facilidar de consulta
    fecha: Date;
    // ID del turno relacionado con esta prestación
    turno: string;
    // Profesional que solicita la prestacion
    profesional: {
        id: string,
        nombre: string,
        apellido: string,
        documento: string
    };
    // Organizacion desde la que se solicita la prestacion
    organizacion: {
        id: string,
        nombre: string
    };
    // ID de la prestación desde la que se generó esta solicitud
    prestacionOrigen: string;
    // Registros de la solicitud ... para los planes o prestaciones futuras
    registros: IPrestacionRegistro[];
    organizacionDestino: any;
    profesionalesDestino: any[];

};
