import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'in-indicacion-detalle',
    templateUrl: './indicacion-detalle.component.html',
    styles: [`
        .light {
            background-color: #003a51;
            padding: 1em 0.5em;
            margin: 3px 0;
        }
        .dark {
            background-color: #003449;
            padding: 1em 0.5em;
            margin: 3px 0;
        }
    `]
})
export class IndicacionDetalleComponent implements OnChanges {
    init = false;
    @Input() indicacion;
    diasSuministro;

    public observaciones: string;

    ngOnChanges() {
        if (this.indicacion.valor.solicitudPrestacion) {
            this.observaciones = this.indicacion.valor.solicitudPrestacion.indicaciones;
        } else {
            this.observaciones = this.indicacion.valor.indicaciones;
        }

        this.diasSuministro = moment().diff(moment(this.indicacion.fechaInicio), 'days');

        // Por como esta diseñado el rup component no acepta un update de Inputs.
        this.init = false;
        setTimeout(() => this.init = true, 1);
    }

}
