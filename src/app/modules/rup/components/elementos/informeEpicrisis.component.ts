import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-InformeEpicrisisComponent',
    templateUrl: 'informeEpicrisis.html'
})

export class InformeEpicrisisComponent extends RUPComponent implements OnInit {
    public pautasDeAlarma: any[] = [];
    public dietaDeAlta: any[] = [];

    ngOnInit() {
        let refset = '439401001';

        this.snomedService.getQuery({ expression: refset }).subscribe(resultado => {
            this.pautasDeAlarma = resultado;
            this.dietaDeAlta = resultado;
        });
        if (!this.registro.valor) {
            this.registro.valor = {
                resumen: null
            };
            // Reveer todo el componente... @Fer
        }
    }

    // loadConceptos($event) {
    //     let conceptosSelect = this.conceptos.map(elem => {
    //         return { id: elem.conceptId, nombre: elem.term, concepto: elem };
    //     });
    //     $event.callback(conceptosSelect);
    // }


}
