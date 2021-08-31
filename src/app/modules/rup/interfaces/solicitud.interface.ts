import { IPrestacionRegistro } from './prestacion.registro.interface';
import { ISnomedConcept } from './snomed-concept.interface';

export class ISolicitud {
    // Datos principales del paciente
    paciente: {
        // requirido, validar en middleware
        id: string;
        nombre: string;
        apellido: string;
        documento: string;
        sexo: string;
        fechaNacimiento: Date;
    };
    // Tipo de prestación de ejecutarse (destino)
    tipoPrestacion: ISnomedConcept;
    // tipo prestacion Origen
    tipoPrestacionOrigen: ISnomedConcept;
    // Fecha de solicitud
    // Nota: Este dato podría obtener del array de estados, pero está aquí para facilidar de consulta
    fecha: Date;
    // ID del turno relacionado con esta prestación
    turno: string;
    // Profesional Destino
    profesional: {
        id: string;
        nombre: string;
        apellido: string;
        documento: string;
    };
    // Profesional Origen
    profesionalOrigen: {
        id: string;
        nombre: string;
        apellido: string;
        documento: string;
    };
    // Organizacion destino
    organizacion: {
        id: string;
        nombre: string;
    };
    // Organizacion
    organizacionOrigen: {
        id: string;
        nombre: string;
    };
    // ID de la prestación desde la que se generó esta solicitud
    prestacionOrigen: string;
    // Registros de la solicitud ... para los planes o prestaciones futuras
    registros: IPrestacionRegistro[];

}
