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
        observacionesDevolucion: ''
    }
    private _carpeta: any;
    prestamo: any;

    public estadosDevolucion = enumToArray(EstadosDevolucionCarpetas);

    ngOnInit() {

    }

    @Input('devolver')
    set devolver(value: any) {
        this.prestamo = value;
    }
    get devolver(): any {
        return this._carpeta;
    }

    save(event) {
        if(event.estado !== '') {
            event.idAgenda = this.prestamo.datosPrestamo.agendaId;
            event.idTurno = this.prestamo.datosPrestamo.turno.id;
            event.tipoPrestaciones = this.prestamo.datosPrestamo.turno.tipoPrestaciones;
            event.profesionales = this.prestamo.datosPrestamo.turno.profesionales;
            event.espacioFisico = this.prestamo.datosPrestamo.turno.espacioFisicos;
            event.organizacion = this.auth.organizacion;
            
            this.prestamosService.devolverCarpeta(event).subscribe(carpeta => {
                this._carpeta = carpeta;
                this.plex.alert('La Carpeta se devolvió correctamente');
                this.cancelDevolverEmit.emit(true);
                this.carpetaDevueltaEmit.emit(this._carpeta);
            });
        }
    }

    cancel() {
        this.cancelDevolverEmit.emit(false);
    }

    constructor(public plex: Plex, public prestamosService: PrestamosService, public auth: Auth) {

    }
}