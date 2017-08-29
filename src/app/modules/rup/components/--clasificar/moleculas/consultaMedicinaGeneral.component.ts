import { Molecula } from './../core/molecula.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../../interfaces/IPaciente';

@Component({
    selector: 'rup-consulta-medicina-general',
    templateUrl: 'consultaMedicinaGeneral.html'
})
export class ConsultaMedicinaGeneralComponent extends Molecula {
}
