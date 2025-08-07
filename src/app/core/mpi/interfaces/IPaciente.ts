import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { IContacto } from '../../../interfaces/IContacto';
import { IDireccion } from './IDireccion';
import { EstadoCivil } from '../../../utils/enumerados';
import { IUbicacion } from '../../../interfaces/IUbicacion';
import { IObraSocial } from '../../../../../src/app/interfaces/IObraSocial';
import { ICreatedBy } from 'src/app/interfaces/ICreatedBy';

export interface IPaciente {
    id: string;
    documento: string;
    cuil: string;
    activo: boolean;
    estado: string;
    nombre: string;
    apellido: string;
    nombreCompleto: string;
    alias: string;
    contacto: IContacto[];
    sexo: string;
    genero: string;
    tipoIdentificacion: string;
    numeroIdentificacion: string;
    fechaNacimiento: Date; // Fecha Nacimiento
    edad: number;
    edadReal: { valor: number; unidad: string };
    fechaFallecimiento: Date;
    direccion: IDireccion[];
    lugarNacimiento?: IUbicacion;
    estadoCivil: EstadoCivil;
    fotoId: string;
    foto: string;
    createdBy: ICreatedBy;
    relaciones: [IPacienteRelacion];

    financiador: [{
        codigoPuco: Number;
        nombre: string;
        financiador: string;
        id: string;
        numeroAfiliado: string;
    }];
    identificadores: [{
        entidad: string;
        valor: string;
    }];
    claveBlocking: [string];
    entidadesValidadoras?: [string];
    scan: string;
    reportarError: Boolean;
    nombreCorrectoReportado: String;
    apellidoCorrectoReportado: String;
    notaError: string;
    carpetaEfectores?: [{
        organizacion: {
            id: string;
            nombre: string;
        };
        nroCarpeta: string;
    }];
    notas?: [{
        fecha: Date;
        nota: string;
        destacada: Boolean;
    }];
    _score?: number;
    vinculos: [string];
    documentos: {
        fecha: Date;
        tipo: {
            id: string;
            label: string;
        };
        archivos: {
            id: string;
            ext: string;
        }[];
    }[];
    idPacientePrincipal?: string;
}

export interface IPacienteBasico {
    id: string;
    nombre: string;
    apellido: string;
    alias: string;
    documento: string;
    numeroIdentificacion: string;
    sexo: string;
    genero: string;
    fechaNacimiento: Date;
    obraSocial?: IObraSocial;
    telefono?: string;
    carpetaEfectores?: [{
        organizacion: {
            id: string;
            nombre: string;
        };
        nroCarpeta: string;
    }];
}
