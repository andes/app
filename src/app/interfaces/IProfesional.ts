import { IUbicacion } from './IUbicacion';
import { IMatricula } from './IMatricula';
import { Sexo, Genero, EstadoCivil, tipoComunicacion } from './../utils/enumerados';

export interface IProfesional {
    id: String;
    documento: String;
    activo: Boolean;
    habilitado: boolean;
    nombre: String;
    apellido: String;
    contacto: [{
        tipo: tipoComunicacion;
        valor: String;
        ranking: Number; // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
        ultimaActualizacion: Date;
        activo: Boolean;
    }];
    sexo: Sexo;
    genero: Genero; // identidad autopercibida
    fechaNacimiento: Date; // Fecha Nacimiento
    fechaFallecimiento: Date;
    direccion: [{
        valor: String;
        codigoPostal: String;
        ubicacion: IUbicacion;
        ranking: Number;
        geoReferencia: {
            type: [Number]; // [<longitude>, <latitude>]
            index: '2d'; // create the geospatial index
        };
        ultimaActualizacion: Date;
        activo: Boolean;
    }];
    estadoCivil: EstadoCivil;
    foto: String;
    rol: String; // Ejemplo Jefe de Terapia intensiva
    especialidad: [{ // El listado de sus especialidades
        id: string;
        nombre: String;
    }];
    matriculas: [{
        numero: Number;
        descripcion: String;
        fechaInicio: Date;
        fechaVencimiento: Date;
        activo: Boolean;
    }];
    formacionGrado: [{
        exportadoSisa?: Boolean;
        profesion: {
            nombre: string;
            codigo: number;
            tipoDeFormacion: String;
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
            matriculaNumero: Number;
            libro: String;
            folio: String;
            inicio: Date;
            baja: {
                motivo: String;
                fecha: any;
            };
            notificacionVencimiento: Boolean;
            fin: Date;
            revalidacionNumero: Number;
        }];
        matriculado: boolean;
        fechaDeInscripcion?: Date;
    }];
    profesionalMatriculado: Boolean;
    profesionExterna: any;
    matriculaExterna: String;
}
