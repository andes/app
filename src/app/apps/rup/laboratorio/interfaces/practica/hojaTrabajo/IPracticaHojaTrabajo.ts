import { ObjectID } from 'bson';

export class IPracticasHojaTrabajo {
    nombre: String;
    practica:  {
        id: ObjectID,
        nombre: String,
        codigo: String,
        concepto: any
    };
}
