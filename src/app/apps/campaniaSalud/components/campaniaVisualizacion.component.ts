import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CampaniaSaludService } from '../services/campaniaSalud.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'campaniaSaludVisualizacion',
    templateUrl: 'campaniaVisualizacion.html',
    styleUrls: ['campaniaVisualizacion.scss']
})
export class CampaniaVisualizacionComponent implements OnInit {
    @Input() campania: ICampaniaSalud;
    @Output() modificarOutput = new EventEmitter();
    imagen: SafeHtml;
    constructor(public campaniaSaludService: CampaniaSaludService, public sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.imagen = this.sanitizer.bypassSecurityTrustHtml(this.campania.imagen);
    }
    /**
     * Notifica al componente padre que se seleccionó la opción de modificar la campaña seleccionada
     *
     * @memberof CampaniaVisualizacionComponent
     */
    modificar() {
        this.modificarOutput.emit();
    }
}
