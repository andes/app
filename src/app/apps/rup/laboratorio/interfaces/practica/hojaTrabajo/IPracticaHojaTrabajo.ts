import { ISnomedConcept } from './../../../../../../modules/rup/interfaces/snomed-concept.interface';
import { ObjectID } from 'bson';
// import { IPractica } from './../../../../../../interfaces/laboratorio/IPractica';

export class IPracticasHojaTrabajo {
    nombre: String;
    practica:  {
        id: ObjectID,
        nombre: String,
        codigo: String,
        concepto: any
    }
}
