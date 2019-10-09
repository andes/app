import { Component, OnInit, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { enumToArray } from '../../../utils/enums';
import { EstadosCarpetas } from './../enums';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';

// Servicios
import { PrestamosService } from './../../../services/prestamosHC/prestamos-hc.service';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { EspacioFisicoService } from '../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { ObraSocialService } from './../../../services/obraSocial.service';
import { CDAService } from './../../../modules/rup/services/CDA.service';

import { IObraSocial } from '../../../interfaces/IObraSocial';

// Interfaces
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { environment } from '../../../../environments/environment';
import { Unsubscribe } from '@andes/shared';

@Component({
    selector: 'app-listar-solicitudes',
    templateUrl: './listar-solicitudes.component.html',
    styleUrls: ['../prestamos-hc.scss']
})

export class ListarSolicitudesComponent implements OnInit {
    @ViewChildren('upload') childsComponents: QueryList<any>;
    extensionPermitida = 'pdf';
    errorExt = -1;

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
    public changeCarpeta = false;

    public filters: any = {
        organizacion: this.auth.organizacion._id
    };

    public verPrestar: Boolean = false;
    public verDevolver: Boolean = false;
    public verSolicitudManual: Boolean = false;
    public verNuevaCarpeta: Boolean = false;
    public mostrarMasOpciones = false;
    public sortDescending = false;
    public _listarCarpetas;

    get cssLayout() {
        return { 'col-9': this.verPrestar || this.verSolicitudManual || this.verNuevaCarpeta, 'col': !this.verSolicitudManual && !this.verPrestar };
    }

    get listaCarpetasInput(): any {
        return this._listarCarpetas;
    }

    // @Output() showPrestarEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() carpetaPrestadaEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() recargarPrestamosEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() imprimirSolicitudesEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() mostrarSolicitudManualEventEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() prestarCarpetaEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    private _pacienteSeleccionado: any;
    public paciente: IPaciente;
    obraSocialPaciente: IObraSocial;
    pacientesSearch = false;
    seleccion = null;
    esEscaneado = false;
    carpetaEfector: any;
    mostrarMsjMultiCarpeta = false;

    constructor(
        public plex: Plex,
        public prestamosService: PrestamosService,
        public servicioPrestacion: TipoPrestacionService,
        public servicioEspacioFisico: EspacioFisicoService,
        public servicioProfesional: ProfesionalService,
        public auth: Auth,
        public servicePaciente: PacienteService,
        public servicioOS: ObraSocialService,
        public servicioCDA: CDAService,
    ) {
    }

    ngOnInit() {
        this.fechaDesde = new Date();
        this.fechaHasta = new Date();
        this.filters.fechaDesde = moment(this.fechaDesde).startOf('day');
        this.filters.fechaHasta = moment(this.fechaHasta).endOf('day');
        this.getCarpetas({}, null);
    }

    getCarpetas(value, filter) {
        this.refreshFilters(value, filter);
        this.searchCarpetas();
    }

    @Unsubscribe()
    searchCarpetas() {
        return this.prestamosService.getCarpetasSolicitud(this.filters).subscribe(carpetas => {
            this.carpetas = carpetas;
            this.sortCarpetas();
        });
    }

    refreshFilters(value, filter) {
        if (filter === 'fechaDesde') {
            let fechaDesde = moment(this.fechaDesde).startOf('day');
            let _fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaDesde > _fechaHasta) {
                this.filters['fechaHasta'] = this.fechaHasta = moment(this.fechaDesde).endOf('day');
            }
            if (fechaDesde.isValid()) {
                this.filters['fechaDesde'] = fechaDesde;
            }
        }
        if (filter === 'fechaHasta') {
            let fechaHasta = moment(this.fechaHasta).endOf('day');
            let _fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaHasta < _fechaDesde) {
                this.filters['fechaDesde'] = this.fechaDesde = moment(this.fechaHasta).startOf('day');
            }
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
        } else {
            event.callback(this.espacioFisico || []);
        }
    }

    estaSeleccionada(carpeta: any) {
        return this.carpetasSeleccionadas.findIndex(x => {
            let estaSelect = false;
            if (x.tipo !== 'Manual' && carpeta.tipo !== 'Manual') {
                estaSelect = x.datosPrestamo.turno.id === carpeta.datosPrestamo.turno.id;
            }
            return estaSelect;
        }) >= 0;

    }

    switchDiaPaciente(carpeta: any) {
        return this.carpetasSeleccionadas.findIndex(x => {
            let existeSolicitud = false;
            if (x.fecha.getMonth() === carpeta.fecha.getMonth() && x.fecha.getDate() === carpeta.fecha.getDate() && x.paciente.documento === carpeta.paciente.documento) {
                // Si la carpeta seleccionada tiene la misma fecha que otra carpeta ya seleccionada, no permite la seleccion
                existeSolicitud = true;
            }
            return existeSolicitud;
        });
    }

    switchSeleccionCarpeta(carpeta: any) {
        if (carpeta.estado !== 'Prestada' && carpeta.tipo !== 'Manual') {
            if (!this.estaSeleccionada(carpeta)) {
                let diaPaciente = this.switchDiaPaciente(carpeta);
                if (diaPaciente >= 0) {
                    this.plex.toast('danger', 'No se puede prestar la carpeta del paciente más de una vez para el mismo día', 'Información', 2000);
                } else {
                    this.carpetasSeleccionadas.push(carpeta);
                    this.mostrarMsjMultiCarpeta = false;
                }
            } else {
                let estaSelect = false;
                this.carpetasSeleccionadas.splice(this.carpetasSeleccionadas.findIndex(x => {
                    if (carpeta.idSolicitud === undefined) {
                        estaSelect = x.datosPrestamo.turno.id === carpeta.datosPrestamo.turno.id;
                        if (this.switchDiaPaciente(carpeta) >= 0) {
                            this.mostrarMsjMultiCarpeta = false;
                        }
                    }
                    return estaSelect;
                }), 1);
            }
            // Si solo una carpeta es seleccionada con checkbox, se muestran el box de detalles de devolución; caso contrario, el box de detalles se ocultas
            this.carpetasSeleccionadas.length === 1 ? this.prestar(this.carpetasSeleccionadas[0]) : this.verPrestar = false;
        }
    }

    switchMarcarTodas() {
        this.marcarTodas = !this.marcarTodas;
        if (this.marcarTodas) {
            this.carpetas.forEach(carpeta => {
                let diaPaciente = this.switchDiaPaciente(carpeta);
                if (carpeta.estado === 'En archivo' && carpeta.tipo === 'Automatica' && diaPaciente === -1) {
                    this.carpetasSeleccionadas.push(carpeta);
                }
                if (diaPaciente >= 0) {
                    this.mostrarMsjMultiCarpeta = true;
                }
            });
        } else {
            this.carpetasSeleccionadas = [];
        }
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
        this.imprimirSolicitudesEmit.emit(this.carpetas);
    }

    showSolicitudManual() {
        this.mostrarSolicitudManualEventEmitter.emit();
    }

    loadEstados(event) {
        let listaEstados = [{ nombre: 'En Archivo', valor: 'En Archivo' }, { nombre: 'Prestada', valor: 'Prestada' }];
        event.callback(listaEstados);
    }

    prestar(solicitudCarpeta) {
        if (this.carpetasSeleccionadas.length === 0) {
            this.prestarCarpetaEmitter.emit(solicitudCarpeta);
            this.carpetaSeleccionada = solicitudCarpeta;
            this.verPrestar = true;
            this.verSolicitudManual = false;
            this.verNuevaCarpeta = false;
        }
    }

    sortCarpetas() { // se divide this.carpetas en letras y en numeros para hacer el sort correspondiente
        let val = this.sortDescending ? -1 : 1;
        let carpetas_numeros = this.carpetas.filter(x => !isNaN(x.numero));
        let carpetas_letras = this.carpetas.filter(x => isNaN(x.numero));
        carpetas_letras.sort((a, b) => { return (a.numero > b.numero) ? val : (b.numero > a.numero) ? -val : 0; });
        carpetas_numeros.sort((a, b) => { return (parseInt(a.numero, 10) > parseInt(b.numero, 10)) ? val : ((parseInt(b.numero, 10) > parseInt(a.numero, 10)) ? -val : 0); });

        let carpetas_sort = carpetas_numeros.concat(carpetas_letras);
        this.carpetas = [];
        this.carpetas = carpetas_sort;
    }

    toogleSort() {
        this.sortDescending = !this.sortDescending;
        this.sortCarpetas();
    }

    onCarpeta(value) {
        this.recargarPrestamosEmit.emit(true);
        this.getCarpetas({}, null);
    }


    fileExtension(file) {
        if (file.lastIndexOf('.') >= 0) {
            return file.slice((file.lastIndexOf('.') + 1));
        } else {
            return '';
        }
    }

    onUpload($event, carpeta) {
        if ($event.status = 200) {
            let _id;
            const id = $event.body.id;
            let profesional = this.auth.usuario;
            if (carpeta.tipo === 'Manual') {
                _id = carpeta.idSolicitud;
            } else if (carpeta.tipo === 'Automatica') {
                _id = carpeta.datosPrestamo.turno.id;
            }
            let conceptSnomed = {
                term: 'adjuntar archivo de historia clínica digitalizada (procedimiento)',
                conceptId: '2881000013106'
            };
            let metadata = {
                id: _id,
                tipoPrestacion: conceptSnomed.conceptId,
                fecha: new Date(),
                paciente: carpeta.paciente,
                profesional: profesional,
                file: `id:${id}`,
                texto: 'Se adjunta/n historia clínica digitalizada por un administrativo'
            };
            this.servicioCDA.post(null, metadata).subscribe((data) => {
                this.plex.toast('success', 'Se adjuntó correctamente', 'Información', 1000);
                this.getCarpetas({}, null);
            });
        }
    }

    descargar(archivo) {
        let token = window.sessionStorage.getItem('jwt');
        let url = environment.API + '/modules/cda/' + archivo + '?token=' + token;
        window.open(url);
    }
}
