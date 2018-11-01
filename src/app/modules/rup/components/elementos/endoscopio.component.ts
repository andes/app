import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';

@Component({
    selector: 'rup-endoscopio',
    templateUrl: 'endoscopio.html'
})

export class EndoscopioComponent extends RUPComponent implements OnInit {

    public options;

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = null;
        }
        this.options = [
            { id: 'Endoscopio OLYMPUS CF-Q150-L | Torre CV-150', label: 'Endoscopio OLYMPUS CF-Q150-L | Torre CV-150' },
            { id: 'Endoscopio OLYMPUS CF-Q150-L | Torre EVIS EXERA II CV-180', label: 'Endoscopio OLYMPUS CF-Q150-L | Torre EVIS EXERA II CV-180' },
            { id: 'Endoscopio OLYMPUS CF-H180AL | Torre EVIS EXERA II CV-180', label: 'Endoscopio OLYMPUS CF-H180AL | Torre EVIS EXERA II CV-180' },
            { id: 'Endoscopio Pentax EC-380LKp', label: 'Endoscopio Pentax EC-380LKp' },
        ];
    }

}
