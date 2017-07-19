import { Atomo } from './../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
//import { ProfesionalService } from '../../../services/profesional.service';
@Component({
    selector: 'rup-solicitudPrestacionDefault',
    templateUrl: 'solicitudPrestacionDefault.html'
})
export class SolicitudPrestacionDefaultComponent extends Atomo implements OnInit {

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }

    }

    quitarOrder() {
        this.data[this.elementoRUP.key].profesionales.forEach(profesional => {
            delete profesional.$order;
        });

    }
}
