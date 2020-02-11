import { ICie10 } from '../../../interfaces/ICie10';
import { ISnomedConcept } from './snomed-concept.interface';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

interface ICodificacion {
    codificacionProfesional?: {
        cie10: ICie10,
        snomed: ISnomedConcept
    };
    codificacionAuditoria?: ICie10;
    primeraVez: Boolean;
}

export interface ICodificacionPrestacion {
    id?: String;
    idPrestacion: String;
    prestacion: any;
    paciente: {
        id: String,
        nombre: String,
        apellido: String,
        documento: string,
        telefono?: String,
        sexo: String,
        fechaNacimiento: Date,
        edad: number
    };
    diagnostico: { codificaciones: ICodificacion[] };
    createdAt: Date;
    createdBy: any;
}
