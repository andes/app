import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';
import { ISnapshot } from './ISnapshot';

export interface IInconsistencia {
    _id: string;
    source: ISnapshot;
    target: ISnapshot;
}
