import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PrestamosService } from './../../../services/prestamosHC/prestamos-hc.service';
import { PrestarHcComponent } from './prestar-hc.component';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { EspacioFisicoService } from '../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { Auth } from '@andes/auth';
import * as moment from 'moment';


@Component({
    selector: 'app-listar-solicitudes',
    templateUrl: './listar-solicitudes.component.html'
})

export class ListarSolicitudesComponent implements OnInit {
    public carpetas: any[];
    public prestacionesPermisos = [];
    public espacioFisico = [];
    public tipoPrestacion: any;
    public profesional: any;
    public fechaDesde: any;
    public fechaHasta: any;
    public today = Date.now();

    public filters = {};

    
    @Output() showPrestarEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() showDevolverEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() carpetaPrestadaEmit: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        this.getCarpetas({}, null);
    }

    getCarpetas(value, filter) {
        if (filter === 'fechaDesde') {
            let fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaDesde.isValid()) {
                this.filters['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
                this.filters['organizacion'] = this.auth.organizacion._id;
            }
        }
        if (filter === 'fechaHasta') {
            let fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
                this.filters['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
                this.filters['organizacion'] = this.auth.organizacion._id;
            }
        }
        if (filter === 'prestaciones') {
            if (value.value !== null) {
                this.filters['idTipoPrestacion'] = value.value.id;
                delete this.filters['tipoPrestaciones'];
            } else {
                this.filters['idTipoPrestacion'] = '';
            }
        }
        if (filter === 'profesionales') {
            if (value.value !== null) {
                this.filters['idProfesional'] = value.value.id;
            } else {
                this.filters['idProfesional'] = '';
            }
        }
        if (filter === 'espacioFisico') {
            if (value.value !== null) {
                this.filters['espacioFisico'] = value.value.id;
            } else {
                this.filters['espacioFisico'] = '';
            }
        }

        this.prestamosService.getCarpetas(this.filters).subscribe(carpetas => {
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

    loadEspaciosFisicos(event) {
    console.log('loadEspaciosFisicos', this.auth.organizacion.id);
        let query = {};
        let listaEspaciosFisicos = [];
        // if (event.query) {
            // query['nombre'] = event.query;
            query['nombre'] = '';
            query['organizacion'] = this.auth.organizacion.id;

            this.servicioEspacioFisico.get(query).subscribe(resultado => {
                event.callback(listaEspaciosFisicos);
            });
            
        // } else {
        //     event.callback(this.agenda.espacioFisico || []);
        // }
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                listaProfesionales = resultado;
                event.callback(listaProfesionales);
            });
        }
    }

    prestar(turno) {
        this.showDevolverEmit.emit(false);
        this.showPrestarEmit.emit(true);
        this.carpetaPrestadaEmit.emit(turno);
    }

    devolver(turno) {
        this.showPrestarEmit.emit(false);
        this.showDevolverEmit.emit(true);
        this.carpetaPrestadaEmit.emit(turno);
    }

    constructor(
        public prestamosService: PrestamosService, 
        public servicioPrestacion: TipoPrestacionService,
        public servicioEspacioFisico: EspacioFisicoService,
        public servicioProfesional : ProfesionalService,
        public auth: Auth) {
    }
}