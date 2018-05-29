import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-CheckBoxPorRefset',
    templateUrl: 'CheckBoxPorRefset.html'
})
export class CheckBoxPorRefsetComponent extends RUPComponent implements OnInit {

    public conceptos: any[] = [];

    // Hace falta un valor único para usar como nombre de cada grupo de radiobutton
    public unique: number = new Date().getTime();

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        debugger;
        if (this.params) {
            this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                this.conceptos = resultado;
                debugger;
                console.log(this.conceptos);

            });
        }
    }

    loadConceptos($event) {
        let conceptosCheckBox = this.conceptos.map(elem => {
            return { id: elem.conceptId, nombre: elem.term, concepto: elem };
        });
        $event.callback(conceptosCheckBox);
    }
    selectRadio(concepto) {
        this.registro.valor = { concepto: concepto };
    }

}
