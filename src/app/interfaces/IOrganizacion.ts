import { ISnomedConcept } from './../modules/rup/interfaces/snomed-concept.interface';
import { ITipoEstablecimiento } from './ITipoEstablecimiento';
import { IUbicacion } from './IUbicacion';
import { IContacto } from './IContacto';
import { IDireccion } from './IDireccion';
import { tipoComunicacion } from './../utils/enumerados';

// export enum tipoCom {"Teléfono Fijo", "Teléfono Celular", "email"};

export interface ISectores {
    tipoSector: ISnomedConcept;
    unidadConcept?: ISnomedConcept;
    nombre: String;
    hijos?:  ISectores [];
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
}
