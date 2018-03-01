import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
// import { TurnoService } from './../../../services/turnos/turno.service';
import { PrestamosService } from './../../../services/prestamosHC/prestamos-hc.service';
import { PrestarHcComponent } from './prestar-hc.component';

@Component({
    selector: 'app-listar-solicitudes',
    templateUrl: './listar-solicitudes.component.html'
})

export class ListarSolicitudesComponent implements OnInit {
    carpetas: any[];
    today = Date.now();

    @Output() showPrestarEmit: EventEmitter<boolean> = new EventEmitter<boolean>();

    ngOnInit() {
        this.getCarpetas();
    }

    getCarpetas() {
        debugger;
        this.prestamosService.getCarpetas().subscribe(carpetas => {
            debugger;
            this.carpetas = carpetas;
        });
        // let datosTurno = { estado: 'asignado', userName: '25334392', userDoc: '25334392' };

        // this.turnoService.getTurnos(datosTurno).subscribe(turnos => {
        //     this.turnos = turnos;
        // })

    }

    prestar(turno) {
        debugger;
        this.showPrestarEmit.emit(true);
    }

    constructor(public prestamosService: PrestamosService) { }
}