import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-solicitudPrestacionDefault',
    templateUrl: 'solicitudPrestacionDefault.html'
})
export class SolicitudPrestacionDefaultComponent extends RUPComponent implements OnInit {
    private listaPlanes: any = [];

    // public puedeAutocitar: Boolean = false;

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                solicitudPrestacion: {}
            };
            this.registro.valor.solicitudPrestacion['autocitado'] = false;
        }
    }

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            let callback = (this.registro.valor.profesionales) ? this.registro.valor.profesionales : null;
            event.callback(callback);
        }

    }
}
