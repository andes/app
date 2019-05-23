import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-filtradoGlomerular',
    templateUrl: 'filtradoGlomerular.html'
})
@RupElement('FiltradoGlomerularComponent')
export class FiltradoGlomerularComponent extends RUPComponent implements OnInit {
    ngOnInit() {

    }
}
