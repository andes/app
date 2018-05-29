import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-lactancia',
    templateUrl: 'lactancia.html'
})
export class LactanciaComponent extends RUPComponent implements OnInit {
    public conceptos: any[] = [];

    // Hace falta un valor único para usar como nombre de cada grupo de radiobutton
    public unique: number = new Date().getTime();

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = [{ checkbox: false }];
        }
        // else {
        //     debugger;
        // }
        if (this.params) {
            this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                this.conceptos = resultado;


            });
        }
    }

    loadConceptos($event) {
        let conceptosCheckBox = this.conceptos.map(elem => {
            this.registro.valor[elem.conceptId] = { concepto: elem, checkbox: false }
            return { id: elem.conceptId, nombre: elem.term, concepto: elem };
        });
        $event.callback(conceptosCheckBox);
    }
    // estaSeleccionado(concepto: any) {
    //     return this.registro.valor.findIndex(x => x.datosPrestamo.turno.id === carpeta.datosPrestamo.turno.id) >= 0;
    // }


    selectCheckBox(concepto) {
        // debugger;
        // if (this.registro.valor[concepto.conceptId]) {
        //     this.registro.valor[concepto.conceptId].checkbox = false;
        // } else {
        //     this.registro.valor[concepto.conceptId] = { concepto: concepto, checkbox: true };

        //     // this.registro.valor.splice(this.registro.valor.findIndex(x => x.datosPrestamo.turno.id === carpeta.datosPrestamo.turno.id), 1);
        // }
        // // this.registro.valor = { checkbox: false, concepto: concepto };
    }
}
