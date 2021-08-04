import { ICie10 } from '../../../interfaces/ICie10';
import { ISnomedConcept } from './snomed-concept.interface';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

interface ICodificacion {
    codificacionProfesional?: {
        cie10: ICie10;
        snomed: ISnomedConcept;
    };
    codificacionAuditoria?: ICie10;
    primeraVez: Boolean;
}

export interface ICodificacionPrestacion {
    id?: String;
    idPrestacion: String;
    paciente: {
        id: String;
        nombre: String;
        apellido: String;
        documento: String;
        telefono?: String;
        sexo: String;
        fechaNacimiento: Date;
    };
    diagnostico: { codificaciones: ICodificacion[] };
}
