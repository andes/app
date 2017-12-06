import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-informe',
    templateUrl: 'informe.html'
})
export class InformesComponent extends RUPComponent implements OnInit {
    public referentSet = [];
    ngOnInit() {
        // buscamos si el hallazgo pertenece a algún referentSet
        if (this.registro.concepto && this.registro.concepto.refsetIds) {
            this.registro.concepto.refsetIds.forEach(refSet => {
                Object.keys(this.prestacionesService.refsetsIds).forEach(k => {
                    if (this.prestacionesService.refsetsIds[k] === refSet) {
                        let referencia = k.replace(/_/g, ' ');
                        this.referentSet.push(referencia);
                    }
                });
            });
        }
    }
}
