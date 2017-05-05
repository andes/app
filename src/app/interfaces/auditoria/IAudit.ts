import { IUbicacion } from './IUbicacion';
import { IDireccion } from './IDireccion';
import { Sexo, Genero, EstadoCivil } from './../utils/enumerados';


export interface IAudit{
    paciente1: {
        idPaciente: Number,
        documento: String,
        estado: String,
        nombre: String,
        apellido: String,
        contacto: [{
            tipo:String,
            valor: String,
            ranking: Number, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: Date,
            activo: Boolean
        }],
        direccion: [{
            valor: String,
            codigoPostal: String,
            ubicacion: IUbicacion,
            ranking: Number,
            geoReferencia:[Number],
            ultimaActualizacion: Date,
            activo: Boolean
        }],
       sexo: Sexo,
        genero: Genero, // identidad autopercibida
        fechaNacimiento: Date, // Fecha Nacimiento
        estadoCivil: EstadoCivil,
        claveSN: String
    },
    paciente2: {
       idPaciente: Number,
        documento: String,
        estado: String,
        nombre: String,
        apellido: String,
        contacto: [{
            tipo:String,
            valor: String,
            ranking: Number, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: Date,
            activo: Boolean
        }],
        direccion: [{
            valor: String,
            codigoPostal: String,
            ubicacion: IUbicacion,
            ranking: Number,
            geoReferencia:[Number],
            ultimaActualizacion: Date,
            activo: Boolean
        }],
       sexo: Sexo,
        genero: Genero, // identidad autopercibida
        fechaNacimiento: Date, // Fecha Nacimiento
        estadoCivil: EstadoCivil,
        claveSN: String
    },
    match:Number
};