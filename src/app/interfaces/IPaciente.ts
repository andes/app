import { IPacienteRelacion } from './../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { IContacto } from './IContacto';
import { IDireccion } from './IDireccion';
import { EstadoCivil } from './../utils/enumerados';

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
    relaciones: [IPacienteRelacion];
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
