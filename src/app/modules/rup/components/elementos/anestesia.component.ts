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
            { id: 1, label: 'Ninguna' },
            { id: 2, label: 'Por anestesista' },
            { id: 3, label: 'Por endoscopista' },
            { id: 4, label: 'Otro' },
        ];
    }

}
