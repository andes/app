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
    ambito: string;
    capa: string;
    unidadOrganizativaOriginal: ISnomedConcept;
    sectorName?: string;
    diaEstada?: number;
    sectores: ISectores[];
    jerarquiaSectores?: any[];
    nombre: String;
    tipoCama: ISnomedConcept;
    equipamiento: ISnomedConcept[];
    idCama: string;
    paciente?: {
        id: string;
        documento: string;
        numeroIdentificacion?: string;
        nombre: string;
        alias?: string;
        apellido: string;
        sexo: string;
        genero: string;
        fechaNacimiento: Date;
    };
    organizacion: {
        _id: string;
        nombre: string;
    };
    sala?: boolean;
    extras: {
        ingreso?: boolean;
        egreso?: boolean;
        idInternacion?: string;
        tipo_egreso?: string;
        idMovimiento?: string;
        prestamo?: boolean;
        devolucion?: boolean;
        edicionCama?: boolean;
        cambioDeCama?: boolean;
        desbloqueo?: boolean;
    };
    nota: string;
    prioridad?: {
        id: number;
        label: string;
        type: string;
    };
    createdAt?: Date;
    createdBy?: {
        id: string;
        nombreCompleto: string;
        nombre: string;
        apellido: string;
        username: Number;
        documento: Number;
    };
    updatedAt?: Date;
    updatedBy?: {
        id: string;
        nombreCompleto: string;
        nombre: string;
        apellido: string;
        username: Number;
        documento: Number;
    };


}

