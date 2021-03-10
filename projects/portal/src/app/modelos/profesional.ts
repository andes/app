export class Profesional {
    id: Number;
    documento: String;
    activo: Boolean;
    nombre: String;
    apellido: String;
    contacto: [{
        tipo: String,
        valor: String,
        ranking: Number, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
        ultimaActualizacion: String,
        activo: Boolean
    }];
    sexo: String;
    genero: String; // identidad autopercibida
    fechaNacimiento: String; // Fecha Nacimiento
    fechaFallecimiento: String;
    direccion: [{
        valor: String,
        codigoPostal: String,
        ubicacion: String,
        ranking: Number,
        geoReferencia: {
            type: [Number], // [<longitude>, <latitude>]
            index: '2d' // create the geospatial index
        },
        ultimaActualizacion: String,
        activo: Boolean
    }];
    estadoCivil: String;
    foto: String;
    rol: String; // Ejemplo Jefe de Terapia intensiva
    especialidad: [{ // El listado de sus especialidades
        id: string,
        nombre: String
    }];
    matriculas: [{
        numero: Number,
        descripcion: String,
        fechaInicio: String,
        fechaVencimiento: String,
        activo: Boolean
    }];
    profesionalMatriculado: Boolean;
}
