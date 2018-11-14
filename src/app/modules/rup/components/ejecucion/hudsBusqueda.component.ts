import { PrestacionesService } from './../../services/prestaciones.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation, DebugElement } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as moment from 'moment';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
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
    colapsadoOtros = true;
    colapsadoActivos = true;
    colapsadoCronicos = true;
    colapsado = true;
    ordenDesc = true;
    elementosRegistro: any[];
    procedimientos: any;
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
     * Listado de todos los hallazgos
     */
    public hallazgos: any = [];

    /**
     * Listado de todos los trastornos
     */
    public hallazgosCronicos: any = [];

    /**
     * Listado de todos los productos (medicamentos)
     */
    public productos: any = [];


    /**
     * Listado de todos los hallazgos
     */
    public problemasActivos: any = [];

    /**
         * Listado de todos los hallazgos no activos
         */
    public hallazgosNoActivos: any = [];

    public conceptos = {
        hallazgo: ['hallazgo', 'situación'],
        trastorno: ['trastorno'],
        procedimiento: ['procedimiento', 'entidad observable', 'régimen/tratamiento'],
        plan: ['procedimiento', 'régimen/tratamiento'],
        producto: ['producto'],
        elementoderegistro: ['elemento de registro'],
        laboratorios: ['laboratorios'],
    };

    constructor(private servicioPrestacion: PrestacionesService,
        public plex: Plex, public auth: Auth) {
    }

    /**
     * buscamos y listamos las prestaciones o hallazgos del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngOnInit() {
        if (this.paciente) {
            this.listarPrestaciones();
            // this.listarProblemasCronicos();
            this.listarHallazgos();
        }
    }

    dragStart(e) {
        this._onDragStart.emit(e);
    }

    dragEnd(e) {
        this._onDragEnd.emit(e);
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
            case 'hallazgo':
            case 'trastorno':
            case 'producto':
                registro.class = registro.concepto.semanticTag;
                if (registro.esSolicitud) {
                    registro.class = 'plan';
                }
                index = this.registrosHuds.findIndex(r => {
                    if (r.data.concepto && (r.data.concepto.semanticTag === 'hallazgo' || r.data.concepto.semanticTag === 'trastorno' || r.data.concepto.semanticTag === 'producto' || r.data.concepto.semanticTag === 'procedimiento' || r.data.concepto.semanticTag === 'entidad observable') && r.data.concepto.id === registro.concepto.id) {
                        if (r.data.createdAt === registro.createdAt && r.data.updatedAt === registro.updatedAt) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                });
                break;
            case 'prestacion':
                // Se populan las relaciones usando el _id
                if (registro.tipo === 'rup') {
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

                    index = this.registrosHuds.findIndex(r => {
                        return (r.data.id === registro.id);
                    });

                } else {
                    tipo = 'cda';
                    registro = registro.data;
                    index = this.registrosHuds.findIndex(r => {
                        return (r.data.id === registro.id);
                    });
                }
                registro.class = 'plan';
                break;
            case 'procedimiento':
                registro.class = registro.concepto.semanticTag;
                index = this.registrosHuds.findIndex(r => {
                    if ((r.data.concepto.semanticTag === 'hallazgo' || r.data.concepto.semanticTag === 'producto' || r.data.concepto.semanticTag === 'procedimiento') && r.data.concepto.id === registro.concepto.id) {
                        if (r.data.createdAt === registro.createdAt && r.data.updatedAt === registro.updatedAt) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                });
                break;
            case 'laboratorio':
                registro.class = 'laboratorio';
                index = this.registrosHuds.findIndex(r => {
                    if (r.tipo === 'cda' && r.data.prestacion.snomed.semanticTag === 'elemento de registro') {
                        if (r.data.fecha === registro.fecha) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                });
                break;
        }

        let elemento = {
            tipo: tipo,
            data: registro
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
    estaEnTabs(registro, tipo) {
        if (!this.registrosHuds.length) {
            return false;
        }

        for (let i = 0; i < this.registrosHuds.length; i++) {
            const _registro = this.registrosHuds[i].data;

            // console.log('registro, _registro', registro, _registro);

            if (_registro && _registro.concepto && registro.concepto) {
                if (_registro.concepto.conceptId === registro.concepto.conceptId && _registro.createdAt === registro.createdAt) {
                    return true;
                }
            } else if (_registro && _registro.createdAt && _registro.createdAt === registro.createdAt) {
                return true;
            }
        }
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

        // Ordenar ELEMENTOS DE REGISTRO
        // (fecha === updatedAt)
        // (alfa === concepto.term)
        if (this.filtroActual === 'otros') {
            this.elementosRegistro.sort((a, b) => {
                if (tipoOrden === 'fecha') {
                    if (this.ordenDesc) {
                        return b.updatedAt - a.updatedAt;
                    } else {
                        return a.updatedAt - b.updatedAt;
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


    colapsarRegistros(tipo = null) {
        if (!tipo) {
            this.colapsado = !this.colapsado;
        } else {
            switch (tipo) {
                case 'crónicos':
                    this.colapsadoCronicos = !this.colapsadoCronicos;
                    break;
                case 'activos':
                    this.colapsadoActivos = !this.colapsadoActivos;
                    break;
                case 'otros':
                    this.colapsadoOtros = !this.colapsadoOtros;
                    break;
            }
        }
    }


    listarPrestaciones() {
        this.servicioPrestacion.getByPaciente(this.paciente.id, false).subscribe(prestaciones => {
            this.prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
            this.prestaciones = this.prestaciones.map(p => {
                return {
                    data: p,
                    tipo: 'rup',
                    prestacion: p.solicitud.tipoPrestacion,
                    profesional: p.estados[p.estados.length - 1].createdBy.nombreCompleto,
                    fecha: p.estados[p.estados.length - 1].createdAt,
                    estado: p.estados[p.estados.length - 1].tipo
                };
            });
            this.buscarCDAPacientes();

        });
    }

    // Trae los hallazgos
    listarHallazgos() {
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id, true).subscribe(hallazgos => {
            this.hallazgos = hallazgos;
            this.listarProblemasCronicos();
            this.listarHallazgosNoActivos();
            this.listarProblemasActivos();
            this.listarProcedimientos();
            this.listarMedicamentos();
            this.listarElementosDeRegistro();

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

    // Trae los problemas crónicos (por SNOMED refsetId)
    listarProblemasCronicos() {
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id, true).subscribe(hallazgos => {
            // Buscamos si es crónico
            this.hallazgosCronicos = this.hallazgosCronicosAux = hallazgos.filter((hallazgo) => {
                if (hallazgo.concepto && hallazgo.concepto.refsetIds) {
                    return hallazgo.concepto.refsetIds.find(cronico => {
                        return cronico === this.servicioPrestacion.refsetsIds.cronico;
                    });
                }
            });

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
        });
    }

    // Trae los medicamentos registrados para el paciente
    listarMedicamentos() {
        this.servicioPrestacion.getByPacienteMedicamento(this.paciente.id, true).subscribe(medicamentos => {
            this.productos = medicamentos;
        });
    }

    // Trae los medicamentos registrados para el paciente
    listarElementosDeRegistro() {
        // filtramos los odontogramas

        this.servicioPrestacion.getByPacienteElementosRegistro(this.paciente.id, true).subscribe(elementosRegistro => {

            this.elementosRegistro = elementosRegistro.filter(e => e.concepto.conceptId !== this.servicioPrestacion.elementosRegistros.odontograma);
        });
    }

    // Trae los cdas registrados para el paciente
    buscarCDAPacientes() {
        this.servicioPrestacion.getCDAByPaciente(this.paciente.id).subscribe(registros => {
            this.cdas = registros;
            this.listarLaboratorios();
            let otrasPrestaciones = [... this.cdas.filter(cda => cda.prestacion.snomed.conceptId !== '4241000179101')];
            let filtro = otrasPrestaciones.map(op => {
                op.id = op.cda_id;
                return {
                    data: op,
                    tipo: 'cda',
                    prestacion: op.prestacion.snomed,
                    profesional: op.profesional ? op.profesional : '',
                    fecha: op.fecha,
                    estado: 'validada'
                };
            });

            this.prestaciones = [...this.prestaciones, ...filtro];

            // vamos a ordenar la prestaciones por fecha
            this.prestaciones = this.prestaciones.sort(
                function (a, b) {
                    a = a.fecha;
                    b = b.fecha;
                    return b - a;
                });
        });
    }

    // Trae los medicamentos registrados para el paciente
    listarLaboratorios() {
        this.laboratorios = [... this.cdas.filter(cda => cda.prestacion.snomed.conceptId === '4241000179101')];

    }

    buscarTranformacion(transformado) {
        let listaCompleta = [... this.hallazgosNoActivos, ... this.problemasActivos];
        let hallazgoEncontrado = listaCompleta.find(h => h.evoluciones[0].idRegistro === transformado.evoluciones[0].idRegistroGenerado);
        if (hallazgoEncontrado) {
            return hallazgoEncontrado.concepto.term;
        } else {
            return '';
        }
    }



    getCantidadResultados(a: any) {
        // TODO: Implementar :joy:
    }

    filtroBuscador(key: any) {
        this.colapsado = true;
        this.filtroActual = key;
        this.problemasActivos = this.problemasActivosAux;
        this.hallazgosNoActivos = this.hallazgosNoActivosAux;
        this.hallazgosCronicos = this.hallazgosCronicosAux;
        if (this.filtroActual === 'hallazgo' || this.filtroActual === 'situación' || this.filtroActual === 'trastorno') {
            this.problemasActivos = this.problemasActivos.filter(h => {
                return h.concepto.semanticTag === this.filtroActual;
            });
            this.hallazgosNoActivos = this.hallazgosNoActivos.filter(h => {
                return h.concepto.semanticTag === this.filtroActual;
            });
            this.hallazgosCronicos = this.hallazgosCronicos.filter(h => {
                return h.concepto.semanticTag === this.filtroActual;
            });
        } else {
            if (this.filtroActual === 'laboratorios') {
                this.listarLaboratorios();
            }

        }
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
        // TODO: Implementar :joy:
    }

}
