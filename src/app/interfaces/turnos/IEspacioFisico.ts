import { tipoComunicacion } from './../../utils/enumerados';
import { IUbicacion } from './../IUbicacion';
export interface IEspacioFisico {
    id: string,
    nombre: String,
    descripcion: String,
    edificio: {
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
        }
    }, 
    detalle: String,
    activo: Boolean
}