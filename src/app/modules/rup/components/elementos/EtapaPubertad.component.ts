import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-etapa-pubertad',
    templateUrl: 'EtapaPubertad.html'
})
@RupElement('EtapaPubertadComponent')
export class EtapaPubertadComponent extends RUPComponent implements OnInit {

    sexo: any;
    ngOnInit() {
        this.sexo = this.paciente.sexo;
    }
}
