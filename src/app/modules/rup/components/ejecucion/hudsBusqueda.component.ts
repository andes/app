import { PrestacionesService } from './../../services/prestaciones.service';
import { Component, OnInit, Output, Input, EventEmitter, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';

import { HUDSService } from '../../services/huds.service';
@Component({
    selector: 'rup-hudsBusqueda',
    templateUrl: 'hudsBusqueda.html',
    styleUrls: ['hudsBusqueda.scss', 'buscador.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class HudsBusquedaComponent implements OnInit {

    laboratoriosFS: any;
    laboratorios: any = [];
    vacunas: any = [];
    ordenDesc = true;

    procedimientos: any = [];
    procedimientosCopia: any[];

    hallazgosCronicosAux: any[];
    hallazgosNoActivosAux: any;


    filtros: any = [
        { titulo: 'PRESTACIONES', key: 'prestaciones', icon: 'plan' },
        { titulo: 'TODOS', key: 'todos', icon: 'todos' },
        { titulo: 'HALLAZGOS', key: 'hallazgos', icon: 'hallazgo' },
        { titulo: 'TRASTORNOS', key: 'trastornos', icon: 'trastorno' },
        { titulo: 'PROC', key: 'procedimientos', icon: 'procedimiento' },
        { titulo: 'PRODUCTOS', key: 'productos', icon: 'producto' },
        { titulo: 'LABOS', key: 'laboratorios', icon: 'laboratorio' },
        { titulo: 'VACUNAS', key: 'vacunas', icon: 'vacuna' }
    ];

    filtroActual: any = 'prestaciones';
    public loading = false;

    public cdas = [];

    @Input() paciente: any;

    @Input() _draggable: Boolean = false;
    @Input() _dragScope: String;
    @Input() _dragOverClass: String = 'drag-over-border';

    /**
    * Variable por parámetro para mostrar o no todo lo relacionado a emitir conceptos
    */
    @Input() emitirConceptos = true;

    // Outputs de los eventos drag start y drag end
    @Output() _onDragStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onDragEnd: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Devuelve un elemento seleccionado que puede ser
     * una prestacion o un ?????
     */
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();


    /**
     * Listado de prestaciones validadas
     */
    public tiposPrestacion = [];
    public prestacionSeleccionada = [];
    private _prestaciones: any = [];
    private prestacionesCopia: any = [];
    get prestaciones() {
        return this._prestaciones;
    }
    set prestaciones(value) {
        this._prestaciones = value.sort((a, b) => b.fecha - a.fecha);
    }
    /**
     * Copia de las prestaciones para aplicar los filtros
     */
    /**
     * Listado de todos los hallazgos
     */
    public hallazgos: any = [];
    public trastornos: any = [];
    public resultadoRegistros = {
        hallazgos: [],
        trastornos: [],
        procedimientos: [],
        procedimientosCopia: [],
        prestaciones: [],
        prestacionesCopia: [],
        productos: [],
        productosCopia: [],
        vacunas: [],
        laboratorios: [],
        todos: [],
    };
    /**
     * Listado de todos los trastornos
     */
    public hallazgosCronicos: any = [];

    /**
     * Listado de todos los productos (medicamentos)
     */
    public productos: any = [];
    // copia de los productos para el buscador
    public productosCopia: any = [];

    /**
         * Listado de todos los hallazgos no activos
         */
    public hallazgosNoActivos: any = [];

    public fechaInicio;
    public fechaFin;
    public showFiltros = false;

    public conceptos = {
        hallazgo: ['hallazgo', 'situación', 'evento'],
        trastorno: ['trastorno'],
        procedimiento: ['procedimiento', 'entidad observable', 'régimen/tratamiento'],
        plan: ['procedimiento', 'régimen/tratamiento'],
        producto: ['producto', 'objeto físico', 'medicamento clínico'],
        elementoderegistro: ['elemento de registro'],
        laboratorios: ['laboratorios'],
        vacunas: ['vacunas'],
    };



    public txtABuscar;

    constructor(
        public servicioPrestacion: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public plex: Plex,
        public auth: Auth,
        public huds: HUDSService
    ) {
    }

    /**
     * buscamos y listamos las prestaciones o hallazgos del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngOnInit() {
        if (this.paciente) {
            this.listarPrestaciones();
            this.listarConceptos();
        }
        // Cuando se inicia una prestación debemos volver a consultar si hay CDA nuevos al ratito.
        // [TODO] Ser notificado via websockets
        setTimeout(() => {
            this.buscarCDAPacientes();
        }, 1000 * 30);

    }

    dragStart(e) {
        this._onDragStart.emit(e);
    }

    dragEnd(e) {
        this._onDragEnd.emit(e);
    }

    toogleFiltros() {
        this.showFiltros = !this.showFiltros;
        if (!this.showFiltros) {
            this.fechaInicio = this.fechaFin = this.prestacionSeleccionada = null;
            this.filtrar();
        }
    }

    /**
     * Actualiza la vista. En un futuro, podría cargar a demanda los datos requeridos
     *
     * @param {any} vista Vista actual
     * @memberof HudsBusquedaComponent
     */
    actualizarVista(vista) {
        this.filtroActual = vista;
    }

    devolverPrestacion(prestacion) {
        let resultado = {
            tipo: 'prestacion',
            data: prestacion
        };
        this.evtData.emit(resultado);
    }

    devolverHallazgo(hallazgo) {
        let resultado = {
            tipo: 'hallazgo',
            data: hallazgo
        };
        this.evtData.emit(resultado);
    }

    devolverMedicamento(medicamento) {
        let resultado = {
            tipo: 'medicamento',
            data: medicamento
        };
        this.evtData.emit(resultado);
    }

    devolverLaboratorio(laboratorio) {
        let resultado = {
            tipo: 'laboratorio',
            data: laboratorio
        };
        this.evtData.emit(resultado);
    }

    emitTabs(registro, tipo) {
        switch (tipo) {
            case 'concepto':
                registro.class = this.servicioPrestacion.getCssClass(registro.concepto, null);
                if (registro.esSolicitud) {
                    registro.class = 'plan';
                }
                break;
            case 'rup':
                if (registro.prestacio && registro.prestacion.conceptId === PrestacionesService.InternacionPrestacion.conceptId) {
                    tipo = 'internacion';
                }
                registro = registro.data;
                if (registro.ejecucion.registros) {
                    registro.ejecucion.registros.forEach(reg => {
                        if (reg.relacionadoCon && reg.relacionadoCon.length > 0) {
                            if (typeof reg.relacionadoCon[0] === 'string') {
                                reg.relacionadoCon = reg.relacionadoCon.map((idRegistroRel) => {
                                    return registro.ejecucion.registros.find(r => r.id === idRegistroRel || r.concepto.conceptId === idRegistroRel);
                                });
                            }
                        }
                    });
                }
                break;
            case 'cda':
                registro = registro.data;
                registro.class = 'plan';
                break;
        }

        this.huds.toogle(registro, tipo);
    }

    listarPrestaciones() {
        this.servicioPrestacion.getByPaciente(this.paciente.id, false).subscribe(prestaciones => {
            this.resultadoRegistros.prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada').map(p => {
                const lastState = p.estados[p.estados.length - 1];
                return {
                    data: p,
                    tipo: 'rup',
                    concepto: p.solicitud.tipoPrestacion,
                    esSolicitud: true,
                    profesional: lastState.createdBy.nombreCompleto,
                    organizacion: p.solicitud.organizacion,
                    fecha: lastState.createdAt,
                    estado: lastState.tipo
                };
            });
            this.prestacionesCopia = this.resultadoRegistros.prestaciones;
            this.tiposPrestacion = this._prestaciones.map(p => p.prestacion);
            this.buscarCDAPacientes();
        });
    }

    // Trae los hallazgos
    listarConceptos() {
        this.servicioPrestacion.getConceptosByPaciente(this.paciente.id, true).subscribe(registros => {
            this.resultadoRegistros.todos = registros;

            this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id).subscribe((hallazgos) => {
                this.resultadoRegistros.hallazgos = hallazgos;
            });

            this.servicioPrestacion.getByPacienteTrastorno(this.paciente.id).subscribe((trastornos) => {
                this.resultadoRegistros.trastornos = trastornos;

            });

            this.servicioPrestacion.getByPacienteMedicamento(this.paciente.id).subscribe((medicamentos) => {
                this.resultadoRegistros.productos = medicamentos;
                this.resultadoRegistros.productosCopia = medicamentos;
            });

            this.servicioPrestacion.getByPacienteProcedimiento(this.paciente.id).subscribe((procedimientos) => {
                this.resultadoRegistros.procedimientos = procedimientos;
                this.resultadoRegistros.procedimientosCopia = procedimientos;
            });
        });
    }

    // Trae los medicamentos registrados para el paciente
    listarProcedimientos() {
        this.servicioPrestacion.getByPacienteProcedimiento(this.paciente.id, true).subscribe(procedimientos => {
            this.resultadoRegistros.procedimientos = procedimientos;
            this.resultadoRegistros.procedimientosCopia = procedimientos;
        });
    }

    // Trae los medicamentos registrados para el paciente
    listarMedicamentos() {
        this.servicioPrestacion.getByPacienteMedicamento(this.paciente.id, true).subscribe(medicamentos => {
            this.resultadoRegistros.productos = medicamentos;
            this.resultadoRegistros.productosCopia = medicamentos;
        });
    }


    // Trae los cdas registrados para el paciente
    buscarCDAPacientes() {
        this.servicioPrestacion.getCDAByPaciente(this.paciente.id).subscribe(registros => {
            this.cdas = registros.map(cda => {
                cda.id = cda.cda_id;
                return {
                    data: cda,
                    tipo: 'cda',
                    prestacion: cda.prestacion.snomed,
                    profesional: cda.profesional ? cda.profesional.apellido + ' ' + cda.profesional.apellido : '',
                    concepto: cda.prestacion.snomed,
                    esSolicitud: false,
                    organizacion: cda.organizacion,
                    fecha: cda.fecha,
                    estado: 'validada',
                };
            });

            // Filtramos las vacunas y laboratorios por ahora para que se listan por separado
            this.resultadoRegistros.vacunas = this.cdas.filter(cda => cda.prestacion.conceptId === TipoPrestacionService.Vacunas_CDA_ID);
            this.resultadoRegistros.laboratorios = this.cdas.filter(cda => cda.prestacion.conceptId === TipoPrestacionService.Laboratorio_CDA_ID);

            // Dejamos el resto de los CDAS y los unimos a las prestaciones
            const filtro = this.cdas.filter(cda => {
                return cda.prestacion.conceptId !== TipoPrestacionService.Vacunas_CDA_ID && cda.prestacion.conceptId !== TipoPrestacionService.Laboratorio_CDA_ID;
            });

            // Filtramos por CDA para poder recargar los estudiosc
            this.resultadoRegistros.prestaciones = [...this.resultadoRegistros.prestaciones.filter(e => e.tipo !== 'cda'), ...filtro];
            this.prestacionesCopia = this.resultadoRegistros.prestaciones;
            this.tiposPrestacion = this._prestaciones.map(p => p.prestacion);
        });
    }

    getCantidadResultados(type: any) {
        switch (type) {
            case 'todos':
                return this.resultadoRegistros.todos.length;
            case 'hallazgos':
                return this.resultadoRegistros.hallazgos.length;
            case 'trastornos':
                return this.resultadoRegistros.trastornos.length;
            case 'procedimientos':
                return this.resultadoRegistros.procedimientos.length;
            case 'prestaciones':
                return this.resultadoRegistros.prestaciones.length;
            case 'productos':
                return this.resultadoRegistros.productos.length;
            case 'laboratorios':
                return this.resultadoRegistros.laboratorios.length;
            case 'vacunas':
                return this.resultadoRegistros.vacunas.length;
        }
    }

    filtroBuscador(key: any) {
        this.filtroActual = key;
    }

    getSemanticTagFiltros() {
        // let filtro = this.esTurneable(concepto) ? ['planes'] : this.filtroActual;
        let filtro = (this.conceptos[this.filtroActual]) ? this.conceptos[this.filtroActual] : null;

        // si estamos en buscador basico nos fijamos si el filtro seleccionado es planes
        // o bien, si estamos en el buscador guiado, si la opcion desplegada es planes
        // entonces sobreescribmos el filtro a emitir como ['planes']
        if (this.filtroActual === 'planes') {
            filtro = ['planes'];
        }

        return filtro;
    }

    buscar() {
        const regex_buscar = new RegExp('.*' + this.txtABuscar + '.*', 'ig');
        this.resultadoRegistros.trastornos = this.resultadoRegistros.hallazgos.filter(a => regex_buscar.test(a.concepto.term) || this.txtABuscar === null);
        this.resultadoRegistros.procedimientos = this.resultadoRegistros.procedimientos.filter(p => regex_buscar.test(p.concepto.term) || this.txtABuscar === null);
        this.resultadoRegistros.prestaciones = this.resultadoRegistros.prestaciones.filter(p => regex_buscar.test(p.prestacion.term) || this.txtABuscar === null);
        this.resultadoRegistros.productos = this.resultadoRegistros.productos.filter(p => regex_buscar.test(p.concepto.term) || this.txtABuscar === null);
    }

    filtrar() {
        if (this.prestacionSeleccionada.length > 0) {
            const prestacionesTemp = this.prestacionSeleccionada.map(e => e.conceptId);
            this.resultadoRegistros.prestaciones = this.prestacionesCopia.filter(p => prestacionesTemp.find(e => e === p.prestacion.conceptId));
        } else {
            this.resultadoRegistros.prestaciones = this.prestacionesCopia;
        }
        if (this.fechaInicio || this.fechaFin) {
            this.fechaInicio = this.fechaInicio ? this.fechaInicio : new Date();
            this.fechaFin = this.fechaFin ? this.fechaFin : new Date();
            this.resultadoRegistros.prestaciones = this.resultadoRegistros.prestaciones.filter(p => p.fecha >= moment(this.fechaInicio).startOf('day').toDate() &&
                p.fecha <= moment(this.fechaFin).endOf('day').toDate());
        }
    }
}
