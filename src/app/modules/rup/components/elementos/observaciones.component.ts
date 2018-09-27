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


                    // Estamos en la sección que tiene el foco actual?
                    if (this.seleccionado && this.registro.concepto.conceptId === this.seleccionado.conceptos.conceptId) {
                        this.plex.toast('danger', 'No se pueden agregar conceptos a esta sección', 'Acción no permitida');
                        this.suscriptionBuscador.unsubscribe();
                        this.suscriptionSeccion.unsubscribe();
                        return false;


                        // if (data && data.concepto) {
                        //     // Se limpia el notificador desde buscador (avisa que un concepto se quiere agregar)
                        // }
                        // // Se limpia el concepto agregado (viene desde el buscador)
                        // if (this.suscriptionConcepto && !this.suscriptionConcepto.closed) {
                        //     this.suscriptionConcepto.unsubscribe();
                        // } else {
                        //     this.suscriptionConcepto.unsubscribe();
                        // }
                    }
                });
            });

        }
    }
}
