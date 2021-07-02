import { IPrestacionEstado } from './prestacion.estado.interface';
import { IPrestacionRegistro } from './prestacion.registro.interface';
import { ISnomedConcept } from './snomed-concept.interface';
import { IObraSocial } from '../../../interfaces/IObraSocial';

export class IPrestacion {
    id: string;
    trackId: string;
    groupId: string;
    elementoRUP: string;
    inicio: string;
    // Datos principales del paciente
    paciente: {
        // requirido, validar en middleware
        id: string,
        nombre: string,
        apellido: string,
        documento: string,
        telefono: string,
        sexo: string,
        fechaNacimiento: Date,
        obraSocial?: IObraSocial // Refactor cobertura
    };
    // Datos de la solicitud
    solicitud: {
        ambitoOrigen: string,
        // Tipo de prestación de ejecutarse
        tipoPrestacion: ISnomedConcept,
        // Tipo de prestación de ejecutarse
        tipoPrestacionOrigen: ISnomedConcept,
        // Fecha de solicitud
        // Nota: Este dato podría obtener del array de estados, pero está aquí para facilidar de consulta
        fecha: Date,
        // ID del turno relacionado con esta prestación
        turno: string,
        // Profesional que solicita la prestacion
        profesional: {
            id: string,
            nombre: string,
            apellido: string,
            documento: string
        },

        profesionalOrigen?: {
            id: string,
            nombre: string,
            apellido: string,
            documento: string
        }
        // Organizacion desde la que se solicita la prestacion
        organizacion: {
            id: string,
            nombre: string
        },
        // ID de la prestación desde la que se generó esta solicitud
        prestacionOrigen: string,
        // Registros de la solicitud ... para los planes o prestaciones futuras
        registros: IPrestacionRegistro[],
        organizacionDestino: any,
        organizacionOrigen: any,
        profesionalesDestino: any[],
        historial: any[],
        turneable: boolean;
        reglaId: string;
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
        registros: IPrestacionRegistro[],
    };
    // Historia de estado de la prestación
    estados: IPrestacionEstado[];
    estadoActual: IPrestacionEstado;
    unidadOrganizativa: ISnomedConcept;
    createdAt: Date;
    updatedAt: Date;

    metadata: { key: string, valor: any }[];

    /**
     * Recorre la estructura de los elementosRUP asociados y completa el array de registros
     *
     * @memberof IPrestacion
     */
    public completarRegistros() {
        throw Error('No implementado');
    }

    public timestampEjecucion() {
        return this.ejecucion.fecha.getTime();
    }
    public timestampSolicitud() {
        return this.solicitud.fecha.getTime();
    }
}
