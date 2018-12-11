import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-molecula-base',
    templateUrl: '../core/rup.html'
})
@RupElement()
export class MoleculaBaseComponent extends RUPComponent implements OnInit {

    ngOnInit() {

    }
}
