import { ICie10 } from '../../../interfaces/ICie10';
import { ISnomedConcept } from './snomed-concept.interface';

interface ICodificacion {
    codificacionProfesional?: {
        cie10: ICie10;
        snomed: ISnomedConcept;
    };
    codificacionAuditoria?: ICie10;
    primeraVez: boolean;
}

export interface ICodificacionPrestacion {
    id?: string;
    idPrestacion: string;
    paciente: {
        id: string;
        nombre: string;
        apellido: string;
        documento: string;
        telefono?: string;
        sexo: string;
        fechaNacimiento: Date;
    };
    diagnostico: { codificaciones: ICodificacion[] };
}
