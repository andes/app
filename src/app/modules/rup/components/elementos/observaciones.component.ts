import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'rup-observaciones',
    templateUrl: 'observaciones.html'
})
export class ObservacionesComponent extends RUPComponent implements OnInit {
    public referentSet = [];
    suscriptionSeccion: Subscription;
    seleccionado: any;
    suscriptionBuscador: any;
    suscriptionConcepto: Subscription;
    ngOnInit() {
        if (!this.params) {
            this.params = {};
        }
        this.params.required = this.params && this.params.required ? this.params.required : false;
        this.registro.valido = true;
        // Observa cuando cambia la propiedad 'Sistolica' en otro elemento RUP
        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                // No soy yo mismo
                if (this.registro !== data && this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });

            this.suscriptionBuscador = this.prestacionesService.notifySelection.subscribe(() => {

                this.suscriptionSeccion = this.prestacionesService.getRefSetData().subscribe(seleccionado => {

                    this.seleccionado = seleccionado;

                    let data = this.prestacionesService.getData();
                    // Estamos en la sección que tiene el foco actual?
                    if (this.seleccionado && this.registro.concepto.conceptId === this.seleccionado.conceptos.conceptId) {
                        console.log('data', data);
                        if (data && data.concepto && data.concepto !== null) {
                            this.plex.toast('danger', 'No se pueden agregar conceptos a esta sección', 'Acción no permitida');
                            this.suscriptionBuscador.unsubscribe();
                            this.prestacionesService.clearData();
                            data.concepto = null;
                            // this.suscriptionSeccion.unsubscribe();
                            return false;
                        }
                    }
                });
            });

        }
    }
}
