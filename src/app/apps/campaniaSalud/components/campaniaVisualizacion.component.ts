import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CampaniaSaludService } from '../services/campaniaSalud.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'campaniaSaludVisualizacion',
    templateUrl: 'campaniaVisualizacion.html'
})
export class CampaniaVisualizacionComponent {
    @Input()
    get campania(): ICampaniaSalud {
        return this.campaniaVis;
    }
    set campania(value: ICampaniaSalud) {
        this.campaniaVis = value;
        this.imagen = this.sanitizer.bypassSecurityTrustHtml(this.campaniaVis.imagen);
    }
    @Output() modificarOutput = new EventEmitter();
    imagen: SafeHtml;
    campaniaVis: ICampaniaSalud;
    constructor(public campaniaSaludService: CampaniaSaludService, public sanitizer: DomSanitizer) { }

    /**
     * Notifica al componente padre que se seleccionó la opción de modificar la campaña seleccionada
     *
     * @memberof CampaniaVisualizacionComponent
     */
    modificar() {
        this.modificarOutput.emit();
    }
}
