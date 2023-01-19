import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';
import { ISectores } from './../../../../interfaces/IOrganizacion';

export interface ISnapshot {
    id: string;
    _key: string;

    genero: ISnomedConcept;
    estado: string;
    esCensable: Boolean;
    idInternacion: string;
    esMovimiento: Boolean;
    sugierePase?: Boolean;
    fecha: Date;
    fechaIngreso?: Date;
    fechaAtencion?: Date;
    unidadOrganizativa: ISnomedConcept;
    especialidades: ISnomedConcept[];
    ambito: String;
    capa: String;
    unidadOrganizativaOriginal: ISnomedConcept;
    sectorName?: String;
    diaEstada?: number;
    sectores: ISectores[];
    jerarquiaSectores?: any[];
    nombre: String;
    tipoCama: ISnomedConcept;
    equipamiento: ISnomedConcept[];
    idCama: string;
    paciente?: {
        id: String;
        documento: String;
        nombre: String;
        apellido: String;
        sexo: String;
        fechaNacimiento: Date;
    };
    organizacion: {
        _id: String;
        nombre: String;
    };
    sala?: boolean;
    extras: {
        ingreso?: boolean;
        egreso?: boolean;
        idInternacion?: String;
        tipo_egreso?: String;
        idMovimiento?: string;
        prestamo?: boolean;
        devolucion?: boolean;
        edicionCama?: boolean;
        cambioDeCama?: boolean;
        desbloqueo?: boolean;
    };
    nota: String;
    prioridad?: {
        id: number;
        label: string;
        type: string;
    };
    createdAt?: Date;
    createdBy?: {
        id: String;
        nombreCompleto: String;
        nombre: String;
        apellido: String;
        username: Number;
        documento: Number;
    };
    updatedAt?: Date;
    updatedBy?: {
        id: String;
        nombreCompleto: String;
        nombre: String;
        apellido: String;
        username: Number;
        documento: Number;
    };


}

