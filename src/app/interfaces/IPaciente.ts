import { IContacto } from './IContacto';
import { IUbicacion } from './IUbicacion';
import { IDireccion } from './IDireccion';
import { Sexo, Genero, EstadoCivil } from './../utils/enumerados';


export interface IPaciente {
    id: string;
    documento: string;
    cuil: string;
    activo: Boolean;
    estado: string;
    nombre: string;
    apellido: string;
    nombreCompleto: string;
    alias: string;
    contacto: IContacto[];
    sexo: string;
    genero: string;
    fechaNacimiento: Date; // Fecha Nacimiento
    edad: Number;
    edadReal: { valor: Number, unidad: string };
    fechaFallecimiento: Date;
    direccion: IDireccion[];
    estadoCivil: EstadoCivil;
    foto: string;
    relaciones: [{
        relacion: {
            id: string,
            nombre: string,
            opuesto: string
        };
        referencia: string;
        nombre: string;
        apellido: string;
        documento: string
    }];
    financiador: [{
        entidad: {
            id: string;
            nombre: string
        };
        activo: Boolean;
        fechaAlta: Date;
        fechaBaja: Date;
        ranking: Number;
    }];
    identificadores: [{
        entidad: string,
        valor: string
    }];
    claveBlocking: [string];
    entidadesValidadoras: [string];
    scan: string;
    reportarError: Boolean;
    notaError: string;
    carpetaEfectores?: [{
        organizacion: {
            id: string,
            nombre: string
        },
        nroCarpeta: string
    }];
    notas?: [{
        fecha: Date,
        nota: string,
        destacada: Boolean
    }];
}
