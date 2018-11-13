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

    /**
     * Devuelve el nombre del sector hoja donde esta la cama. Por lo general, debería ser la habitación.
     */

    public getHabitacionName(pase) {
        let sec = pase.sectores;
        if (sec && sec.length > 0) {
            return sec[sec.length - 1].nombre;
        }
        return '';
    }

}
