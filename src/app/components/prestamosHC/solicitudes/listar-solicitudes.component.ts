import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
    public carpetas: any[] = [];
    public prestacionesPermisos = [];
    public espacioFisico = [];
    public tipoPrestacion: any;
    public profesional: any;
    public fechaDesde: any;
    public fechaHasta: any;
    public carpetaSeleccionada: any;

    public filters = {
        organizacion: this.auth.organizacion._id
    };

    public verPrestar: Boolean = false;
    public verDevolver: Boolean = false;
    public mostrarMasOpciones = false;

    public _listarCarpetas;

    @Input('listaCarpetasInput')
    set listaCarpetasInput(value: any) {
        if (value !== undefined) {
            let index = this.carpetas.map(function(carpeta) { return carpeta.datosPrestamo.turno.id; }).indexOf(value.datosPrestamo.turno.id);
            
            this.carpetas =  this.carpetas.filter(function(el) {
                return el.datosPrestamo.turno.id !== value.datosPrestamo.turno.id;
            });
            this.carpetas.splice(index,1,value);
        }

    }
    get listaCarpetasInput(): any {
        return this._listarCarpetas;
    }

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
            }
        }
        if (filter === 'fechaHasta') {
            let fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
                this.filters['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
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

    prestar(solicitudCarpeta) {
        this.showDevolverEmit.emit(false);
        this.showPrestarEmit.emit(true);
        this.carpetaPrestadaEmit.emit(solicitudCarpeta);
        this.carpetaSeleccionada = solicitudCarpeta;
        this.verPrestar = true;
    }

    devolver(solicitudCarpeta) {
        this.showPrestarEmit.emit(false);
        this.showDevolverEmit.emit(true);
        this.carpetaPrestadaEmit.emit(solicitudCarpeta);
        this.carpetaSeleccionada = solicitudCarpeta;
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