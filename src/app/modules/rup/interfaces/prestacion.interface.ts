import { IPrestacionEstado } from './prestacion.estado.interface';
import { IPrestacionRegistro } from './prestacion.registro.interface';
import { ISnomedConcept } from './snomed-concept.interface';

export interface IPrestacion {
    id: string;
    // Datos principales del paciente
    paciente: {
        // requirido, validar en middleware
        id: string,
        nombre: string,
        apellido: string,
        documento: string,
        telefono: string,
        sexo: string,
        fechaNacimiento: Date
    };
    // Datos de la solicitud
    solicitud: {
        // Tipo de prestación de ejecutarse
        tipoPrestacion: ISnomedConcept,
        // Fecha de solicitud
        // Nota: Este dato podría obtener del array de estados, pero está aquí para facilidar de consulta
        fecha: {
            type: Date,
            required: true
        },
        // ID del turno relacionado con esta prestación
        turno: string,
        // Profesional que solicita la prestacion
        profesional: {
            id: string,
            nombre: string,
            apellido: string,
            documento: string
        },
        // Organizacion desde la que se solicita la prestacion
        organizacion: {
            id: string,
            nombre: string
        },
        // ID de la prestación desde la que se generó esta solicitud
        prestacionOrigen: string,
        // Registros de la solicitud ... para los planes o prestaciones futuras
        registros: [IPrestacionRegistro],
    };

    // Datos de la ejecución (i.e. realización)
    ejecucion: {
        // Fecha de ejecución
        // Nota: Este dato podría obtener del array de estados, pero está aquí para facilidad de consulta
        fecha: Date,
        // Lugar donde se realiza
        organizacion: {
            // requirido, validar en middleware
            id: string,
            nombre: string
        },
        // Registros de la ejecución
        registros: [IPrestacionRegistro],
    };
    // Historia de estado de la prestación
    estados: [IPrestacionEstado]
};
