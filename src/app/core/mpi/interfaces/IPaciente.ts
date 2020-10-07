import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { IContacto } from '../../../interfaces/IContacto';
import { IDireccion } from './IDireccion';
import { EstadoCivil } from '../../../utils/enumerados';

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
    edadReal: { valor: number, unidad: string };
    fechaFallecimiento: Date;
    direccion: IDireccion[];
    estadoCivil: EstadoCivil;
    fotoId: string;
    foto: string;
    relaciones: [IPacienteRelacion];
    financiador: [{
        codigoPuco: Number,
        nombre: string,
        financiador: String,
        id: string,
        numeroAfiliado: String
    }];
    identificadores: [{
        entidad: string,
        valor: string
    }];
    claveBlocking: [string];
    entidadesValidadoras?: [string];
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
    _score?: number;
    vinculos: [string];
}
