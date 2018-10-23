import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';

@Component({
    selector: 'rup-anestesia',
    templateUrl: 'anestesia.html'
})

export class AnestesiaComponent extends RUPComponent implements OnInit {

    public options;

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = null;
        }
        this.options = [
            { id: 'Ninguna', label: 'Ninguna' },
            { id: 'Por anestesista', label: 'Por anestesista' },
            { id: 'Por endoscopista', label: 'Por endoscopista' },
            { id: 'Otro', label: 'Otro' },
        ];
    }

}
