import { IFinanciador } from './../IFinanciador';
import { IContacto } from './../IContacto';
import { IProblemaPaciente } from './IProblemaPaciente';
import { IOrganizacion } from './../IOrganizacion';
import { IProfesional } from './../IProfesional';
import { ITipoPrestacion } from './../ITipoPrestacion';
import { IPaciente } from './../IPaciente';

export interface IPrestacionPaciente {
    id: String;
    idPrestacionOrigen: String; // prestacion desde la que se solicita
    paciente: IPaciente;
    solicitud: {
        // tipo de prsetacion a ejecutarse
        tipoPrestacion: ITipoPrestacion,
        // fecha de solicitud
        fecha: Date,
        // ambito desde el cual se solicita
        procedencia: String,
        // prioridad de la solicitud
        prioridad: String,
        // proposito por el cual voy a ejecutar
        proposito: [String],
        // estado del paciente en el episodio
        estadoPaciente: String,
        // profesional que solicita la prestacion
        profesional: IProfesional,
        // organizacion desde la que se solicita la prestacion
        organizacion: IOrganizacion,
        // lista de problemas del paciente por el cual se solicita la prestacion
        listaProblemas: [
            IProblemaPaciente
        ],
        // prestacion de origen por la cual se solicita esta nueva
        idPrestacionOrigen: IPrestacionPaciente,
        // datos propios de la solicitud
        datosPropios: Object,

        // frecuencia de ejecucion de la prestacion
        frecuencia: {
            valor: String,
            unidad: String
        },
        // motivo de consulta autoreferido por el paciente
        // motivoConsultaPaciente: String,
        // motivoConsulta: {
        //     codificadorSchema
        // },
        // en caso de tener que necesitar un turno para la prestacion
        requiereTurno: Boolean,
        idTurno: String,
        // contactos del paciente
        otroContacto: IContacto,
        // Deben ser los financiadorse que tiene le paciente
        financiador: IFinanciador,

        // datos complementarios de la organizacion, aca se podran almacenar
        // valores particulares de cada organizacion
        datosComplementarios: {
            momentoRealizacionSolicitud: String,
            observaciones: String,
            idProfesionalAsignado: String
        }
    };


    ejecucion: {
        // prestaciones ejecutadas en el transcurso de la prestacion de origen
        prestaciones: [IPrestacionPaciente],
        listaProblemas: IProblemaPaciente[],
        fecha: Date,
        organizacion: IOrganizacion,
        profesional: IProfesional,
        // TODO: Definir evoluciones y prestacionesSolicitadas bajo
        // que objeto van a estar,... solicitud .. ejecucion .. ¿postEjecucion?
        evoluciones: [Object],
        datosPropios: Object
    };

    // a futuro que se ejecuta
    prestacionesSolicitadas: [String];

    estado: [
        {
            timestamp: Date,
            tipo: String,
            profesional: IProfesional
        }
       
    ];
// tslint:disable-next-line:eofline
}