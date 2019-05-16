import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { Subscription } from 'rxjs/Subscription';
import { RupElement } from '.';

@Component({
    selector: 'rup-descripcion',
    templateUrl: 'descripcion.html'
})
@RupElement('DescripcionComponent')
export class DescripcionComponent extends RUPComponent implements OnInit {
    public referentSet = [];
    // suscriptionSeccion: any;
    seleccionado: any;
    suscriptionBuscador: any;
    suscriptionConcepto: Subscription;
    ngOnInit() {
        if (!this.params) {
            this.params = {};
        }
        if (this.registro.valor && this.prestacion.solicitud.tipoPrestacion.conceptId === '432678004') {
            // Si es una prestacion de indicacion para procedimiento --> disabled
            this.registro.modificar = true;
        }
        this.params.required = this.params && this.params.required ? this.params.required : false;
        this.registro.valido = true;
        // Observa cuando cambia la propiedad 'Sistolica' en otro elemento RUP
        if (!this.soloValores) {
            // this.conceptObserverService.observe(this.registro).subscribe((data) => {
            //     // No soy yo mismo
            //     if (this.registro !== data && this.registro.valor !== data.valor) {
            //         this.registro.valor = data.valor;
            //         this.emitChange(false);
            //     }
            // });

            this.suscriptionBuscador = this.prestacionesService.notifySelection.subscribe(() => {
                this.seleccionado = this.prestacionesService.getRefSetData();
                // Estamos en la sección que tiene el foco actual?
                if (this.seleccionado && this.registro.concepto.conceptId === this.seleccionado.conceptos.conceptId) {
                    this.plex.toast('danger', 'No se pueden agregar conceptos a esta sección', 'Acción no permitida');
                    return false;
                }
            });
        }
    }
}
