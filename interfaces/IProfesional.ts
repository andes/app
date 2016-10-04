
 import { IUbicacion} from './IUbicacion';
 import { IMatricula} from './IMatricula';

 export interface IProfesional {
    _id: String,
    documento: String,
    activo: Boolean,
    nombre: String,
    apellido: String,
    contacto: [{
        tipo: {
            type: String,
            enum: ["telefonoFijo", "telefonoCelular", "email"]
        },
        valor: String,
        ranking: Number, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
        ultimaActualizacion: Date,
        activo: Boolean
    }],
    sexo: {
        type: String,
        enum: ["femenino", "masculino", "otro"]
    },
    genero: {
        type: String,
        enum: ["femenino", "masculino", "otro"]
    }, // identidad autopercibida
    fechaNacimiento: Date, // Fecha Nacimiento
    fechaFallecimiento: Date,
    direccion: [{
        valor: String,
        codigoPostal: String,
        ubicacion: IUbicacion,
        ranking: Number,
        geoReferencia: {
            type: [Number], // [<longitude>, <latitude>]
            index: '2d' // create the geospatial index
        },
        ultimaActualizacion: Date,
        activo: Boolean
    }],
    estadoCivil: {
        type: String,
        enum: ["casado", "separado", "divorciado", "viudo", "soltero", "otro"]
    },
    foto: String,
    rol: String, //Ejemplo Jefe de Terapia intensiva
    especialidad: [{ //El listado de sus especialidades
        id: string,
        nombre: String
    }],
    matriculas: [{
        numero: Number,
        descripcion: String,
        activo: Boolean,
        periodo: {
            inicio: Date,
            fin: Date
        },

    }]
 }