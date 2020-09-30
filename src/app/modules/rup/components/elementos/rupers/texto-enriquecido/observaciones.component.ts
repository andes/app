import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RUPComponent } from '../../../core/rup.component';
import { RupElement } from '../..';
import { PlexTextToolBar } from '@andes/plex';

/**
 * Texto enriquecido del tipo de observaciones, motivos, indicaciones, etc
 * Params:
 *
 * 1. required: Es obligatorio cargar valor
 * 2. titulo: Label del plex-text
 * 3. placeholder: placeholder a mostar cuando el texto esta vacío
 */



@Component({
    selector: 'rup-observaciones',
    templateUrl: 'observaciones.html'
})
@RupElement('ObservacionesComponent')
export class ObservacionesComponent extends RUPComponent implements OnInit, AfterViewInit {
    seleccionado: any;
    suscriptionBuscador: any;

    // Se usa por un bug en el quill-editor al ser cargado dinamicamente.
    afterInit = false;

    fullscreen = false;

    public qlToolbar: PlexTextToolBar[] = [{
        name: 'fullscreen',
        handler: () => {
            this.fullscreen = true;
        }
    }];

    onClose() {
        this.fullscreen = false;
    }

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
        }
    }

    onCloseFullscreen(valor: string) {
        this.registro.valor = valor;
        this.fullscreen = false;
    }
}
