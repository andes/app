import { SnomedService } from '../../../../services/term/snomed.service';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { Plex } from '@andes/plex';

@Component({
    selector: 'rup-procedimientoDeEnfermeria',
    templateUrl: 'procedimientoDeEnfermeria.html'
})
export class ProcedimientoDeEnfermeriaComponent extends RUPComponent implements OnInit {

    private plex: Plex;

    ngOnInit() {
        console.log('procedimiento enfermeria');
        if (!this.registro.valor) {
            this.registro.valor = {
                prestacionesRealizadas: {
                    banioAntitermico : false,
                    sondaNasogastrica: false
                },
                tiemposEmpleados: {

                }
            };
        }
    }
}
