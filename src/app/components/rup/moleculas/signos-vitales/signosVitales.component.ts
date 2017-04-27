import { Molecula } from './../../core/molecula.component';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
@Component({
    selector: 'rup-signos-vitales',
    templateUrl: 'signosVitales.html'
})
export class SignosVitalesComponent  extends Molecula{
}