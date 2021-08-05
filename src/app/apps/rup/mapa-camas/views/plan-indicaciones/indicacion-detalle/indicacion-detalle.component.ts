import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'in-indicacion-detalle',
    templateUrl: './indicacion-detalle.component.html'
})
export class IndicacionDetalleComponent implements OnChanges {
    init = false;
    @Input() indicacion;

    public observaciones: string;

    ngOnChanges() {
        if (this.indicacion.valor.solicitudPrestacion) {
            this.observaciones = this.indicacion.valor.solicitudPrestacion.indicaciones;
        } else {
            this.observaciones = this.indicacion.valor.indicaciones;
        }

        // Por como esta diseñado el rup component no acepta un update de Inputs.
        this.init = false;
        setTimeout(() => this.init = true, 1);
    }

}
