import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CampaniaSaludService } from '../services/campaniaSalud.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { OnInit } from '@angular/core';
@Component({
    selector: 'campaniaSaludVisualizacion',
    templateUrl: 'campaniaVisualizacion.html'
})
export class CampaniaVisualizacionComponent implements OnInit {
    @Input()
    get campania(): ICampaniaSalud {
        return this.campaniaVis;
    }
    set campania(value: ICampaniaSalud) {
        this.campaniaVis = value;
        this.imagen = this.sanitizer.bypassSecurityTrustHtml(this.campaniaVis.imagen);
    }
    @Output() modificarOutput = new EventEmitter();
    @Output() cerrar = new EventEmitter();
    public puedeEditar: boolean;
    imagen: SafeHtml;
    campaniaVis: ICampaniaSalud;
    constructor(public campaniaSaludService: CampaniaSaludService, public sanitizer: DomSanitizer, private auth: Auth, private router: Router) { }
    ngOnInit() {
        if (!this.auth.getPermissions('campania:?').length) {
            this.router.navigate(['inicio']);
        }
        this.puedeEditar = this.auth.check('campania:crear');
    }
    /**
     * Notifica al componente padre que se seleccionó la opción de modificar la campaña seleccionada
     *
     *
     * @memberof CampaniaVisualizacionComponent
     */
    modificar() {
        this.modificarOutput.emit();
    }

    cancelar() {
        this.cerrar.emit();
    }
}
