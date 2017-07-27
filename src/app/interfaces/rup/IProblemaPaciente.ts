import { ITipoProblema } from './ITipoProblema';
import { IOrganizacion } from './../IOrganizacion';
import { IProfesional } from './../IProfesional';
import { IPaciente } from './../IPaciente';


export interface IProblemaPaciente {
    id: String;
    tipoProblema: ITipoProblema;
    idProblemaOrigen: String[];
    paciente: String;
    fechaIdentificacion: Date;
    fechaInicio: Date;
    descripcion: String;
    evoluciones: [{
        fecha: Date,
        observacion: String,
        profesional: IProfesional,
        organizacion: IOrganizacion,
        // ambito: // TODO
        cronico: Boolean,
        estado: String,
        // campo destinado a segundas opiniones o auditorias de las prestaciones
        segundaOpinion: String[]
        // ambito: // TODO
    }];
}
