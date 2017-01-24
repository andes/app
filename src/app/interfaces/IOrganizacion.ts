import { ITipoEstablecimiento } from './ITipoEstablecimiento';
import { IUbicacion } from './IUbicacion';
import { tipoComunicacion } from './../utils/enumerados';

// export enum tipoCom {"Teléfono Fijo", "Teléfono Celular", "email"};

export interface IOrganizacion {
    id: string;
    codigo: {
        sisa: String,
        cuie: String,
        remediar: String
    },
    nombre: String,
    tipoEstablecimiento: ITipoEstablecimiento,
    //telecom
   /* telecom: [{
        tipo: tipoComunicacion,
        valor: String,
        ranking: Number, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
        ultimaActualizacion: Date,
        activo: Boolean
    }],*/
    //direccion
    direccion: {
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
    },
    //contacto
    contacto: [{
        proposito: String,
        nombre: String,
        apellido: String,
        tipo: {
            type: String,
            enum: ["telefonoFijo", "telefonoCelular", "email"]
        },
        valor: String,
        activo: Boolean
    }],

    edificio: [{
        id: String,
        descripcion: String,
        telefono: {
            tipo: tipoComunicacion,
            valor: String,
            ranking: Number, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: Date,
            activo: Boolean
        },
        direccion: {
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
        },
    }],
    nivelComplejidad: Number,
    activo: Boolean,
    fechaAlta: Date,
    fechaBaja: Date
}