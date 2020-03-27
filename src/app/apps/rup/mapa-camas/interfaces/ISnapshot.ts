import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';
import { ISectores } from './../../../../interfaces/IOrganizacion';

export interface ISnapshot {
    id: String;
    genero: ISnomedConcept;
    estado: String;
    esCensable: Boolean;
    idInternacion: String;
    esMovimiento: Boolean;
    sugierePase?: Boolean;
    fecha: Date;
    unidadOrganizativa: ISnomedConcept;
    especialidades: [ISnomedConcept];
    ambito: String;
    unidadOrganizativaOriginal: ISnomedConcept;
    sectores: [ISectores];
    nombre: String;
    tipoCama: ISnomedConcept;
    equipamiento: [ISnomedConcept];
    idCama: String;
    paciente?: {
        id: String,
        documento: String,
        nombre: String,
        apellido: String,
        sexo: String,
        fechaNacimiento: Date
    };
    organizacion: {
        _id: String,
        nombre: String
    };
    createdAt?: Date;
    createdBy?: {
        id: String,
        nombreCompleto: String,
        nombre: String,
        apellido: String,
        username: Number,
        documento: Number
    };
    updatedAt?: Date;
    updatedBy?: {
        id: String,
        nombreCompleto: String,
        nombre: String,
        apellido: String,
        username: Number,
        documento: Number
    };
}

