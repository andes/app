import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-observaciones',
    templateUrl: 'observaciones.html'
})
@RupElement('ObservacionesComponent')
export class ObservacionesComponent extends RUPComponent implements OnInit, AfterViewInit {
    public referentSet = [];
    // suscriptionSeccion: any;
    seleccionado: any;
    suscriptionBuscador: any;

    // Se usa por un bug en el quill-editor al ser cargado dinamicamente.
    afterInit = false;


    ngAfterViewInit() {
        setTimeout(() => {
            this.afterInit = true;
        }, 300);
    }

    ngOnInit() {
        if (!this.params) {
            this.params = {};
        }
        this.params.required = this.params && this.params.required ? this.params.required : false;
        this.params.titulo = this.params.titulo || 'Observaciones';
        this.params.placeholder = this.params.placeholder || 'Ingrese una observación';

        if (!this.registro.valor || this.registro.valor.length === 0) {
            this.afterInit = true;
        }

        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                // No soy yo mismo
                if (this.registro !== data && this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });

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
