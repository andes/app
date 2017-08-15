import { Molecula } from './../core/molecula.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../../interfaces/IPaciente';

@Component({
    selector: 'rup-prescripcion-medicamento',
    templateUrl: 'prescripcionMedicamento.html'
})
export class PrescripcionMedicamentoComponent extends Molecula {
}
