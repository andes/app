import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-destete-ventilacion-mecanica',
    templateUrl: 'desteteVentilacionMecanica.html'
})
@RupElement('DesteteVentilacionMecanicaComponent')
export class DesteteVentilacionMecanicaComponent extends RUPComponent implements OnInit {
    public hoy = new Date();
    public fechaDestete: Date;

    ngOnInit() {
        this.fechaDestete = this.registro?.valor?.fecha || null;
    }

    changeValue() {
        this.registro.valor = { fecha : this.fechaDestete };
    }
}
