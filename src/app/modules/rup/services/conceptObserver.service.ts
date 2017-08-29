import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ISnomedConcept } from '../interfaces/snomed-concept.interface';
import { IPrestacionRegistro } from '../interfaces/prestacion.registro.interface';

@Injectable()
export class ConceptObserverService {
  private observers: { [concepto: string]: Subject<IPrestacionRegistro> } = {};

  /**
   * Devuelve un observable para el concepto indicado
   * 
   * @param {ISnomedConcept} concepto Concepto de SNOMED
   * @returns {Subject<any>} Observable
   * @memberof ConceptObserverService
   */
  public observe(concepto: ISnomedConcept): Subject<IPrestacionRegistro> {
    if (!this.observers[concepto.conceptId]) {
      this.observers[concepto.conceptId] = new Subject<IPrestacionRegistro>();
    };
    return this.observers[concepto.conceptId];
  }

  /**
   * Notifica de los cambios de un registro a todos los observers
   *
   * @param {ISnomedConcept} concepto Concepto de SNOMED
   * @param {IPrestacionRegistro} registro Registro
   * @memberof ConceptObserverService
   */
  public notify(concepto: ISnomedConcept, registro: IPrestacionRegistro) {
    if (this.observers[concepto.conceptId]) {
      this.observers[concepto.conceptId].next(registro);
    }
  }
};
