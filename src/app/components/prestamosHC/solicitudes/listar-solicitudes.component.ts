import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
// import { TurnoService } from './../../../services/turnos/turno.service';
import { PrestamosService } from './../../../services/prestamosHC/prestamos-hc.service';
import { PrestarHcComponent } from './prestar-hc.component';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';

@Component({
    selector: 'app-listar-solicitudes',
    templateUrl: './listar-solicitudes.component.html'
})

export class ListarSolicitudesComponent implements OnInit {
    carpetas: any[];
    public prestacionesPermisos = [];
    today = Date.now();

    @Output() showPrestarEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() showDevolverEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() carpetaPrestadaEmit: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        this.getCarpetas();
    }

    getCarpetas() {
        this.prestamosService.getCarpetas().subscribe(carpetas => {
            this.carpetas = carpetas;
        });
        // let datosTurno = { estado: 'asignado', userName: '25334392', userDoc: '25334392' };

        // this.turnoService.getTurnos(datosTurno).subscribe(turnos => {
        //     this.turnos = turnos;
        // })

    }

    loadPrestaciones(event) {
        if (this.prestacionesPermisos && this.prestacionesPermisos[0] !== '*') {
            this.servicioPrestacion.get({
                id: this.prestacionesPermisos
            }).subscribe(event.callback);
        } else {
            this.servicioPrestacion.get({
                turneable: 1
            }).subscribe(event.callback);
        }
    }

    prestar(turno) {
        this.showDevolverEmit.emit(false);
        this.showPrestarEmit.emit(true);
        this.carpetaPrestadaEmit.emit(turno);
    }

    devolver(turno) {
        console.log('devolver carpeta')
        this.showPrestarEmit.emit(false);
        this.showDevolverEmit.emit(true);
        this.carpetaPrestadaEmit.emit(turno);
    }

    constructor(public prestamosService: PrestamosService, public servicioPrestacion: TipoPrestacionService) { }
}