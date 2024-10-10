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
    obraSocial?: IObraSocial;
    telefono?: string;
}

export interface IPacienteBasico {
    id: string;
    nombre: string;
    apellido: string;
    alias: string;
    documento: string;
    numeroIdentificacion: string;
    estado: string;
    sexo: string;
    genero: string;
    fechaNacimiento: Date;
    obraSocial?: IObraSocial;
    telefono?: string;
    direccion?: string;
    carpetaEfectores?: [{
        organizacion: {
            id: string;
            nombre: string;
        };
        nroCarpeta: string;
    }];
}

export type Optional = 'obraSocial' | 'telefono' | 'direccion' | 'carpetaEfectores';

/**
 * @export
 * @param {IPaciente} pac Corresponde al paciente completo que responde a la interfaz IPaciente
 * @param {Optional} extras Son los atributos opcionales de IPaciente que se quieren guardar. Si no se incluyen
 * en 'extras' no persisten.
 *
 * IMPORTANTE!! Si se agrega o modifica algún elemento de las interfaces, también debe realizarse la modificación en
 * el subesquema de paciente de la API a modo de mantener la información consistente.
 *
 * @return {*}  {IPacienteBasico}
 */
export function pacienteToBasico(pac: IPaciente, extras?: Optional[]): IPacienteBasico {
    if (!pac) {
        return;
    }
    const response: IPacienteBasico = {
        id: undefined,
        nombre: undefined,
        apellido: undefined,
        alias: undefined,
        documento: undefined,
        numeroIdentificacion: undefined,
        estado: undefined,
        sexo: undefined,
        genero: undefined,
        fechaNacimiento: undefined
    };
    Object.keys(response).map(key => response[key] = pac[key]);

    extras?.map(field => {
        if (field === 'direccion') {
            response[field] = pac.direccion[0]?.valor?.slice();
        } else {
            response[field as string] = pac[field];
        }
    });

    return response;
}
