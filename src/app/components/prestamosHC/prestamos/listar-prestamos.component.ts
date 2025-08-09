import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PrestamosService } from './../../../services/prestamosHC/prestamos-hc.service';
import { EspacioFisicoService } from '../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { enumToArray } from '../../../utils/enums';
import { EstadosCarpetas } from './../enums';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import moment from 'moment';


@Component({
    selector: 'app-listar-prestamos',
    templateUrl: 'listar-prestamos.component.html',
    styleUrls: ['../prestamos-hc.scss']
})

export class ListarPrestamosComponent implements OnInit {
    public carpetas: any[] = [];
    public espacioFisico = [];
    public tipoPrestacion: any;
    public profesional: any;
    public fechaDesde: any;
    public fechaHasta: any;
    public estadosCarpeta = enumToArray(EstadosCarpetas);
    public carpetaSeleccionada: any;
    public carpetasSeleccionadas = [];
    public marcarTodas = false;

    public filters: any = {
        organizacion: this.auth.organizacion.id
    };

    public verDevolver = false;
    public mostrarMasOpciones = false;
    public sortDescending = false;
    public _listarCarpetas;
    public loading = false;

    get cssLayout() {
        return { 'col-8': this.verDevolver, 'col': !this.verDevolver };
    }

    @Output() carpetaDevueltaEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() devolverCarpetaEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() recargarSolicitudesEmit: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(
        public plex: Plex,
        public prestamosService: PrestamosService,
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
        this.loading = true;

        if (filter === 'fechaDesde') {
            const fechaDesde = moment(this.fechaDesde).startOf('day');
            const _fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaDesde > _fechaHasta) {
                this.filters['fechaHasta'] = this.fechaHasta = moment(this.fechaDesde).endOf('day');
            }
            if (fechaDesde.isValid()) {
                this.filters['fechaDesde'] = fechaDesde;
            }
        }
        if (filter === 'fechaHasta') {
            const fechaHasta = moment(this.fechaHasta).endOf('day');
            const _fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaHasta < _fechaDesde) {
                this.filters['fechaDesde'] = this.fechaDesde = moment(this.fechaHasta).startOf('day');
            }
            if (fechaHasta.isValid()) {
                this.filters['fechaHasta'] = fechaHasta;
            }
        }
        if (filter === 'prestaciones') {
            if (value.value) {
                this.filters['tipoPrestacion'] = value.value.conceptId;
                delete this.filters['idTipoPrestaciones'];
            } else {
                this.filters['tipoPrestacion'] = '';
            }
        }
        if (filter === 'profesionales') {
            if (value.value) {
                this.filters['idProfesional'] = value.value.id;
            } else {
                this.filters['idProfesional'] = '';
            }
        }
        if (filter === 'espacioFisico') {
            if (value.value) {
                this.filters['idEspacioFisico'] = value.value.id;
            } else {
                this.filters['idEspacioFisico'] = '';
            }
        }
        if (filter === 'estado') {
            this.filters['estado'] = value.nombre;
        }

        this.prestamosService.getCarpetasPrestamo(this.filters).subscribe(carpetas => {
            this.carpetas = carpetas;
            this.loading = false;
        });
    }

    loadEspacios(event) {
        let listaEspaciosFisicos = [];
        if (event.query) {
            const query = {
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
            const query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                listaProfesionales = resultado;
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.espacioFisico || []);
        }
    }

    estaSeleccionada(carpeta: any) {
        return this.carpetasSeleccionadas.findIndex(x => x._id === carpeta._id) >= 0;
    }

    switchSeleccionCarpeta(carpeta: any) {
        if (!this.estaSeleccionada(carpeta)) {
            this.carpetasSeleccionadas.push(carpeta);
        } else {
            this.carpetasSeleccionadas.splice(this.carpetasSeleccionadas.findIndex(x => x._id === carpeta._id), 1);
        }
        // Si solo una carpeta es seleccionada con checkbox, se muestran el box de detalles de devolución; caso contrario, el box de detalles se ocultas
        this.carpetasSeleccionadas.length === 1 ? this.devolver(this.carpetasSeleccionadas[0]) : this.verDevolver = false;
    }

    switchMarcarTodas() {
        this.marcarTodas = !this.marcarTodas;
        this.carpetasSeleccionadas = this.marcarTodas ?
            this.carpetas.filter((el) => {
                return el.estado === 'Prestada';
            }) : [];
        this.verDevolver = false;
    }

    devolverCarpetas() {
        this.plex.confirm('¿Desea devolver las ' + this.carpetasSeleccionadas.length + ' carpetas seleccionadas?', 'Prestamos Carpetas').then((confirmar) => {
            if (confirmar) {

                this.carpetasSeleccionadas.forEach(carpeta => {
                    if (!carpeta.organizacion) {
                        carpeta.organizacion = this.auth.organizacion;
                    }
                });

                this.prestamosService.devolverCarpetas(this.carpetasSeleccionadas).subscribe(carpeta => {
                    this.verDevolver = false;
                    this.plex.toast('success', 'Las carpetas se devolvieron correctamente', 'Información', 1000);
                    this.recargarSolicitudesEmit.emit(true);
                    this.getCarpetas({}, null);
                    this.marcarTodas = false;
                    this.carpetasSeleccionadas = [];
                });
            }
        });
    }

    loadEstados(event) {
        const listaEstados = [{ nombre: 'En Archivo', valor: 'En Archivo' }, { nombre: 'Prestada', valor: 'Prestada' }];
        event.callback(listaEstados);
    }

    devolver(carpeta) {
        if (this.carpetasSeleccionadas.length === 0) {
            this.devolverCarpetaEmit.emit(carpeta);
        }
    }

    sortCarpetas() { // se divide this.carpetas en letras y en numeros para hacer el sort correspondiente
        const val = this.sortDescending ? -1 : 1;
        const carpetas_numeros = this.carpetas.filter(x => !isNaN(x._id));
        const carpetas_letras = this.carpetas.filter(x => isNaN(x._id));
        carpetas_letras.sort((a, b) => {
            return (a._id > b._id) ? val : (b._id > a._id) ? -val : 0;
        });
        carpetas_numeros.sort((a, b) => {
            return (parseInt(a._id, 10) > parseInt(b._id, 10)) ? val : ((parseInt(b._id, 10) > parseInt(a._id, 10)) ? -val : 0);
        });

        const carpetas_sort = carpetas_numeros.concat(carpetas_letras);
        this.carpetas = [];
        this.carpetas = carpetas_sort;
    }

    onShowDevolver(event) {
        this.verDevolver = true;
    }

    onCarpeta(value) {
        this.recargarSolicitudesEmit.emit(true);
        this.getCarpetas({}, null);
    }
}
