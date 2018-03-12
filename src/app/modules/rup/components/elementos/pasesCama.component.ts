import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-pasesCama',
    templateUrl: 'pasesCama.html'
})
export class PasesCamaComponent extends RUPComponent implements OnInit {

    public pases: any[] = [];

    ngOnInit() {
        this.prestacionesService.getPasesInternacion(this.prestacion.id).subscribe(lista => {
            this.pases = lista;
        });
    }

}
