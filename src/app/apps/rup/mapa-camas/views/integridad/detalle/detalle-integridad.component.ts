import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { IInconsistencia } from '../../../interfaces/IInconsistencia';
import { IntegridadService } from '../integridad.service';
import { ISnapshot } from '../../../interfaces/ISnapshot';


@Component({
    selector: 'app-detalle-integridad',
    templateUrl: 'detalle-integridad.component.html'
})
export class DetalleIntegridadComponent implements OnInit {

    // EVENTOS
    @Output() cancel = new EventEmitter<any>();

    // VARIABLES
    public inconsistencia$: Observable<IInconsistencia>;
    public accion = null;
    public tabIndex = 0;
    public cambiarUO = false;

    constructor(
        private integridadService: IntegridadService
    ) {
    }

    ngOnInit() {
        this.inconsistencia$ = this.integridadService.selectedInconsistencia;
    }

    refresh() {
        this.accion = null;
        this.integridadService.setAmbito('internacion');
        this.cancel.emit();
    }

    sector(cama: ISnapshot) {
        return cama.sectores[cama.sectores.length - 1].nombre;
    }

    cancelar() {
        this.cancel.emit();
    }

    cambiarTab(index) {
        this.tabIndex = index;
    }

    accionar(accion: string) {
        this.accion = accion;
    }

    accionDesocupar(accion) {
        if (!accion.egresar) {
            this.cambiarUO = accion.cambiarUO;
            this.accion = 'cambiarCama';
        } else {
            this.accion = accion.egresar;
        }
    }
}
