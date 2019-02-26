import { PrestacionesService } from './../../services/prestaciones.service';
import { Component, OnInit, Output, Input, EventEmitter, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';

@Component({
    selector: 'rup-hudsBusqueda',
    templateUrl: 'hudsBusqueda.html',
    styleUrls: ['hudsBusqueda.scss', 'buscador.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class HudsBusquedaComponent implements OnInit {
    laboratoriosFS: any;
    laboratorios: any;
    vacunas: any = [];
    colapsadoOtros = true;
    colapsadoActivos = true;
    colapsadoCronicos = true;
    colapsado = true;
    ordenDesc = true;
    procedimientos: any;
    // Copia de los procedimientos para el buscador.
    procedimientosCopia: any[];

    problemasActivosAux: any;
    hallazgosCronicosAux: any[];
    hallazgosNoActivosAux: any;
    filtroActual: any = 'todos';
    public loading = false;

    public cdas = [];

    @Input() paciente: any;
    @Input() prestacionActual: any;

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
     * Listado de todos los registros de la HUDS seleccionados
     */
    @Input() registrosHuds: any = [];

    /**
     * Devuelve un elemento seleccionado que puede ser
     * una prestacion o un ?????
     */
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();


    /*
     * Devuelve el array de registros seleccionados para visualizar
     * de la HUDS
     */
    @Output() evtHuds: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Vista actual
     */
    public vista = 'hallazgos';
    /**
     * Listado de prestaciones validadas
     */
    public prestaciones: any = [];
    /**
     * Copia de las prestaciones para aplicar los filtros
     */
    public prestacionesCopia: any = [];
    /**
     * Listado de todos los hallazgos
     */
    public hallazgos: any = [];
    public trastornos: any = [];
    public todos: any = [];
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
     * Listado de todos los hallazgos
     */
    public problemasActivos: any = [];

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

    /**
     * Prestaciones permitidas para el usuario
     */
    public tiposPrestacion;
    /**
     * Prestacion seleccionada para aplicar el filtro
     */
    public prestacionSeleccionada;

    public txtABuscar;

    constructor(
        private servicioPrestacion: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public plex: Plex,
        public auth: Auth
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

    devolverRegistrosHuds(registro, tipo) {
        let index;
        switch (tipo) {
            case 'concepto':
                registro.class = this.servicioPrestacion.getCssClass(registro.concepto, null);
                if (registro.esSolicitud) {
                    registro.class = 'plan';
                }
                index = this.registrosHuds.findIndex(r => r.tipo === 'concepto' && r.data.idRegistro === registro.idRegistro);
                break;
            case 'rup':
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
                index = this.registrosHuds.findIndex(r => r.tipo === 'rup' && r.data.id === registro.id);
                break;
            case 'cda':
                registro = registro.data;
                registro.class = 'plan';
                index = this.registrosHuds.findIndex(r => r.tipo === 'cda' && r.data.id === registro.id);
                break;
        }

        let elemento = {
            tipo: tipo,
            data: registro,
            ...{ vistaHUDS: tipo !== 'prestacion' ? true : false }
        };
        // si no existe lo agregamos
        if (index === -1) {
            this.registrosHuds.push(elemento);
        } else {
            // si existe lo quitamos
            this.registrosHuds.splice(index, 1);
        }

        this.evtHuds.emit(elemento);

    }

    /**
     * Determina si un hallazgo ya fué cargado en los tabs de la HUDS
     * Para agregarle una clase activa en el listado de hallazgos.
     *
     * @param {any} registro Registro a verificar si esta cargado o no en la HUDS
     * @param {any} tipo hallzago | prestacion
     * @returns boolean
     * @memberof HudsBusquedaComponent
     */
    isOpen(registro, tipo) {
        if (!this.registrosHuds.length) {
            return false;
        }

        for (let i = 0; i < this.registrosHuds.length; i++) {
            const _registro = this.registrosHuds[i].data;
            switch (tipo) {
                case 'concepto':
                    if (registro.idRegistro === _registro.idRegistro) {
                        return true;
                    }
                    break;
                case 'rup':
                case 'cda':
                    if (registro.data.id === _registro.id) {
                        return true;
                    }
                    break;
            }

        }
        return false;
    }

    /**
     *
     * @param tipoOrden 'fecha' | 'alfa'
     */
    ordenarRegistros(tipoOrden = 'fecha', tipo = null) {

        // Ordenar PROCEDIMIENTOS
        // (fecha === estados[prestacion.estados.length - 1].createdAt)
        // (alfa === solicitud.tipoPrestacion.term)
        if (this.filtroActual === 'procedimiento') {
            this.procedimientos.sort((a, b) => {
                if (tipoOrden === 'fecha') {
                    if (this.ordenDesc) {
                        return b.createdAt - a.createdAt;
                    } else {
                        return a.createdAt - b.createdAt;
                    }
                } else if (tipoOrden === 'alfa') {
                    if (this.ordenDesc) {
                        return b.concepto.term.localeCompare(a.concepto.term);
                    } else {
                        return a.concepto.term.localeCompare(b.concepto.term);
                    }
                }
            });
        }

        // Ordenar PLANES
        // (fecha === estados[prestacion.estados.length - 1].createdAt)
        // (alfa === solicitud.tipoPrestacion.term)
        if (this.filtroActual === 'planes') {
            this.prestaciones.sort((a, b) => {
                if (tipoOrden === 'fecha') {
                    if (this.ordenDesc) {
                        return b.estados[b.estados.length - 1].createdAt - a.estados[a.estados.length - 1].createdAt;
                    } else {
                        return a.estados[a.estados.length - 1].createdAt - b.estados[b.estados.length - 1].createdAt;
                    }
                } else if (tipoOrden === 'alfa') {
                    if (this.ordenDesc) {
                        return b.solicitud.tipoPrestacion.term.localeCompare(a.solicitud.tipoPrestacion.term);
                    } else {
                        return a.solicitud.tipoPrestacion.term.localeCompare(b.solicitud.tipoPrestacion.term);
                    }
                }
            });
        }

        // Ordenar PRODUCTOS
        // (fecha === evoluciones.$.fechaCarga)
        // (alfa === concepto.term)
        if (this.filtroActual === 'producto' || tipo) {

            let array = !tipo ? this.filtroActual : tipo;

            switch (array) {
                case 'producto':
                    this.productos.sort((a, b) => {
                        if (tipoOrden === 'fecha') {
                            if (this.ordenDesc) {
                                return b.evoluciones[0].fechaCarga - a.evoluciones[0].fechaCarga;
                            } else {
                                return a.evoluciones[0].fechaCarga - b.evoluciones[0].fechaCarga;
                            }
                        } else if (tipoOrden === 'alfa') {
                            if (this.ordenDesc) {
                                return b.concepto.term.localeCompare(a.concepto.term);
                            } else {
                                return a.concepto.term.localeCompare(b.concepto.term);
                            }
                        }
                    });
                    break;
                case 'crónicos':
                    this.hallazgosCronicos.sort((a, b) => {
                        if (tipoOrden === 'fecha') {
                            if (this.ordenDesc) {
                                return b.evoluciones[0].fechaCarga - a.evoluciones[0].fechaCarga;
                            } else {
                                return a.evoluciones[0].fechaCarga - b.evoluciones[0].fechaCarga;
                            }
                        } else if (tipoOrden === 'alfa') {
                            if (this.ordenDesc) {
                                return b.concepto.term.localeCompare(a.concepto.term);
                            } else {
                                return a.concepto.term.localeCompare(b.concepto.term);
                            }
                        }
                    });
                    break;
                case 'activos':
                    this.problemasActivos.sort((a, b) => {
                        if (tipoOrden === 'fecha') {
                            if (this.ordenDesc) {
                                return b.evoluciones[0].fechaCarga - a.evoluciones[0].fechaCarga;
                            } else {
                                return a.evoluciones[0].fechaCarga - b.evoluciones[0].fechaCarga;
                            }
                        } else if (tipoOrden === 'alfa') {
                            if (this.ordenDesc) {
                                return b.concepto.term.localeCompare(a.concepto.term);
                            } else {
                                return a.concepto.term.localeCompare(b.concepto.term);
                            }
                        }
                    });
                    break;
                case 'otros':
                    this.hallazgosNoActivos.sort((a, b) => {
                        if (tipoOrden === 'fecha') {
                            if (this.ordenDesc) {
                                return b.evoluciones[0].fechaCarga - a.evoluciones[0].fechaCarga;
                            } else {
                                return a.evoluciones[0].fechaCarga - b.evoluciones[0].fechaCarga;
                            }
                        } else if (tipoOrden === 'alfa') {
                            if (this.ordenDesc) {
                                return b.concepto.term.localeCompare(a.concepto.term);
                            } else {
                                return a.concepto.term.localeCompare(b.concepto.term);
                            }
                        }
                    });
                    break;
            }

        }

        // Ordenar LABORATORIOS
        // (fecha === createddAt)
        // (alfa === concepto.term)
        if (this.filtroActual === 'laboratorios') {
            this.laboratorios.sort((a, b) => {
                if (tipoOrden === 'fecha') {
                    if (this.ordenDesc) {
                        return b.createdAt - a.createdAt;
                    } else {
                        return a.createdAt - b.createdAt;
                    }
                } else if (tipoOrden === 'alfa') {
                    if (this.ordenDesc) {
                        return b.concepto.term.localeCompare(a.concepto.term);
                    } else {
                        return a.concepto.term.localeCompare(b.concepto.term);
                    }
                }
            });
        }


        this.ordenDesc = !this.ordenDesc;
    }

    listarPrestaciones() {
        this.servicioPrestacion.getByPaciente(this.paciente.id, false).subscribe(prestaciones => {
            this.prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada').map(p => {
                const lastState = p.estados[p.estados.length - 1];
                return {
                    data: p,
                    tipo: 'rup',
                    prestacion: p.solicitud.tipoPrestacion,
                    profesional: lastState.createdBy.nombreCompleto,
                    fecha: lastState.createdAt,
                    estado: lastState.tipo
                };
            });
            this.tiposPrestacion = this.prestaciones.map(p => p.prestacion);
            this.prestacionesCopia = this.prestaciones;
            this.buscarCDAPacientes();
        });
    }

    // Trae los hallazgos
    listarConceptos() {
        this.servicioPrestacion.getConceptosByPaciente(this.paciente.id, true).subscribe(registros => {
            this.todos = registros;

            this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id).subscribe((hallazgos) => {
                this.hallazgos = hallazgos;
            });

            this.servicioPrestacion.getByPacienteTrastorno(this.paciente.id).subscribe((trastornos) => {
                this.trastornos = trastornos;

            });

            this.servicioPrestacion.getByPacienteMedicamento(this.paciente.id).subscribe((medicamentos) => {
                this.productos = medicamentos;
                this.productosCopia = medicamentos;
            });

            this.servicioPrestacion.getByPacienteProcedimiento(this.paciente.id).subscribe((procedimientos) => {
                this.procedimientos = procedimientos;
                this.procedimientosCopia = procedimientos;
            });
        });
    }

    // Trae los problemas activos NO activos
    listarHallazgosNoActivos() {
        this.hallazgosNoActivos = this.hallazgos.filter(h => h.evoluciones[0].estado !== 'activo');
        this.hallazgosNoActivos = this.hallazgosNoActivosAux = this.hallazgosNoActivos.map(element => {
            if (element.evoluciones[0].idRegistroGenerado) {
                element['transformado'] = this.hallazgos.find(h => h.evoluciones[0].idRegistro === element.evoluciones[0].idRegistroGenerado);
            } return element;
        });
    }

    // Trae los problemas activos NO crónicos
    listarProblemasActivos() {
        this.problemasActivos = this.problemasActivosAux = this.hallazgos.filter((hallazgo) => {
            if (hallazgo.evoluciones[0].estado === 'activo') {
                return (hallazgo.concepto && hallazgo.concepto.refsetIds && hallazgo.concepto.refsetIds.find(cronico => {
                    return cronico === this.servicioPrestacion.refsetsIds.cronico;
                })) ? false : hallazgo;
            }

        });
    }

    // Trae los medicamentos registrados para el paciente
    listarProcedimientos() {
        this.servicioPrestacion.getByPacienteProcedimiento(this.paciente.id, true).subscribe(procedimientos => {
            this.procedimientos = procedimientos;
            this.procedimientosCopia = procedimientos;
        });
    }

    // Trae los medicamentos registrados para el paciente
    listarMedicamentos() {
        this.servicioPrestacion.getByPacienteMedicamento(this.paciente.id, true).subscribe(medicamentos => {
            this.productos = medicamentos;
            this.productosCopia = medicamentos;
        });
    }


    // Trae los cdas registrados para el paciente
    buscarCDAPacientes() {
        this.servicioPrestacion.getCDAByPaciente(this.paciente.id).subscribe(registros => {
            // this.listarLaboratorios();
            // filtramos los laboratorios que se listan por separado
            // let otrasPrestaciones = [... this.cdas.filter(cda => cda.prestacion.snomed.conceptId !== '4241000179101')];
            this.cdas = registros.map(cda => {
                cda.id = cda.cda_id;
                return {
                    data: cda,
                    tipo: 'cda',
                    prestacion: cda.prestacion.snomed,
                    profesional: cda.profesional ? cda.profesional : '',
                    fecha: cda.fecha,
                    estado: 'validada'
                };
            });
            // filtramos las vacunas y laboratorios por ahora para que se listan por separado
            this.vacunas = this.cdas.filter(cda => cda.prestacion.conceptId === TipoPrestacionService.Vacunas_CDA_ID);
            this.laboratorios = this.cdas.filter(cda => cda.prestacion.conceptId === TipoPrestacionService.Laboratorio_CDA_ID);

            // DEjamos el resto de los CDAS y los unimos a las prestaciones
            const filtro = this.cdas.filter(cda => {
                return cda.prestacion.conceptId !==  TipoPrestacionService.Vacunas_CDA_ID && cda.prestacion.conceptId !==  TipoPrestacionService.Laboratorio_CDA_ID;
            });

            this.prestaciones = [...this.prestaciones, ...filtro];

            // vamos a ordenar la prestaciones por fecha
            this.prestaciones = this.prestaciones.sort((a, b) => b.fecha - a.fecha);
        });
    }

    getCantidadResultados(type: any) {
        switch (type) {
            case 'todos':
                return this.todos.length;
            case 'hallazgo':
                return this.hallazgos.length;
            case 'trastorno':
                return this.trastornos.length;
            case 'procedimiento':
                return this.procedimientos.length;
            case 'planes':
                return this.prestaciones.length;
            case 'producto':
                return this.productos.length;
            case 'laboratorios':
                return this.laboratorios.length;
            case 'vacunas':
                return this.vacunas.length;
        }
    }

    filtroBuscador(key: any) {
        this.colapsado = true;
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
        this.hallazgosCronicos = this.hallazgos.filter(a => regex_buscar.test(a.concepto.term) || this.txtABuscar === null);
        this.procedimientos = this.procedimientosCopia.filter(p => regex_buscar.test(p.concepto.term) || this.txtABuscar === null);
        this.prestaciones = this.prestacionesCopia.filter(p => regex_buscar.test(p.prestacion.term) || this.txtABuscar === null);
        this.productos = this.productosCopia.filter(p => regex_buscar.test(p.concepto.term) || this.txtABuscar === null);
    }

    filtrar() {
        if (this.prestacionSeleccionada) {
            this.prestaciones = this.prestacionesCopia.filter(p => p.prestacion.conceptId === this.prestacionSeleccionada.conceptId);
        } else {
            this.prestaciones = this.prestacionesCopia;
        }
        if (this.fechaInicio || this.fechaFin) {
            this.fechaInicio = this.fechaInicio ? this.fechaInicio : new Date();
            this.fechaFin = this.fechaFin ? this.fechaFin : new Date();
            this.prestaciones = this.prestaciones.filter(p => p.fecha >= moment(this.fechaInicio).startOf('day').toDate() &&
                p.fecha <= moment(this.fechaFin).endOf('day').toDate());
        }
    }
}
