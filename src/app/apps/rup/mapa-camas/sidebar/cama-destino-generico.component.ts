import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-cama-destino-generico',
    templateUrl: 'cama-destino-generico.component.html',
})

export class CamaDestinoGenericoComponent implements OnInit {
    @Input() fecha: Date;
    @Input() selectedCama: any;
    @Input() camas: any;
    @Input() destino: any;

    @Output() cancel = new EventEmitter<any>();
    @Output() cambiarFecha = new EventEmitter<any>();
    @Output() cambiarCama = new EventEmitter<any>();

    public titulo: string;
    public fechaValida = true;

    constructor(
        public auth: Auth,
        private router: Router,
    ) { }

    ngOnInit() {
        this.titulo = 'CAMBIAR A ' + this.destino.toUpperCase();
    }

    cancelar() {
        this.cancel.emit();
    }

    cambiarFechaIngreso(fecha) {
        if (fecha <= moment().toDate()) {
            this.fechaValida = true;
            this.cambiarFecha.emit(fecha);
        } else {
            this.fechaValida = false;
        }
    }

    cambiarSeleccionCama() {
        this.cambiarCama.emit(this.selectedCama);
    }
}
