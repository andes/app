import { IUbicacion } from './IUbicacion';
import { IDireccion } from './IDireccion';
import { Sexo, Genero, EstadoCivil } from './../utils/enumerados';


export interface IPaciente {
    id: String;
    documento: String;
    activo: Boolean;
    estado: String;
    nombre: String;
    apellido: String;
    nombreCompleto: String;
    alias: String;
    contacto: [{
        tipo: String;
        valor: String;
        ranking: Number;
        ultimaActualizacion: Date;
        activo: Boolean
    }];
    sexo: Sexo;
    genero: Genero;
    fechaNacimiento: Date; // Fecha Nacimiento
    edad: Number;
    fechaFallecimiento: Date;
    direccion: [{
        valor: String;
        codigoPostal: String;
        ubicacion: IUbicacion;
        ranking: Number;
        geoReferencia: [Number];
        ultimaActualizacion: Date;
        activo: Boolean
    }];
    estadoCivil: EstadoCivil;
    foto: String;
    relaciones: [{
        relacion: String;
        referencia: String;
        nombre: String;
        apellido: String;
        documento: String
    }];
    financiador: [{ //obrasocial; plan sumar 
        entidad: {
            id: String;
            nombre: String
        };
        activo: Boolean;
        fechaAlta: Date;
        fechaBaja: Date;
        ranking: Number;
    }]

}

export abstract class absPaciente {

} 