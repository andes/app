import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-nota-privada',
    templateUrl: 'NotaPrivada.html'
})
@RupElement('NotaPrivadaComponent')
export class NotaPrivadaComponent extends RUPComponent implements OnInit {
    creador: any;
    lector: any;
    permisoLectura = false;

    ngOnInit() {
        if (this.soloValores) {
            // guarda documento del profesional que escribio la nota
            this.creador = this.auth.usuario.documento.toString();
            // guarda documento del profesional que está leyendo la nota
            this.lector = this.prestacion.solicitud.profesional.documento;
            if (this.creador === this.lector) {
                this.permisoLectura = true;
            }
        }
    }
}
