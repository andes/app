import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { enumToArray } from '../../../utils/enums';
import { EstadosDevolucionCarpetas } from './../enums';
import { PrestamosService } from '../../../services/prestamosHC/prestamos-hc.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-devolver-hc',
    templateUrl: './devolver-hc.component.html'
})

export class DevolverHcComponent implements OnInit {
    @Output() cancelDevolverEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() carpetaDevueltaEmit: EventEmitter<any> = new EventEmitter<any>();

    devolverHC: any = {
        estado: '',
        observaciones: ''
    };
    prestamo: any;

    public estadosDevolucion = enumToArray(EstadosDevolucionCarpetas);

    constructor(
        public plex: Plex,
        public prestamosService: PrestamosService,
        public auth: Auth) {
    }

    ngOnInit() {

    }

    @Input('devolver')
    set devolver(value: any) {
        this.prestamo = value;
    }
    get devolver(): any {
        return;
    }

    save() {
        if (this.prestamo.datosDevolucion.estado !== '') {
            this.prestamo.datosPrestamo = this.prestamo.datosPrestamo;
            this.prestamo.organizacion = this.auth.organizacion;

            this.prestamosService.devolverCarpeta(this.prestamo).subscribe(carpeta => {
                this.plex.toast('success', 'La Carpeta se devolvió correctamente', 'Información', 1000);
                this.cancelDevolverEmit.emit(true);
                this.carpetaDevueltaEmit.emit();
            });
        }
    }

    cancel() {
        this.cancelDevolverEmit.emit(false);
    }
}
