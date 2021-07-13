import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'in-indicacion-detalle',
    templateUrl: './indicacion-detalle.component.html'
})
export class IndicacionDetalleComponent implements OnChanges {
    @Input() indicacion;

    public observaciones: string;

    ngOnChanges() {
        if (this.indicacion.valor.solicitudPrestacion) {
            this.observaciones = this.indicacion.valor.solicitudPrestacion.indicaciones;
        } else {
            this.observaciones = this.indicacion.valor.indicaciones;

        }
    }

}
