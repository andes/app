import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { enumToArray } from '../../../utils/enums';
import { EstadosDevolucionCarpetas } from './../enums';
import { PrestamosService } from '../../../services/prestamosHC/prestamos-hc.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-devolver-hc',
    templateUrl: './devolver-hc.component.html'
})

export class DevolverHcComponent implements OnInit {
    @Output() cancelDevolverEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();

    devolverHC: any = {
        estado: '',
<<<<<<< HEAD
        observacionesDevolucion: ''
    }
=======
        observaciones: ''
    };

>>>>>>> d3de0bfccc3323a76782bbc0e4ce0642608c62c9
    private _carpeta: any;
    prestamo: any;

    public estadosDevolucion = enumToArray(EstadosDevolucionCarpetas);

    ngOnInit() {

    }

    @Input('devolver')
    set devolver(value: any) {
        this.prestamo = value;
        debugger;
    }
    get devolver(): any {
        return this._carpeta;
    }

    save(event) {
        event.idAgenda = this.prestamo.datosPrestamo.agendaId.id;
        event.idTurno = this.prestamo.datosPrestamo.turno.id;
<<<<<<< HEAD
        event.tipoPrestacion = this.prestamo.datosPrestamo.turno.conceptoTurneable;
        event.profesional = this.prestamo.datosPrestamo.turno.profesionales;
        event.espacioFisico = this.prestamo.datosPrestamo.turno.espacioFisicos;
        
=======
        event.tipoPrestacion = this.prestamo.datosPrestamo.turno.conceptoTurneable[0];
        event.profesional = this.prestamo.datosPrestamo.turno.profesional[0][0];
        event.espacioFisico = this.prestamo.datosPrestamo.turno.espacioFisico;


>>>>>>> d3de0bfccc3323a76782bbc0e4ce0642608c62c9
        this.prestamosService.devolverCarpeta(event).subscribe(carpeta => {
            this._carpeta = carpeta;

            this.plex.alert('La Carpeta se devolvió correctamente');

            this.cancelDevolverEmit.emit(false);
            // this.listaCarpetaEmit.emit(this._carpeta);
        });
    }

    cancel() {
        this.cancelDevolverEmit.emit(false);
    }

    constructor(public plex: Plex, public prestamosService: PrestamosService) {

    }
}   