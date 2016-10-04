import { IDomicilio } from './IDomicilio';
import { ITipoEstablecimiento } from './ITipoEstablecimiento';

export enum tipoCom {"telefonoFijo", "telefonoCelular", "email"};

export interface IOrganizacion {
    _id: string;
    codigo:{
       sisa: String,
       cuie: String,
       remediar: String
    };
    nombre: String;
    tipoEstablecimiento: ITipoEstablecimiento;
    //telecom
    telecom: [{
        tipo: {
            type: String,
            enum: ["telefonoFijo", "telefonoCelular", "email"]
        },
        valor: String,
        ranking: Number, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
        ultimaActualizacion: Date,
        activo: Boolean
    }];
    domicilio: IDomicilio;
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
    }];
    nivelComplejidad: Number;
    activo: Boolean;
    fechaAlta: Date;
    fechaBaja: Date;
}