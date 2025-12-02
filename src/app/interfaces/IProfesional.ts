import { IUbicacion } from './IUbicacion';
import { IMatricula } from './IMatricula';
import { Sexo, Genero, EstadoCivil, tipoComunicacion } from './../utils/enumerados';

export interface IProfesional {
    id: string;
    documento: string;
    activo: boolean;
    habilitado: boolean;
    nombre: string;
    apellido: string;
    contacto: [{
        tipo: tipoComunicacion;
        valor: string;
        ranking: number; // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
        ultimaActualizacion: Date;
        activo: boolean;
    }];
    sexo: Sexo;
    genero: Genero; // identidad autopercibida
    fechaNacimiento: Date; // Fecha Nacimiento
    fechaFallecimiento: Date;
    direccion: [{
        valor: string;
        codigoPostal: string;
        ubicacion: IUbicacion;
        ranking: number;
        geoReferencia: {
            type: [number]; // [<longitude>, <latitude>]
            index: '2d'; // create the geospatial index
        };
        ultimaActualizacion: Date;
        activo: boolean;
    }];
    estadoCivil: EstadoCivil;
    foto: string;
    rol: string; // Ejemplo Jefe de Terapia intensiva
    especialidad: [{ // El listado de sus especialidades
        id: string;
        nombre: string;
    }];
    matriculas: [{
        numero: number;
        descripcion: string;
        fechaInicio: Date;
        fechaVencimiento: Date;
        activo: boolean;
    }];
    formacionGrado: [{
        exportadoSisa?: boolean;
        profesion: {
            nombre: string;
            codigo: number;
            tipoDeFormacion: string;
        };
        entidadFormadora: {
            nombre: string;
            codigo: number;
        };
        titulo: string;
        fechaEgreso: Date;
        fechaTitulo: Date;
        renovacion: boolean;
        papelesVerificados: boolean;
        matriculacion?: [{
            matriculaNumero: number;
            libro: string;
            folio: string;
            inicio: Date;
            baja: {
                motivo: string;
                fecha: any;
            };
            notificacionVencimiento: boolean;
            fin: Date;
            revalidacionNumero: number;
        }];
        matriculado: boolean;
        fechaDeInscripcion?: Date;
    }];
    profesionalMatriculado: boolean;
    profesionExterna: any;
    matriculaExterna: string;
}
