import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';

@Component({
    selector: 'app-informe-ingreso',
    templateUrl: './informe-ingreso.component.html',
})

export class InformeIngresoComponent implements OnInit {
    // EVENTOS
    @Input() capa;
    @Input() fecha: Date;
    @Input() cama: any;
    @Input() camas: any;
    @Input() detalle = false;
    @Input() edit = false;

    @Output() cancel = new EventEmitter<any>();
    @Output() cambiarFecha = new EventEmitter<any>();
    @Output() cambiarCama = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    // VARIABLES
    public prestacion;
    public informeIngreso;

    constructor(
        private prestacionesService: PrestacionesService
    ) { }

    ngOnInit() {
        this.getPrestacion();
    }

    onEdit() {
        this.detalle = false;
        this.edit = true;
    }

    getPrestacion() {
        if (this.cama.idInternacion) {
            this.prestacionesService.getById(this.cama.idInternacion).subscribe(prestacion => {
                this.prestacion = prestacion;
                this.informeIngreso = prestacion.ejecucion.registros[0].valor.informeIngreso;
            });
        }
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
