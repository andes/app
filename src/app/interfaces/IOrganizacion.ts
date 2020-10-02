import { ISnomedConcept } from './../modules/rup/interfaces/snomed-concept.interface';
import { ITipoEstablecimiento } from './ITipoEstablecimiento';
import { IUbicacion } from './IUbicacion';
import { IContacto } from './IContacto';
import { IDireccion } from '../core/mpi/interfaces/IDireccion';
import { tipoComunicacion } from './../utils/enumerados';
import { ITipoPrestacion } from './ITipoPrestacion';

// export enum tipoCom {"Teléfono Fijo", "Teléfono Celular", "email"};

export interface ISectores {
    id?: string;
    tipoSector: ISnomedConcept;
    unidadConcept?: ISnomedConcept;
    nombre: String;
    hijos?: ISectores[];
}

export interface IOrganizacion {
    id: string;
    codigo: {
        sisa: String,
        cuie: String,
        remediar: String
    };
    nombre: String;
    tipoEstablecimiento: ITipoEstablecimiento;
    // direccion
    direccion: IDireccion;
    // contacto
    contacto: [IContacto];

    edificio: [{
        id: String,
        descripcion: String,
        contacto: IContacto,
        direccion: IDireccion,
    }];
    nivelComplejidad: Number;
    activo: Boolean;
    fechaAlta: Date;
    fechaBaja: Date;
    servicios: [ISnomedConcept];
    mapaSectores: ISectores[];
    unidadesOrganizativas: [ISnomedConcept];
    configuraciones: any;
    /**
     * "prestaciones" traidas de sisa. Se muestran en la app mobile
     * @type {[{ idSisa: number, nombre: string }]}
     * @memberof IOrganizacion
     */
    ofertaPrestacional?: [{ _id: string, prestacion: ITipoPrestacion, detalle: string }];
    /**
     * Indica si debe mostrarse en los mapas. Por defecto se muestra en los hospitales, centro de salud, punto sanitario
     * @type {boolean}
     * @memberof IOrganizacion
     */
    showMapa?: boolean;
    aceptaDerivacion?: boolean;
    esCOM?: boolean;
}
