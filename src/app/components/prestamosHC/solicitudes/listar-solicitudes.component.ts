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
import { Plex } from '@andes/plex';
import * as moment from 'moment';


@Component({
    selector: 'app-listar-solicitudes',
    templateUrl: './listar-solicitudes.component.html',
    styleUrls: ['../prestamos-hc.scss']
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
    public carpetasSeleccionadas = [];
    public marcarTodas: Boolean = false;

    public filters: any = {
        organizacion: this.auth.organizacion._id
    };

    public verPrestar: Boolean = false;
    public verDevolver: Boolean = false;
    public verImprimirSolicitudes: Boolean = false;
    public mostrarMasOpciones = false;
    public sortDescending = false;
    public _listarCarpetas;

    get listaCarpetasInput(): any {
        return this._listarCarpetas;
    }

    @Input('recargar')
    set recargar(value: any) {
        if (value) {
            this.getCarpetas({}, null);
        }
    }

    get recargar(): any {
        return;
    }

    // @Output() showPrestarEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() carpetaPrestadaEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() recargarPrestamosEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() imprimirSolicitudesEmit: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        public plex: Plex,
        public prestamosService: PrestamosService,
        public servicioPrestacion: TipoPrestacionService,
        public servicioEspacioFisico: EspacioFisicoService,
        public servicioProfesional: ProfesionalService,
        public auth: Auth) {
    }

    ngOnInit() {
        this.fechaDesde = new Date();
        this.fechaHasta = new Date();
        this.filters.fechaDesde = moment(this.fechaDesde).startOf('day');
        this.filters.fechaHasta = moment(this.fechaHasta).endOf('day');
        this.getCarpetas({}, null);
    }

    getCarpetas(value, filter) {
        if (filter === 'fechaDesde') {
            let fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaDesde.isValid()) {
                this.filters['fechaDesde'] = fechaDesde;
            }
        }
        if (filter === 'fechaHasta') {
            let fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
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

        this.filters['mostrarPrestamos'] = true;

        this.prestamosService.getCarpetasSolicitud(this.filters).subscribe(carpetas => {
            this.carpetas = carpetas;
            this.sortCarpetas();
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

    estaSeleccionada(carpeta: any) {
        return this.carpetasSeleccionadas.findIndex(x => x.datosPrestamo.turno.id === carpeta.datosPrestamo.turno.id) >= 0;
    }

    switchSeleccionCarpeta(carpeta: any) {
        if (carpeta.estado !== 'Prestada') {
            if (!this.estaSeleccionada(carpeta)) {
                this.carpetasSeleccionadas.push(carpeta);
            } else {
                this.carpetasSeleccionadas.splice(this.carpetasSeleccionadas.findIndex(x => x.datosPrestamo.turno.id === carpeta.datosPrestamo.turno.id), 1);
            }
            // Si solo una carpeta es seleccionada con checkbox, se muestran el box de detalles de devolución; caso contrario, el box de detalles se ocultas
            this.carpetasSeleccionadas.length === 1 ? this.prestar(this.carpetasSeleccionadas[0]) : this.verPrestar = false;
        }
    }

    switchMarcarTodas() {
        this.marcarTodas = !this.marcarTodas;
        this.carpetasSeleccionadas = this.marcarTodas ? this.carpetas.filter(function (el) {
            return el.estado === 'En archivo';
        }) : [];
        this.verPrestar = false;
    }

    prestarCarpetas() {
        this.plex.confirm('¿Desea prestar las ' + this.carpetasSeleccionadas.length + ' carpetas seleccionadas?', 'Prestamos Carpetas').then((confirmar) => {
            if (confirmar) {
                this.carpetasSeleccionadas.forEach(carpeta => {
                    carpeta.organizacion = this.auth.organizacion;
                });
                this.prestamosService.prestarCarpetas(this.carpetasSeleccionadas).subscribe(carpeta => {
                    this.verPrestar = false;
                    this.plex.toast('success', 'Las carpetas se entregaron correctamente', 'Información', 1000);
                    this.recargarPrestamosEmit.emit(true);
                    this.getCarpetas({}, null);
                    this.marcarTodas = false;
                    this.carpetasSeleccionadas = [];
                });
            }
        });
    }

    showImprimirCarpetas() {
        this.verImprimirSolicitudes = true;
        this.imprimirSolicitudesEmit.emit(this.carpetas);
    }

    volverAListado() {
        this.verImprimirSolicitudes = false;
    }

    loadEstados(event) {
        let listaEstados = [{ nombre: 'En Archivo', valor: 'En Archivo' }, { nombre: 'Prestada', valor: 'Prestada' }];
        event.callback(listaEstados);
    }

    prestar(solicitudCarpeta) {
        if (this.carpetasSeleccionadas.length === 0) {
            this.carpetaPrestadaEmit.emit(solicitudCarpeta);
            this.carpetaSeleccionada = solicitudCarpeta;
            this.verPrestar = true;
        }
    }

    sortCarpetas() {
        let val = this.sortDescending ? -1 : 1;
        // this.carpetas.sort((a, b) => { return (parseInt(a.numero) > parseInt(b.numero)) ? val : (parseInt(b.numero) > parseInt(a.numero)) ? -val : 0; } );
        this.carpetas.sort((a, b) => { return (a.numero > b.numero) ? val : ((b.numero > a.numero) ? -val : 0); });
    }

    toogleSort() {
        this.sortDescending = !this.sortDescending;
        this.sortCarpetas();
    }

    onCancelPrestar(event) {
        this.verPrestar = false;
    }

    onCarpeta(value) {
        this.recargarPrestamosEmit.emit(true);
        this.getCarpetas({}, null);
    }
}
