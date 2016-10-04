import { IDireccion } from './IDireccion';

export declare enum Sexo {
   "femenino", "masculino", "otro"
}

declare enum Genero {
   "femenino", "masculino", "otro"
}

declare enum EstadoCivil {
   "casado", "separado", "divorciado", "viudo", "soltero", "otro"
}

export interface IPaciente{
    documento: String,
    activo: Boolean,
    estado: String,
    nombre: String,
    apellido: String,
    alias: String,
    contacto: [{
        tipo: String,
        valor: String,
        ranking: Number,
        ultimaActualizacion: Date,
        activo: Boolean
    }],
    sexo: Sexo,
    genero: Genero,
    fechaNacimiento: Date, // Fecha Nacimiento
    fechaFallecimiento: Date,
    direccion: [{
        valor: String,
        codigoPostal: String,
        ubicacion: IDireccion,
        ranking: Number,
        geoReferencia: [Number],
        ultimaActualizacion: Date,
        activo: Boolean
    }],
    estadoCivil: EstadoCivil,
    foto: String,
    tutor: [{
        relacion: String,
        referencia: Number,
    }],
    financiador: [{ //obrasocial, plan sumar 
        id: String,
        nombre: String,
        activo: Boolean,
        fechaAlta: Date,
        fechaBaja: Date,
        ranking: Number,
    }]
}