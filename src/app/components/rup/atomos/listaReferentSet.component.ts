import { Atomo } from './../core/atomoComponent';
// import { RupComponent } from './../rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'rup-ListaReferentSet',
    templateUrl: 'ListaReferentSet.html'
})

export class ListaReferentSetComponent extends Atomo implements OnInit {

    public conceptos: any[];

    /* los atomos por defecto se inicializan en null porque generalmente tienen un solo input
     * al ser este un caso de atomo medio particular que lleva muchas propiedades dentro
     * entonces inicializamos data como un objeto
     */
    ngOnInit() {

        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};

        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            // Llega un referentSetID para obtener los conceptos snomed que puede ser chequeados
            if (this.datosIngreso.referentSetId) {
                this.SNOMED.get({ refsetId: this.datosIngreso.referentSetId })
                    .subscribe(conceptos => {
                        if (conceptos) {
                            this.conceptos = conceptos;
                        }
                    });


            } else {
                this.devolverValores();
            }

        } else {
        }

    }

}

