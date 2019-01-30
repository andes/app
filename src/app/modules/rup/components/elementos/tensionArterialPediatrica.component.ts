import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-tension-arterial-pediatrica',
    templateUrl: '../core/rup.html'
})
@RupElement()
export class TensionArterialPediatricaComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        this.registro.valor = {
            valido: true
        };
    }
}
