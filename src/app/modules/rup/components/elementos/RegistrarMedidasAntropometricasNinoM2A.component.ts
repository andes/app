import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-registrar-medidas-antropometricas-m2a',
    templateUrl: 'RegistrarMedidasAntropometricasNinoM2A.html'
})
@RupElement('RegistrarMedidasAntropometricasNinoM2AComponent')
export class RegistrarMedidasAntropometricasNinoM2AComponent extends RUPComponent implements OnInit {


    ngOnInit() {

    }

}
