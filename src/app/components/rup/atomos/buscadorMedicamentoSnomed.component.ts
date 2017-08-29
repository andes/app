import { Atomo } from './../core/atomoComponent';
import { RupComponent } from './../rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-buscar-medicamento',
    templateUrl: 'buscadorMedicamentoSnomed.html'
})

export class BuscadorMedicamentoSnomedComponent extends Atomo {

    getMedicamentos(event) {
        if (event.query) {
            let query = {
                search: event.query
            };

            this.SNOMED.getProductos(query).subscribe(event.callback);
        } else {
            let callback = (this.data[this.elementoRUP.key]) ? this.data[this.elementoRUP.key] : null;

            event.callback(callback);
        }
    }
}
