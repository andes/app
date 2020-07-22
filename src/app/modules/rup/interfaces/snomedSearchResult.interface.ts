import { ISnomedConcept } from './snomed-concept.interface';
export interface ISnomedSearchResult {
    todos?: any[];
    misFrecuentes: ISnomedConcept[];
    sugeridos: ISnomedConcept[];
    buscadorBasico: ISnomedConcept[];
    frecuentesTP: any[];
    nomnbre?: any;
}
