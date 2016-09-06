import { IEstablecimiento } from './../../interfaces/IEstablecimiento';

export class Establecimiento implements IEstablecimiento {
    id: Number;
    codigoSisa: Number;
    nombre: String;
    descripcion: String;
    complejidad: Number;
    cuie: String;
    domicilio: String;
    tipoEstablecimiento: {
        id: Number;
        nombre: String;
    }
    zona: {
        id: Number;
        nombre: String
    }


    
}