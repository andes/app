import { ITipoProblema } from './ITipoProblema';
import { IOrganizacion } from './../IOrganizacion';
import { IProfesional } from './../IProfesional';
import { IPaciente } from './../IPaciente';


export interface IProblemaPaciente {
    id: String,
    tipoProblema: ITipoProblema,
    idProblemaOrigen: [String],
    paciente: IPaciente,
    fechaInicio: Date,
    evoluciones: [{
        fecha: Date,
        activo: Boolean,
        observacion: String,
        profesional: [IProfesional],
        organizacion: IOrganizacion,
        //ambito: // TODO
    }]
}