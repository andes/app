import { IContacto } from './IContacto';
import { IUbicacion } from './IUbicacion';
import { IDireccion } from './IDireccion';
import { Sexo, Genero, EstadoCivil } from './../utils/enumerados';


export interface IPaciente {
    id: String;
    documento: String;
    activo: Boolean;
    estado: String;
    nombre: String;
    apellido: String;
    nombreCompleto: String;
    alias: String;
    contacto: IContacto[];
    sexo: String;
    genero: String;
    fechaNacimiento: Date; // Fecha Nacimiento
    edad: Number;
    edadReal: { valor: Number, unidad: String };
    fechaFallecimiento: Date;
    direccion: IDireccion[];
    estadoCivil: EstadoCivil;
    foto: String;
    relaciones: [{
        relacion: {
            id: String,
            nombre: String,
            opuesto: String
        };
        referencia: String;
        nombre: String;
        apellido: String;
        documento: String
    }];
    financiador: [{
        entidad: {
            id: String;
            nombre: String
        };
        activo: Boolean;
        fechaAlta: Date;
        fechaBaja: Date;
        ranking: Number;
    }];
    identificadores: [{
        entidad: String,
        valor: String
    }];
    claveBlocking: [String];
    entidadesValidadoras: [String];
    scan: String;
    reportarError: Boolean;
    notaError: String;
    carpetaEfectores?: [{
        organizacion: {
            id: String,
            nombre: String
        },
        nroCarpeta: String
    }];
    notas?: [{
        fecha: Date,
        nota: String,
        destacada: Boolean
    }];
}
