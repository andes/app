
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
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
   */
    public observe(registro: IPrestacionRegistro): Observable<IPrestacionRegistro> {
        if (!this.observers[registro.concepto.conceptId]) {

            this.observers[registro.concepto.conceptId] = new BehaviorSubject<IPrestacionRegistro>(registro);
        }
        // Filtra para que notifique al mismo elemento que lo generó el cambio
        return this.observers[registro.concepto.conceptId].pipe(filter((value, index) => value.id !== registro.id));
        // return this.observers[registro.concepto.conceptId];
    }

    /**
   * Notifica de los cambios de un registro a todos los observers
   *
   * @param {ISnomedConcept} concepto Concepto de SNOMED
   * @param {IPrestacionRegistro} registro Registro
   */
    public notify(concepto: ISnomedConcept, registro: IPrestacionRegistro) {
        if (this.observers[concepto.conceptId]) {
            this.observers[concepto.conceptId].next(registro);
        }
    }

    /**
   * Limpia los observers para que no aparezcan valores los valores en una consulta nueva
   *
   */

    public destroy() {
        for (const conceptId in this.observers) {
            this.observers[conceptId].complete();
            this.observers[conceptId].unsubscribe();
        }
        this.observers = {};
    }

}
