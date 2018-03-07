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
    public parametros;

    public verPrestar: Boolean = false;
    public verDevolver: Boolean = false;
    public mostrarMasOpciones = false;

    @Output() showPrestarEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() showDevolverEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() carpetaPrestadaEmit: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        this.parametros = {
            fechaDesde: '',
            fechaHasta: '',
            organizacion: '',
            idTipoPrestacion: '',
            idProfesional: '',
            espacioFisico: '',
            estado: ''
        };

        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }

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
                delete this.filters['idTipoPrestaciones'];
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
        debugger;
        if (filter === 'espacioFisico') {
            if (value.value !== null) {
                this.filters['idEspacioFisico'] = value.value.id;
            } else {
                this.filters['idEspacioFisico'] = '';
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

    loadEspacios(event) {

        let listaEspaciosFisicos = [];
        if (event.query) {
            let query = {
                nombre: event.query,
                organizacion: this.auth.organizacion.id
            };
            this.servicioEspacioFisico.get(query).subscribe(resultado => {
                if (this.espacioFisico) {
                    listaEspaciosFisicos = resultado ? this.espacioFisico.concat(resultado) : this.espacioFisico;
                } else {
                    listaEspaciosFisicos = resultado;
                }
                event.callback(listaEspaciosFisicos);
            });
        } else {
            event.callback(this.espacioFisico || []);
        }
    }

    refreshSelection(value, tipo) {
        debugger;
        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*' && this.tipoPrestacion.length === 0) {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }
        if (tipo === 'fechaDesde') {
            let fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaDesde.isValid()) {
                this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
                this.parametros['organizacion'] = this.auth.organizacion._id;
            }
        }
        if (tipo === 'fechaHasta') {
            let fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
                this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
                this.parametros['organizacion'] = this.auth.organizacion._id;
            }
        }
        if (tipo === 'prestaciones') {
            if (value.value !== null) {
                this.parametros['idTipoPrestacion'] = value.value.id;
                delete this.parametros['tipoPrestaciones'];
            } else {
                this.parametros['idTipoPrestacion'] = '';
            }
        }
        if (tipo === 'profesionales') {
            if (value.value !== null) {
                this.parametros['idProfesional'] = value.value.id;
            } else {
                this.parametros['idProfesional'] = '';
            }
        }
        if (tipo === 'espacioFisico') {
            debugger;
            if (value.value !== null) {
                this.parametros['espacioFisico'] = value.value.id;
            } else {
                this.parametros['espacioFisico'] = '';
            }
        }

        // Completo params con la info que ya tengo
        // this.getCarpetas({}, this.parametros);
    };

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

        this.verPrestar = true;
    }

    devolver(turno) {
        this.showPrestarEmit.emit(false);
        this.showDevolverEmit.emit(true);
        this.carpetaPrestadaEmit.emit(turno);

        this.verDevolver = true;
    }

    constructor(
        public prestamosService: PrestamosService,
        public servicioPrestacion: TipoPrestacionService,
        public servicioEspacioFisico: EspacioFisicoService,
        public servicioProfesional: ProfesionalService,
        public auth: Auth) {
    }
}