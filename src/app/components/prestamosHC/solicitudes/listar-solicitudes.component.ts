import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PrestamosService } from './../../../services/prestamosHC/prestamos-hc.service';
import { PrestarHcComponent } from './prestar-hc.component';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { EspacioFisicoService } from '../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { enumToArray } from '../../../utils/enums';
import { EstadosCarpetas } from './../enums';
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
    public estadosCarpeta = enumToArray(EstadosCarpetas);
    public estado: any = this.estadosCarpeta[0];
    public carpetaSeleccionada: any;

    public filters: any = {
        organizacion: this.auth.organizacion._id
    };

    public verPrestar: Boolean = false;
    public verDevolver: Boolean = false;
    public mostrarMasOpciones = false;
    

    public _listarCarpetas;
    public showPrestar = false;
    
    get listaCarpetasInput(): any {
        return this._listarCarpetas;
    }

    @Output() showPrestarEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() showDevolverEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() carpetaPrestadaEmit: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        this.fechaDesde = new Date();
        this.fechaHasta = new Date();
        this.filters.fechaDesde = moment(this.fechaDesde).startOf('day');
        this.filters.fechaHasta = moment(this.fechaHasta).endOf('day');;
        this.getCarpetas({}, null);
    }

    getCarpetas(value, filter) {
        if (filter === 'fechaDesde') {
            let fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaDesde.isValid()) {
                // this.filters['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
                this.filters['fechaDesde'] = fechaDesde;
            }
        }
        if (filter === 'fechaHasta') {
            let fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
                // this.filters['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
                this.filters['fechaHasta'] = fechaHasta;
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

        if (filter === 'estado') {
            this.filters['estado'] = value.nombre;
        }

        this.prestamosService.getCarpetasSolicitud(this.filters).subscribe(carpetas => {
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

    loadEstados(event) {
        let listaEstados = [{nombre:'En Archivo', valor:'En Archivo'},{nombre:'Prestada', valor:'Prestada'}];
        event.callback(listaEstados);
    }

    prestar(solicitudCarpeta) {
        this.showPrestarEmit.emit(true);
        this.carpetaPrestadaEmit.emit(solicitudCarpeta);
        this.carpetaSeleccionada = solicitudCarpeta;
        this.verPrestar = true;
    }

    // devolver(solicitudCarpeta) {
    //     this.showPrestarEmit.emit(false);
    //     this.showDevolverEmit.emit(true);
    //     this.carpetaPrestadaEmit.emit(solicitudCarpeta);
    //     this.carpetaSeleccionada = solicitudCarpeta;
    //     this.verDevolver = true;
    // }

    onShowPrestar(event) {
        this.showPrestar = true;
    }

    onCancelPrestar(event) {
        this.showPrestar = event;
    }

    onCarpeta(value) {
        if (value !== undefined) {
            this.carpetas =  this.carpetas.filter(function(el) {
                return el.datosPrestamo.turno.id !== value.datosPrestamo.turno.id;
            });
        }
    }

    constructor(
        public prestamosService: PrestamosService,
        public servicioPrestacion: TipoPrestacionService,
        public servicioEspacioFisico: EspacioFisicoService,
        public servicioProfesional: ProfesionalService,
        public auth: Auth) {

    }
}