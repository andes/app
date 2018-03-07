import { Component, OnInit, Input } from '@angular/core';
import { enumToArray } from '../../../utils/enums';
import { EstadosDevolucionCarpetas } from './../enums';
import { PrestamosService } from '../../../services/prestamosHC/prestamos-hc.service';

@Component({
    selector: 'app-devolver-hc',
    templateUrl: './devolver-hc.component.html'
})

export class DevolverHcComponent implements OnInit {
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
        debugger;
    }
    get devolver(): any {
        return this._carpeta;
    }

    save(event) {
        event.idAgenda = this.prestamo.datosPrestamo.agendaId.id;
        event.idTurno = this.prestamo.datosPrestamo.turno.id;
        event.tipoPrestacion = this.prestamo.datosPrestamo.turno.conceptoTurneable;
        event.profesional = this.prestamo.datosPrestamo.turno.profesionales;
        event.espacioFisico = this.prestamo.datosPrestamo.turno.espacioFisicos;
        
        this.prestamosService.devolverCarpeta(event).subscribe(carpeta => {
            this._carpeta = carpeta;
            // this.listaCarpetaEmit.emit(this._carpeta);
        });        
    }

    cancel() {

    }

    constructor(public prestamosService: PrestamosService) {

    }
}   