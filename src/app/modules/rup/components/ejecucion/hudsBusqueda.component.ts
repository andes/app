import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { AfterContentInit, Component, EventEmitter, Input, Optional, Output, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SECCION_CLASIFICACION } from 'src/app/modules/epidemiologia/constantes';
import { FormsEpidemiologiaService } from 'src/app/modules/epidemiologia/services/ficha-epidemiologia.service';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { gtag } from '../../../../shared/services/analytics.service';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { getSemanticClass } from '../../pipes/semantic-class.pipes';
import { IPSService } from '../../services/dominios-nacionales.service';
import { EmitConcepto, RupEjecucionService } from '../../services/ejecucion.service';
import { HUDSService } from '../../services/huds.service';
import { PrestacionesService } from './../../services/prestaciones.service';


@Component({
    selector: 'rup-hudsBusqueda',
    templateUrl: 'hudsBusqueda.html',
    styleUrls: ['hudsBusqueda.scss', 'buscador.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class HudsBusquedaComponent implements AfterContentInit {
    laboratoriosFS: any;
    laboratorios: any = [];
    vacunas: any = [];
    ordenDesc = true;
    searchTerm: string;
    hallazgosCronicosAux: any[];
    hallazgosNoActivosAux: any;
    filtroActual: any = 'planes';

    solicitudesMezcladas = [];

    public loading = false;

    public cdas = [];

    public dominios$: Observable<any[]>;

    @Input() paciente: any;

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
        this._prestaciones = value.sort((a, b) => {
            return moment(b.fecha).diff(a.fecha);
        });
    }

    public todos: any = [];
    public solicitudes: any = [];
    public solicitudesTOP: any = [];

    /**
     * Listado de todos los trastornos
     */
    public hallazgosCronicos: any = [];

    /**
         * Listado de todos los hallazgos no activos
         */
    public hallazgosNoActivos: any = [];
    public fechaInicio;
    public fechaFin;
    public ambitoOrigen;
    public organizaciones = [];
    public organizacionSeleccionada;
    public showFiltros = false;
    public filtrosAmbitos = [
        { key: 'ambulatorio', label: 'Ambulatorio' },
        { key: 'internacion', label: 'Internación' }
    ];
    public conceptos = {
        hallazgo: ['hallazgo', 'situación', 'evento'],
        trastorno: ['trastorno'],
        procedimiento: ['procedimiento', 'entidad observable', 'régimen/tratamiento'],
        plan: ['procedimiento', 'régimen/tratamiento'],
        producto: ['producto', 'objeto físico', 'medicamento clínico', 'fármaco de uso clínico'],
        elementoderegistro: ['elemento de registro'],
        laboratorios: ['laboratorios'],
        vacunas: ['vacunas'],
        dominios: ['dominios']
    };
    public prestacionesTotales;
    public registrosTotales = {
        procedimiento: [],
        hallazgo: [],
        trastorno: [],
        producto: []
    };

    public registrosTotalesCopia = {
        procedimiento: [],
        hallazgo: [],
        trastorno: [],
        producto: []
    };

    public dominios = [];

    public txtABuscar;

    constructor(
        public servicioPrestacion: PrestacionesService,
        public plex: Plex,
        public auth: Auth,
        public huds: HUDSService,
        private formEpidemiologiaService: FormsEpidemiologiaService,
        public ipsService: IPSService,
        @Optional() private ejecucionService: RupEjecucionService
    ) {
    }

    /**
     * buscamos y listamos las prestaciones o hallazgos del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngAfterContentInit() {
        if (this.paciente) {
            this.listarPrestaciones();
            this.listarConceptos();
            this.listarDominios();
        }
        const token = this.huds.getHudsToken();
        // Cuando se inicia una prestación debemos volver a consultar si hay CDA nuevos al ratito.
        // [TODO] Ser notificado via websockets
        setTimeout(() => {
            this.buscarCDAPacientes(token);
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

    agregarRegistro(registro) {
        if (this.ejecucionService) {
            const data: EmitConcepto = {
                concepto: registro.concepto,
                esSolicitud: false,
                valor: {
                    idRegistroOrigen: registro.evoluciones[0].idRegistro
                }
            };
            this.ejecucionService.agregarConcepto(data.concepto, false, null, data.valor);
        }
    }


    emitTabs(registro, tipo, index: number) {
        switch (tipo) {
            case 'concepto':
                gtag('huds-open', tipo, registro.concepto.term, index);
                registro.class = getSemanticClass(registro.concepto, false);
                if (registro.esSolicitud) {
                    registro.tipo = 'solicitud';
                    registro.class = 'plan';
                }
                break;
            case 'rup-group':
                registro = registro.data;
                registro.class = 'plan';
                break;
            case 'rup':
                gtag('huds-open', tipo, registro.prestacion.term, index);
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
                gtag('huds-open', tipo, registro.prestacion.term, index);
                registro = registro.data;
                registro.class = 'plan';
                break;
            case 'solicitud':
                gtag('huds-open', tipo, registro.solicitud.registros[0].concepto.term, index);
                registro.tipo = 'solicitud';
                registro.class = 'plan';
                break;
            case 'ficha-epidemiologica':
                gtag('huds-open', tipo, registro.prestacion.term, index);
                registro = registro.data;
                registro.tipo = 'ficha-epidemiologica';
                registro.class = 'plan';
                break;
            case 'dominio':
                gtag('huds-open', tipo, registro.name, index);
                const params = {
                    custodian: registro.identifier.value,
                    id: this.paciente.id
                };
                registro.tipo = tipo;
                registro.class = 'plan';
                registro.params = params;
                break;
        }

        this.huds.toogle(registro, tipo);
    }

    listarPrestaciones() {

        function groupBy(prestaciones: IPrestacion[]) {
            const resultado = [];
            const diccionario = {};

            prestaciones.forEach(p => {
                if (p.groupId) {
                    if (!diccionario[p.groupId]) {
                        diccionario[p.groupId] = [];
                    }
                    diccionario[p.groupId].push(p);
                } else {
                    resultado.push(p);
                }
            });

            Object.values(diccionario).forEach(dc => resultado.push(dc));

            return resultado;

        }


        this.servicioPrestacion.getByPaciente(this.paciente.id, false).subscribe(prestaciones => {
            this.prestacionesTotales = prestaciones;
            const validadas = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
            this.prestaciones = groupBy(validadas).map(p => {
                if (Array.isArray(p)) {
                    return {
                        data: p,
                        tipo: 'rup-group',
                        prestacion: p[0].solicitud.tipoPrestacion,
                        profesional: p[0].estadoActual.createdBy.nombreCompleto,
                        fecha: p[0].ejecucion.fecha || p[0].estadoActual.createdAt,
                        estado: p[0].estadoActual.tipo,
                        ambito: p[0].solicitud.ambitoOrigen,
                        organizacion: p[0].solicitud.organizacion.id
                    };
                } else {
                    const lastState = p.estados[p.estados.length - 1];
                    return {
                        data: p,
                        tipo: 'rup',
                        prestacion: p.solicitud.tipoPrestacion,
                        profesional: lastState.createdBy.nombreCompleto,
                        fecha: p.ejecucion.fecha || lastState.createdAt,
                        estado: lastState.tipo,
                        ambito: p.solicitud.ambitoOrigen,
                        organizacion: p.solicitud.organizacion.id
                    };
                }
            });
            this.prestacionesCopia = this.prestaciones.slice();
            this.setAmbitoOrigen('ambulatorio');
            this.tiposPrestacion = this._prestaciones.map(p => p.prestacion);
            this.organizaciones = this.prestaciones.filter(p => p.data.ejecucion?.organizacion);
            this.organizaciones = this.organizaciones.map(o => o.data.ejecucion.organizacion);
            this.buscarCDAPacientes(this.huds.getHudsToken());
            this.buscarFichasEpidemiologicas();

        });
    }

    // Trae los hallazgos
    listarConceptos() {
        this.servicioPrestacion.getConceptosByPaciente(this.paciente.id, true).subscribe(registros => {
            this.todos = registros;

            this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id).subscribe((hallazgos) => {
                this.registrosTotales.hallazgo = hallazgos;
                this.registrosTotalesCopia.hallazgo = hallazgos;
                // this.hallazgos = hallazgos;
            });

            this.servicioPrestacion.getByPacienteTrastorno(this.paciente.id).subscribe((trastornos) => {
                this.registrosTotales.trastorno = trastornos;
                this.registrosTotalesCopia.trastorno = trastornos;
            });

            this.servicioPrestacion.getByPacienteMedicamento(this.paciente.id).subscribe((medicamentos) => {
                this.registrosTotales.producto = medicamentos;
                this.registrosTotalesCopia.producto = medicamentos;
            });

            this.servicioPrestacion.getByPacienteProcedimiento(this.paciente.id).subscribe((procedimientos) => {
                this.registrosTotales.procedimiento = procedimientos;
                this.registrosTotalesCopia.procedimiento = procedimientos;

            });

            this.servicioPrestacion.getByPacienteSolicitud(this.paciente.id).subscribe((solicitudes) => {

                solicitudes.forEach(solicitud => {
                    const prestacion = this.prestacionesTotales.find(p => solicitud.idPrestacion === p.solicitud.prestacionOrigen && solicitud.concepto.conceptId === p.solicitud.tipoPrestacion.conceptId);
                    if (prestacion) {
                        solicitud['dataPrestacion'] = prestacion;
                        solicitud['estadoActual'] = prestacion.estadoActual;
                    }
                });
                this.solicitudes = solicitudes;
                this.servicioPrestacion.getSolicitudes({ idPaciente: this.paciente.id, origen: 'top' }).subscribe((solicitudesTOP) => {
                    this.solicitudesTOP = solicitudesTOP;
                    this.cargarSolicitudesMezcladas();
                });
            });
        });
    }

    listarDominios() {
        this.dominios$ = this.ipsService.getDominiosIdPaciente(this.paciente.id).pipe(
            tap((dominios) => {
                this.dominios = dominios;
            })
        );
    }

    private cargarSolicitudesMezcladas() {
        this.solicitudesMezcladas = this.solicitudes.concat(this.solicitudesTOP);

        this.solicitudesMezcladas.sort((e1, e2) => {
            const fecha1 = e1.fechaEjecucion ? e1.fechaEjecucion : e1.solicitud.fecha;
            const fecha2 = e2.fechaEjecucion ? e2.fechaEjecucion : e2.solicitud.fecha;
            return fecha2 - fecha1;
        });
    }



    // Trae los cdas registrados para el paciente
    buscarCDAPacientes(token) {

        this.servicioPrestacion.getCDAByPaciente(this.paciente.id, token).subscribe(registros => {
            this.cdas = registros.map(cda => {
                cda.id = cda.cda_id;
                return {
                    data: cda,
                    tipo: 'cda',
                    prestacion: cda.prestacion.snomed,
                    profesional: cda.profesional ? `${cda.profesional.apellido} ${cda.profesional.nombre}` : '',
                    fecha: cda.fecha,
                    estado: 'validada',
                    ambito: 'ambulatorio',
                    organizacion: cda.organizacion.id
                };
            });
            this.prestaciones = this.prestacionesCopia;
            // filtramos las vacunas y laboratorios por ahora para que se listan por separado
            this.vacunas = this.cdas.filter(cda => cda.prestacion.conceptId === ConceptosTurneablesService.Vacunas_CDA_ID);
            this.laboratorios = this.cdas.filter(cda => cda.prestacion.conceptId === ConceptosTurneablesService.Laboratorio_CDA_ID
                                                    || cda.prestacion.conceptId === ConceptosTurneablesService.Laboratorio_SISA_CDA_ID);

            // DEjamos el resto de los CDAS y los unimos a las prestaciones
            const filtro = this.cdas.filter(cda => {
                return cda.prestacion.conceptId !== ConceptosTurneablesService.Vacunas_CDA_ID
                    && cda.prestacion.conceptId !== ConceptosTurneablesService.Laboratorio_CDA_ID
                    && cda.prestacion.conceptId !== ConceptosTurneablesService.Laboratorio_SISA_CDA_ID;
            });
            // Filtramos por CDA para poder recargar los estudiosc
            this.prestaciones = [...this.prestaciones.filter(e => e.tipo !== 'cda'), ...filtro];
            this.tiposPrestacion = this._prestaciones.map(p => p.prestacion);
            this.prestacionesCopia = this.prestaciones.slice();
            this.filtrar();
        });
    }

    buscarFichasEpidemiologicas() {
        this.formEpidemiologiaService.search({ paciente: this.paciente.id }).subscribe(fichas => {
            if (fichas.length) {
                const fichasEpidemiologia = fichas.map(f => {
                    const usuarioConfirma = this.formEpidemiologiaService.getField(f, SECCION_CLASIFICACION, 'usuarioconfirma');
                    const usuarioPcr = this.formEpidemiologiaService.getField(f, SECCION_CLASIFICACION, 'usuariopcr');
                    return {
                        data: f,
                        tipo: 'ficha-epidemiologica',
                        ambito: 'ambulatorio',
                        prestacion: {
                            term: `Ficha Epidemiológica ${f.type.name}`
                        },
                        profesional: usuarioConfirma || usuarioPcr || f.createdBy.nombreCompleto,
                        fecha: f.createdAt,
                        estado: this.formEpidemiologiaService.getClasificacionFinal(f)
                    };
                });
                this.prestaciones = this.prestacionesCopia;
                this.prestaciones = [...this.prestaciones, ...fichasEpidemiologia];

                this.tiposPrestacion = this._prestaciones.map(p => p.prestacion);
                this.prestacionesCopia = this.prestaciones.slice();
                this.filtrar();
            }
        });
    }

    getCantidadResultados(type: any) {
        switch (type) {
            case 'todos':
                return this.todos.length;
            case 'hallazgo':
                return this.registrosTotalesCopia.hallazgo.length;
            case 'trastorno':
                return this.registrosTotalesCopia.trastorno.length;
            case 'procedimiento':
                return this.registrosTotalesCopia.procedimiento.length;
            case 'planes':
                return this.prestacionesCopia.length;
            case 'producto':
                return this.registrosTotalesCopia.producto.length;
            case 'laboratorios':
                return this.laboratorios.length;
            case 'vacunas':
                return this.vacunas.length;
            case 'solicitudes':
                return this.solicitudesMezcladas.length;
            case 'dominios':
                return this.dominios.length;
        }
    }

    filtroBuscador(key: any) {
        this.filtroActual = key;
        if (key === 'planes') {
            this.setAmbitoOrigen('ambulatorio');
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


    filtrar() {
        this.prestaciones = this.prestacionesCopia.slice();
        if (this.prestacionSeleccionada && this.prestacionSeleccionada.length > 0) {
            const prestacionesTemp = this.prestacionSeleccionada.map(e => e.conceptId);
            this.prestaciones = this.prestaciones.filter(p => prestacionesTemp.find(e => e === p.prestacion.conceptId));
        }

        if (this.fechaInicio || this.fechaFin) {
            this.fechaInicio = this.fechaInicio ? this.fechaInicio : new Date();
            this.fechaFin = this.fechaFin ? this.fechaFin : new Date();
            this.prestaciones = this.prestaciones.filter(p => p.fecha >= moment(this.fechaInicio).startOf('day').toDate() &&
                p.fecha <= moment(this.fechaFin).endOf('day').toDate());
        }

        if (this.ambitoOrigen) {
            this.prestaciones = this.prestaciones.filter(p => p.ambito === this.ambitoOrigen);
        }

        if (this.organizacionSeleccionada) {
            this.prestaciones = this.prestaciones.filter(p => p.organizacion === this.organizacionSeleccionada.id);
        }

        this.tiposPrestacion = this._prestaciones.map(p => p.prestacion);
    }

    setAmbitoOrigen(ambitoOrigen) {
        this.ambitoOrigen = ambitoOrigen;
        this.filtrar();
    }

    clickSolicitud(registro, index) {
        this.emitTabs(registro, (registro.evoluciones ? 'concepto' : 'solicitud'), index);
    }

    filtrarPorTerm(p) {

        if (p.concepto.term.includes(this.searchTerm.toLowerCase())) {

            return true;

        } else {

            return p.registros.some(r => this.filtrarPorTerm(r));
        }
    }

    buscar() {

        this.registrosTotales[this.filtroActual] = this.registrosTotalesCopia[this.filtroActual];

        if (this.searchTerm) {

            this.registrosTotales[this.filtroActual] = this.registrosTotales[this.filtroActual].filter
            (p => this.filtrarPorTerm(p));
        }
    }

}
