import { ISnomedConcept } from './snomed-concept.interface';
export interface ISnomedSearchResult {
    todos?: any[];
    misFrecuentes: ISnomedConcept[];
    sugeridos: ISnomedConcept[];
    busquedaGuiada: any[];
    buscadorBasico: ISnomedConcept[];
    nomnbre?: any;
}
