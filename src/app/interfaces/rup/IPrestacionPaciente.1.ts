import { IFinanciador } from './../IFinanciador';
import { IContacto } from './../IContacto';
import { IProblemaPaciente } from './IProblemaPaciente';
import { IOrganizacion } from './../IOrganizacion';
import { IProfesional } from './../IProfesional';
import { ITipoPrestacion } from './../ITipoPrestacion';
import { IPaciente } from './../IPaciente';

export interface SnomedConcept {
    conceptId: String;
    term: String;
    fsn: String;
    semanticTag: String;
};


export interface IPrestacionPaciente {
    id: String;
    createdBy: {
        organizacion: {
            id: String,
            nombre: String
        },
        documento: String,
        username: String,
        apellido: String,
        nombre: String,
        nombreCompleto: String
    };
    createdAt: Date;
    paciente: {
        id: String,
        fechaNacimiento: Date,
        sexo: String,
        documento: String,
        apellido: String,
        nombre: String
    };
    solicitud: {
        // tipo de prsetacion a ejecutarse
        tipoPrestacion: SnomedConcept,
        // fecha de solicitud
        fecha: Date,
        // profesional que solicita la prestacion
        profesional: {
            id: String,
            nombre: String,
            apellido: String,
            documento: String
        },
        // organizacion desde la que se solicita la prestacion
        organizacion: {
            id: String,
            nombre: String
        },
        // problemas/hallazgos/trastornos por los cuales se solicita la prestación
        relacionadoCon: [SnomedConcept],
        // prestacion de origen por la cual se solicita esta nueva
        idPrestacionOrigen: IPrestacionPaciente,
        idTurno: String,
    };
    ejecucion: {
        fecha: Date
        turno: String,
        organizacion: {
            id: String,
            nombre: String
        },
        registros: [{
            concepto: SnomedConcept;
            valor: String,
            destacado: Boolean,
            relacionadoCon: SnomedConcept;
            createdBy: {
                organizacion: {
                    id: String,
                    nombre: String
                },
                documento: String,
                username: String,
                apellido: String,
                nombre: String,
                nombreCompleto: String
            };
            createdAt: Date;
        }];
    };
    estado: [
        {
            fecha: Date;
            tipo: String;
            createdBy: {
                organizacion: {
                    id: String,
                    nombre: String
                },
                documento: String,
                username: String,
                apellido: String,
                nombre: String,
                nombreCompleto: String
            };
            createdAt: Date;
        }
    ];
    // tslint:disable-next-line:eofline
}