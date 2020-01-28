import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { MapaCamasService } from '../../mapa-camas.service';

@Component({
    selector: 'app-informe-ingreso',
    templateUrl: './informe-ingreso.component.html',
})

export class InformeIngresoComponent implements OnInit {
    // EVENTOS
    @Input() fecha: Date;
    @Input() cama;
    @Input() camas;
    @Input() prestacion;
    @Input() detalle = false;
    @Input() edit = false;

    @Output() cancel = new EventEmitter<any>();
    @Output() cambiarFecha = new EventEmitter<any>();
    @Output() cambiarCama = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    // VARIABLES
    public capa: string;
    public informeIngreso;
    public paciente;

    constructor(
        private mapaCamasService: MapaCamasService,
    ) {
    }

    ngOnInit() {
        this.capa = this.mapaCamasService.capa;
        if (this.prestacion) {
            this.informeIngreso = this.prestacion.ejecucion.registros[0].valor.informeIngreso;
            this.paciente = this.prestacion.paciente;
        }

        if (this.cama) {
            this.paciente = this.cama.paciente;
        }
    }

    onEdit() {
        this.detalle = false;
        this.edit = true;
    }

    cambiarFechaIngreso(fecha) {
        this.cambiarFecha.emit(fecha);
    }

    cambiarSeleccionCama(selectedCama) {
        this.cambiarCama.emit(selectedCama);
    }

    refescar(accion) {
        this.refresh.emit(accion);
        this.cancelar();
    }

    cancelar() {
        if (!this.edit || !this.informeIngreso) {
            this.cancel.emit();
        } else {
            this.edit = false;
            this.detalle = true;
        }
    }
}
