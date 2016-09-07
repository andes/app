import { IDomicilio } from './IDomicilio';
import { ITipoEstablecimiento } from './ITipoEstablecimiento';

export interface IEstablecimiento {
    _id: string;
    nombre: String;
    descripcion: String;
    nivelComplejidad: Number;
    codigo:{
       sisa: Number,
       cuie: String,
       remediar: String
    };
   domicilio: IDomicilio;
   tipoEstablecimiento: ITipoEstablecimiento;
   habilitado: Boolean;
   fechaAlta: Date;
   fechaBaja: Date;
}