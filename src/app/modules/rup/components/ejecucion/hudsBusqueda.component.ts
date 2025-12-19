import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { AfterContentInit, Component, EventEmitter, Input, OnInit, Optional, Output, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { LaboratorioService } from 'src/app/services/laboratorio.service';
import { RecetaService } from 'src/app/services/receta.service';
import { Observable, forkJoin } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { InternacionResumenHTTP } from 'src/app/apps/rup/mapa-camas/services/resumen-internacion.http';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { SECCION_CLASIFICACION } from 'src/app/modules/epidemiologia/constantes';
import { FormsEpidemiologiaService } from 'src/app/modules/epidemiologia/services/ficha-epidemiologia.service';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { ProfesionalService } from 'src/app/services/profesional.service';
import { gtag } from '../../../../shared/services/analytics.service';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { getSemanticClass } from '../../pipes/semantic-class.pipes';
import { EmitConcepto, RupEjecucionService } from '../../services/ejecucion.service';
import { HUDSService } from '../../services/huds.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { InformeEstadisticaService } from '../../services/informe-estadistica.service';
import { IInformeEstadistica } from '../../interfaces/informe-estadistica.interface';


interface IInternacionExtendida {
    id: string;
    fechaIngreso: any;
    fechaEgreso: any;
    paciente?: any;
    esEstadistica?: boolean;
    informesEstadisticos?: IInformeEstadistica[];
    registros?: any[];
    ambito?: string;
    ingreso?: any;
    organizacion?: any;
    tipo_egreso?: string | null;
    [key: string]: any;
}
@Component({
    selector: 'rup-hudsBusqueda',
    templateUrl: 'hudsBusqueda.html',
    styleUrls: ['hudsBusqueda.scss', 'buscador.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HudsBusquedaComponent implements AfterContentInit, OnInit {
    laboratoriosFS: any;
    laboratorios: any = [];
    vacunas: any = [];
    ordenDesc = true;
    searchTerm: string;
    hallazgosCronicosAux: any[];
    hallazgosNoActivosAux: any;
    filtroActual;
    filtroTrastornos = true;

    solicitudesMezcladas = [];

    public loading = false;

    public cdas = [];
    public informe: IInformeEstadistica[] = [];

    @Input() paciente: IPaciente;
    @Input() vistaHuds = false;
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
    // private internaciones;
    private internaciones: IInternacionExtendida[] = [];


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
    };
    public prestacionesTotales;
    public registrosTotales = {
        procedimiento: [],
        hallazgo: [],
        trastorno: [],
        producto: [],
        registro: []
    };

    public registrosTotalesCopia = {
        procedimiento: [],
        hallazgo: [],
        trastorno: [],
        producto: [],
        registro: []
    };

    public profesional;
    public profesionalValido;
    public filtroRegistrosTrastornos;
    public txtABuscar;
    public efectorRestringido = this.auth.check('huds:soloEfectorActual');
    public indiceInternaciones;
    public otrasPrestaciones: any = { registros: [] };
    public filtroRecetas;
    public searchRecetas;
    public busquedaRecetas;
    public motivosSuspension;
    public motivoSuspensionSelector;
    public seleccionRecetas = [];
    public seleccionSuspender = [];
    /**
     * Ids correspondientes a Prescripción de Medicamentos y Seguimiento Hídrico respectivamente
     */
    public planIndicaciones = ['33633005', '430147008'];

    public filtros = [
        { key: 'planes', titulo: 'prestaciones', icono: 'clipboard-check-outline' },
        { key: 'solicitudes', titulo: 'solicitudes', icono: 'mano-corazon' },
        { key: 'hallazgo', titulo: 'hallazgos', icono: 'hallazgo' },
        { key: 'trastorno', titulo: 'trastornos', icono: 'trastorno' },
        { key: 'registro', titulo: 'elemento de registro ', icono: 'documento-lapiz' },
        { key: 'procedimiento', titulo: 'procedimientos', icono: 'termometro' },
        { key: 'recetas', titulo: 'recetas', icono: 'listado-receta' },
        { key: 'producto', titulo: 'productos', icono: 'pildoras' },
        { key: 'laboratorios', titulo: 'laboratorios', icono: 'recipiente' },
        { key: 'vacunas', titulo: 'vacunas', icono: 'vacuna' }
    ];

    public estadoReceta = {
        vigente: 'success',
        finalizada: 'success',
        suspendida: 'danger',
        vencida: 'danger',
        rechazada: 'danger',
        pendiente: 'info'
    } as { [key: string]: string };
    public recetaVisibleSidebar: any;
    public estadoDispensa = {
        'sin-dispensa': 'info',
        'dispensada': 'success',
        'dispensa-parcial': 'warning'
    } as { [key: string]: string };
    public permisosCompletos;
    public permisosParciales;
    public permisosLab;
    public permisosVac;
    public permisosRec;

    constructor(
        public servicioPrestacion: PrestacionesService,
        public plex: Plex,
        public auth: Auth,
        public huds: HUDSService,
        private formEpidemiologiaService: FormsEpidemiologiaService,
        private resumenHTTP: InternacionResumenHTTP,
        @Optional() private ejecucionService: RupEjecucionService,
        private pacienteService: PacienteService,
        private laboratorioService: LaboratorioService,
        private recetasService: RecetaService,
        private profesionalService: ProfesionalService,
        private informeEstadisticaService: InformeEstadisticaService,
    ) {
    }

    /**
     * buscamos y listamos las prestaciones o hallazgos del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngAfterContentInit() {
        if (this.paciente) {
            this.listarConceptos();

            forkJoin({
                internaciones: this.listarInternaciones(),
                prestaciones: this.listarPrestaciones(),
                informes: this.listarInformeEstadistico()
            }).subscribe(() => {
                this.mergeInternacionesConInformes();

                if (this.internaciones && this.internaciones.length > 0) {
                    this.setAmbitoOrigen('internacion');
                } else {
                    this.setAmbitoOrigen('ambulatorio');
                }
            });
        }
        const token = this.huds.getHudsToken();
        setTimeout(() => {
            this.buscarCDAPacientes(token);
        }, 1000 * 30);
    }

    ngOnInit() {
        this.groupRecetas();
        this.getProfesional();
        this.permisosCompletos = this.auth.check('huds:visualizacionHuds');
        this.permisosParciales = this.auth.check('huds:visualizacionParcialHuds:*');
        this.permisosLab = this.auth.check('huds:visualizacionParcialHuds:laboratorio');
        this.permisosVac = this.auth.check('huds:visualizacionParcialHuds:vacuna');
        this.permisosRec = this.auth.check('huds:visualizacionParcialHuds:receta');

        this.filtroActual = this.permisosCompletos ? 'trastorno' :
            (this.permisosParciales || this.permisosLab) ? 'laboratorios' :
                this.permisosVac ? 'vacunas' :
                    'recetas';
    }

    getTitulo(filtroactual) {
        return this.filtros.find(filtro => filtro.key === filtroactual)?.titulo;
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
            case 'internacion':
                gtag('huds-open', 'rup', 'internacion', index);
                registro.id = registro.id;
                registro.tipo = 'internacion';
                registro.index = index;
                break;
            case 'laboratorio':
                gtag('huds-open', tipo, 'laboratorio', index);
                break;
            case 'receta':
                gtag('huds-open', tipo, 'receta', index);
                registro.tipo = 'receta';
                registro.index = index;
                break;
        }

        this.huds.toogle(registro, tipo);
    }

    getPacientePrincipal(id): Observable<IPaciente> {
        return this.pacienteService.getById(id);
    }

    // modificaciones para el pdf y huds

    listarInformeEstadistico() {
        return this.informeEstadisticaService.getByPaciente(
            this.paciente.id,
            false,
            this.fechaInicio,
            this.fechaFin
        ).pipe(tap((informe) => {
            const informesFiltrados = informe.filter(inf => {
                const idPacienteInforme = inf.paciente?.id || (inf.paciente as any)?._id;
                return idPacienteInforme === this.paciente.id;
            });


            this.informe = informesFiltrados;
        }));
    }
    // modificaciones para el pdf y huds

    mergeInternacionesConInformes() {
        const base: IInternacionExtendida[] = this.internaciones || [];
        const informes: IInformeEstadistica[] = this.informe || [];

        const internacionesPorId = new Map<string, IInternacionExtendida>(
            base.map(i => [i.id, i])
        );

        const internacionesResultantes: IInternacionExtendida[] = [...base];

        for (const inf of informes) {

            const idInternacionReal = inf._id || inf.id;

            const existente = internacionesPorId.get(idInternacionReal);

            if (!existente) {

                const nuevaInternacion: IInternacionExtendida = {
                    id: idInternacionReal,
                    fechaIngreso: inf.informeIngreso?.fechaIngreso || null,
                    fechaEgreso: inf.informeEgreso?.fechaEgreso || null,
                    paciente: inf.paciente,
                    esEstadistica: true,
                    informesEstadisticos: [inf],

                    registros: [],
                    ambito: 'internacion',
                    ingreso: null,
                    organizacion: inf.organizacion || null,
                    tipo_egreso: null,
                    createdAt: inf.createdAt || null
                };

                internacionesResultantes.push(nuevaInternacion);
                internacionesPorId.set(idInternacionReal, nuevaInternacion);

            } else {

                if (!existente.informesEstadisticos) {
                    existente.informesEstadisticos = [];
                }

                existente.informesEstadisticos.push(inf);
            }
        }

        this.internaciones = internacionesResultantes;
    }
    // modificaciones para el pdf y huds

    mezclarInformes(informes) {
        this.internaciones = this.internaciones.map(int => {
            const informe = informes.find(i => i.idInternacion === int.id);

            if (informe) {
                int.registros = [
                    ...int.registros,
                    {
                        term: 'Informe Estadístico',
                        conceptId: null,
                        tipo: 'informe-estadistico',
                        data: informe
                    }
                ];
            }

            return int;
        });
    }

    listarInternaciones() {
        let request;
        if (this.paciente.idPacientePrincipal) {
            request = this.getPacientePrincipal(this.paciente.idPacientePrincipal).pipe(
                switchMap((paciente: IPaciente) => this.resumenHTTP.search({
                    ingreso: this.resumenHTTP.queryDateParams(this.fechaInicio, this.fechaFin),
                    paciente: paciente.vinculos
                }))
            );
        } else {
            request = this.resumenHTTP.search({
                ingreso: this.resumenHTTP.queryDateParams(this.fechaInicio, this.fechaFin),
                paciente: this.paciente.vinculos || this.paciente.id
            });
        }

        return request.pipe(tap((internaciones: any) => {
            this.internaciones = internaciones;
        }));
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


        return this.servicioPrestacion.getByPaciente(this.paciente.id, false).pipe(tap(prestaciones => {
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
            // this.setAmbitoOrigen('ambulatorio');
            this.tiposPrestacion = this._prestaciones.map(p => p.prestacion);
            this.organizaciones = this.prestaciones.filter(p => p.data.ejecucion?.organizacion);
            this.organizaciones = this.organizaciones.map(o => o.data.ejecucion.organizacion);
            this.buscarCDAPacientes(this.huds.getHudsToken());
            this.buscarFichasEpidemiologicas();

        }));
    }

    // Trae los hallazgos
    listarConceptos() {
        this.servicioPrestacion.getConceptosByPaciente(this.paciente.id, true).subscribe(registros => {
            this.todos = registros;

            this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id).subscribe((hallazgos) => {
                this.registrosTotales.hallazgo = hallazgos;
                this.registrosTotalesCopia.hallazgo = hallazgos;
            });

            this.servicioPrestacion.getByPacienteTrastorno(this.paciente.id).subscribe((trastornos) => {
                this.registrosTotalesCopia.trastorno = trastornos;
                this.filtrarTrastornos();
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
                    const prestacion = this.prestacionesTotales?.find(p => solicitud.idPrestacion === p.solicitud.prestacionOrigen && solicitud.concepto.conceptId === p.solicitud.tipoPrestacion.conceptId);
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

            this.servicioPrestacion.getByPacienteElementoRegistros(this.paciente.id).subscribe((registro) => {
                this.registrosTotales.registro = registro;
                this.registrosTotalesCopia.registro = registro;
            });
        });
    }

    private cargarSolicitudesMezcladas() {
        this.solicitudesMezcladas = this.solicitudes.concat(this.solicitudesTOP);

        this.solicitudesMezcladas.sort((e1, e2) => {
            const fecha1 = e1.fechaEjecucion ? e1.fechaEjecucion : e1.solicitud.fecha;
            const fecha2 = e2.fechaEjecucion ? e2.fechaEjecucion : e2.solicitud.fecha;
            return fecha2 - fecha1;
        });
    }

    private ordenarLaboratorios(laboratorios, protocolos) {
        const listaProtocolos = protocolos[0]?.Data;
        const listado = listaProtocolos ? [...laboratorios, ...listaProtocolos] : [...laboratorios];

        return listado.sort((a, b) => {
            const fechaA = moment(a.fecha);
            const fechaB = moment(b.fecha);
            return fechaB.diff(fechaA);
        });

    }

    // Trae los cdas registrados para el paciente
    buscarCDAPacientes(token) {
        forkJoin({
            protocolos: this.laboratorioService.getProtocolos(this.paciente.id),
            cdaByPaciente: this.servicioPrestacion.getCDAByPaciente(this.paciente.id, token)
        }).subscribe({
            next: (resultados) => {
                const protocolos = resultados.protocolos || [];
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

                    this.laboratorios = this.ordenarLaboratorios(this.laboratorios, protocolos);

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
                // Contar prestaciones en internaciones combinadas
                let totalPrestaciones = 0;
                if (this.indiceInternaciones && this.indiceInternaciones.length > 0) {
                    this.indiceInternaciones.forEach((internacion: any) => {
                        internacion.registros.forEach((registro: any) => {
                            if (registro.otras) {
                                totalPrestaciones += Object.keys(registro.otras).length;
                            } else {
                                totalPrestaciones++;
                            }
                        });
                    });
                }
                if (this.otrasPrestaciones?.registros?.length) {
                    totalPrestaciones += this.otrasPrestaciones.registros.length;
                }
                return totalPrestaciones;
            case 'producto':
                return this.registrosTotalesCopia.producto.length;
            case 'laboratorios':
                return this.laboratorios.length;
            case 'vacunas':
                return this.vacunas.length;
            case 'solicitudes':
                return this.solicitudesMezcladas.length;
            case 'recetas':
                return this.busquedaRecetas?.length;
            case 'registro':
                return this.registrosTotalesCopia.registro.length;
        }
    }

    filtroBuscador(key: any) {
        this.searchTerm = null;
        this.filtroActual = key;
        if (key === 'planes') {
            this.setAmbitoOrigen('ambulatorio');
        }
    }

    mostrarItem(item) {
        if (this.permisosCompletos) {
            return true;
        } else if (item.key === 'laboratorios' && (this.permisosLab || this.permisosParciales)) {
            return true;
        } else if (item.key === 'vacunas' && (this.permisosVac || this.permisosParciales)) {
            return true;
        } else if (item.key === 'recetas' && (this.permisosRec || this.permisosParciales)) {
            return true;
        }
        return false;
    }

    filtrarTrastornos() {
        this.searchTerm = null;

        if (!this.filtroTrastornos) {
            this.registrosTotales.trastorno = this.registrosTotalesCopia.trastorno;
            this.filtroRegistrosTrastornos = this.registrosTotalesCopia.trastorno;
        } else {
            this.registrosTotales.trastorno = this.registrosTotalesCopia.trastorno.filter((registro) => registro.evoluciones[0].estado === 'activo');
            this.filtroRegistrosTrastornos = this.registrosTotales.trastorno;
        }
    }

    getSemanticTagFiltros() {
        let filtro = (this.conceptos[this.filtroActual]) ? this.conceptos[this.filtroActual] : null;

        // si estamos en buscador basico nos fijamos si el filtro seleccionado es planes
        // o bien, si estamos en el buscador guiado, si la opcion desplegada es planes
        // entonces sobreescribmos el filtro a emitir como ['planes']
        if (this.filtroActual === 'planes') {
            filtro = ['planes'];
        }

        return filtro;
    }

    filtrarOtrasPrestaciones(prestaciones, prestacionesEnInternacion) {
        const filtroPrestaciones = prestaciones.filter(prestacion =>
            !prestacionesEnInternacion.some(filtro => filtro.data.id === prestacion.data.id));

        const indiceRegistros = filtroPrestaciones.reduce((grupo, prestacion) => {
            const { solicitud: { tipoPrestacion: { conceptId, term } }, id, createdAt: fecha } = prestacion.data;
            const data = { conceptId, term, id, fecha };

            return ({
                indices: { ...grupo.indices, ['otras']: { ...grupo.indices['otras'], [data.id]: data } },
                registros: { ...grupo.registros, ['otras']: { ...grupo.registros['otras'], [data.id]: prestacion } }
            });
        }, { indices: {}, registros: {} });

        const fechas = filtroPrestaciones.map(({ data }) => data.estadoActual.createdAt);
        const fechaDesde = fechas[fechas.length - 1];
        const fechaHasta = fechas[0];

        this.otrasPrestaciones = { fechaDesde, fechaHasta, indices: Object.values(indiceRegistros.indices), registros: Object.values(indiceRegistros.registros) };
    }

    // modificaciones para el pdf y huds

    filtrarPorInternacion(prestaciones) {


        const prestacionesEnInternacion = [];

        // Importar las constantes SNOMED para ingreso y egreso
        const snomedIngreso = {
            fsn: 'documento de solicitud de admisión (elemento de registro)',
            semanticTag: 'elemento de registro',
            conceptId: '721915006',
            term: 'documento de solicitud de admisión'
        };

        const snomedEgreso = {
            fsn: 'alta del paciente (procedimiento)',
            semanticTag: 'procedimiento',
            conceptId: '58000006',
            term: 'alta del paciente'
        };

        const internaciones = this.internaciones?.map(internacion => {

            if (internacion.esEstadistica) {
                const registrosFormateados = {};

                internacion.informesEstadisticos?.forEach((informe, index) => {
                    const id = informe._id || informe.id;

                    const registrosRUP = [];

                    const origenString = informe.informeIngreso?.origen?.tipo ||
                        informe.informeIngreso?.origen?.organizacionOrigen?.nombre ||
                        informe.informeIngreso?.origen?.otraOrganizacion ||
                        'Consultorio externo';

                    registrosRUP.push({
                        id: `${id}-ingreso-registro`,
                        concepto: snomedIngreso,
                        nombre: snomedIngreso.term,
                        valor: {
                            informeIngreso: {
                                ...informe.informeIngreso,
                                origen: origenString,
                                situacionLaboral: informe.informeIngreso?.situacionLaboral?.nombre || '',
                                nivelInstruccion: informe.informeIngreso?.nivelInstruccion?.nombre || ''
                            }
                        }
                    });

                    if (informe.informeEgreso) {
                        registrosRUP.push({
                            id: `${id}-egreso-registro`,
                            concepto: snomedEgreso,
                            nombre: snomedEgreso.term,
                            valor: {
                                InformeEgreso: informe.informeEgreso
                            }
                        });
                    }

                    const registroCombinadoKey = `informe-estadistico-${id}`;
                    registrosFormateados[registroCombinadoKey] = {
                        prestacion: {
                            term: 'Informe Estadístico de Internación',
                            conceptId: '32485007' // internación
                        },
                        data: {
                            id: id,
                            estadoActual: {
                                createdAt: informe.informeIngreso?.fechaIngreso || informe.createdAt || new Date(),
                                createdBy: informe.createdBy || {}
                            },
                            solicitud: {
                                profesional: informe.createdBy || {},
                                organizacion: informe.organizacion || {},
                                ambitoOrigen: 'internacion'
                            },
                            unidadOrganizativa: {
                                term: informe.unidadOrganizativa?.term || 'Unidad Estadística'
                            },
                            paciente: informe.paciente,
                            ejecucion: {
                                registros: registrosRUP
                            },
                            _esInformeEstadistico: false
                        }
                    };
                });

                const prestacionesPorInternacion = prestaciones.filter(prestacion => {
                    const fechaIngresoValida = moment(prestacion.fecha).isSameOrAfter(internacion.fechaIngreso);
                    const fechaEgresoValida = internacion.fechaEgreso ? moment(prestacion.fecha).isSameOrBefore(internacion.fechaEgreso) : moment(prestacion.fecha).isSameOrBefore(moment().toDate());
                    const organizacionValida = internacion.organizacion._id === prestacion.organizacion || internacion.organizacion.id === prestacion.organizacion;

                    if (fechaIngresoValida && fechaEgresoValida && organizacionValida) {
                        prestacionesEnInternacion.push(prestacion);
                        return prestacion;
                    } else { return null; }
                });


                prestacionesPorInternacion.forEach(prestacion => {
                    registrosFormateados[prestacion.data.id] = {
                        prestacion: prestacion.prestacion,
                        data: prestacion.data
                    };
                });

                const resultado = {
                    id: internacion.id,
                    fechaIngreso: internacion.fechaIngreso,
                    fechaEgreso: internacion.fechaEgreso,
                    organizacion: internacion.organizacion?.nombre || 'Organización Estadística',
                    registros: [{
                        otras: registrosFormateados
                    }]
                };

                return resultado;
            }

            const prestacionesPorInternacion = prestaciones.filter(prestacion => {
                const fechaIngresoValida = moment(prestacion.fecha).isSameOrAfter(internacion.fechaIngreso);
                const fechaEgresoValida = internacion.fechaEgreso ? moment(prestacion.fecha).isSameOrBefore(internacion.fechaEgreso) : moment(prestacion.fecha).isSameOrBefore(moment().toDate());
                const organizacionValida = internacion.organizacion.id === prestacion.organizacion;

                if (fechaIngresoValida && fechaEgresoValida && organizacionValida) {
                    prestacionesEnInternacion.push(prestacion);

                    return prestacion;
                } else { return null; }
            });

            const indicePrestaciones = prestacionesPorInternacion.reduce((grupo, prestacion) => {
                return ({ ...grupo, [prestacion.data.id]: prestacion });
            }, {});

            const registros = prestacionesPorInternacion.flatMap((prestacion) => prestacion.data.ejecucion.registros);

            const grupoRegistros = registros.reduce((grupo, registro) => {
                const dataRegistro = { conceptId: registro.concepto.conceptId, term: registro.concepto.term, id: registro.id, idPrestacion: registro.idPrestacion };

                if (this.planIndicaciones.includes(registro.concepto.conceptId)) {
                    return ({ ...grupo, [registro.concepto.conceptId]: dataRegistro });
                }

                return ({ ...grupo, ['otras']: { ...grupo['otras'], [registro.idPrestacion]: { ...indicePrestaciones[registro.idPrestacion] } } });
            }, {});

            return {
                id: internacion.id,
                fechaIngreso: internacion.fechaIngreso,
                fechaEgreso: internacion.fechaEgreso,
                organizacion: internacion.organizacion.nombre,
                registros: Object.values(grupoRegistros)
            };
        })
            .filter(grupo => grupo.registros.length);

        internaciones.forEach((int, idx) => {
            const ingreso = int.fechaIngreso ? new Date(int.fechaIngreso).toLocaleString() : 'sin fecha';
            const egreso = int.fechaEgreso ? new Date(int.fechaEgreso).toLocaleString() : 'sin fecha';

        });
        const internacionesCombinadas = [];
        const procesadas = new Set();

        for (let i = 0; i < internaciones.length; i++) {
            if (procesadas.has(i)) { continue; }

            const internacionBase = internaciones[i];

            const otrasCombinadas: any = {};

            const registrosFinales = [];
            let otrasAcumuladas = {};

            internacionBase.registros.forEach((registro: any) => {
                if (registro.otras) {
                    otrasAcumuladas = { ...otrasAcumuladas, ...registro.otras };
                } else if (this.planIndicaciones.includes(registro.conceptId)) {
                    registrosFinales.push(registro);
                } else {
                    otrasAcumuladas = { ...otrasAcumuladas, ...registro };
                }
            });

            procesadas.add(i);

            for (let j = i + 1; j < internaciones.length; j++) {
                if (procesadas.has(j)) { continue; }

                const otraInternacion = internaciones[j];

                const mismoDia = moment(internacionBase.fechaIngreso).isSame(otraInternacion.fechaIngreso, 'day');
                const cercanas = Math.abs(moment(internacionBase.fechaIngreso).diff(otraInternacion.fechaIngreso, 'hours')) < 24;

                if (mismoDia || cercanas) {

                    otraInternacion.registros.forEach((registro: any) => {
                        if (registro.otras) {
                            otrasAcumuladas = { ...otrasAcumuladas, ...registro.otras };
                        } else if (this.planIndicaciones.includes(registro.conceptId)) {
                            registrosFinales.push(registro);
                        } else {
                            otrasAcumuladas = { ...otrasAcumuladas, ...registro };
                        }
                    });

                    procesadas.add(j);
                }
            }

            if (Object.keys(otrasAcumuladas).length > 0) {
                registrosFinales.push({ otras: otrasAcumuladas });
            }

            internacionesCombinadas.push({
                ...internacionBase,
                registros: registrosFinales
            });
        }

        this.indiceInternaciones = internacionesCombinadas?.reverse();

        this.filtrarOtrasPrestaciones(prestaciones, prestacionesEnInternacion);
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

            if (this.ambitoOrigen === 'internacion') {
                this.filtrarPorInternacion(this.prestaciones);
            }
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

    normalizarCadena(cadena) {
        return cadena
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    filtrarPorTerm(p) {
        const searchTermNormalizado = this.normalizarCadena(this.searchTerm);
        const conceptoTermNormalizado = this.normalizarCadena(p.concepto.term);

        return conceptoTermNormalizado.includes(searchTermNormalizado) ? true
            : p.registros.some(r => this.filtrarPorTerm(r));
    }

    buscar() {
        this.filtroActual !== 'trastorno' ?
            this.registrosTotales[this.filtroActual] = this.registrosTotalesCopia[this.filtroActual]
            :
            this.registrosTotales[this.filtroActual] = this.filtroRegistrosTrastornos;

        if (this.searchTerm) {
            this.registrosTotales[this.filtroActual] = this.registrosTotales[this.filtroActual].filter(p => this.filtrarPorTerm(p));
        }
    }

    filtrarRecetas() {
        const searchTerm = this.searchRecetas?.toLowerCase() || '';

        if (!searchTerm && !this.filtroRecetas) {
            this.groupRecetas();
            return;
        }

        let filteredRecetas = this.busquedaRecetas;

        if (searchTerm) {
            filteredRecetas = filteredRecetas.filter(group => {
                return group.recetas[0].medicamento.concepto.term.toLowerCase().includes(searchTerm);
            });
        }

        if (this.filtroRecetas) {
            filteredRecetas = filteredRecetas.reduce((acc, receta) => {
                const vigenteRecetas = receta.recetas.filter(r => r.estadoActual.tipo === 'vigente');
                if (vigenteRecetas.length > 0) {
                    acc.push({
                        conceptId: receta.conceptId,
                        recetas: vigenteRecetas,
                        recetaVisible: this.recetaVisible(vigenteRecetas)
                    });
                }
                return acc;
            }, []);
        }

        this.busquedaRecetas = filteredRecetas;
    }

    hasRegistrosTotales(filtro: string) {
        return !!this.registrosTotalesCopia[filtro]?.length;
    }

    async groupRecetas() {
        const estadoDispensa = ['sin-dispensa', 'dispensada', 'dispensa-parcial'].toString();
        const options = { pacienteId: this.paciente.id, estadoDispensa };

        this.recetasService.getMotivosSuspension().subscribe((motivos) => {
            this.motivosSuspension = motivos.map(m => ({ id: m.id, nombre: m.label }));
        });

        this.recetasService.getRecetas(options).subscribe((data) => {
            const grupoRecetas = data.reduce((acc, receta) => {
                const conceptId = receta.medicamento.concepto.conceptId;
                if (!acc[conceptId]) {
                    acc[conceptId] = [];
                }
                acc[conceptId].push(receta);
                return acc;
            }, {});

            this.busquedaRecetas = this.sortRecetas(
                Object.keys(grupoRecetas).map(key => ({
                    conceptId: key,
                    recetas: grupoRecetas[key],
                    recetaVisible: this.recetaVisible(grupoRecetas[key])

                }))
            );
        });
    }

    sortRecetas(recetas) {
        return recetas.sort((a, b) => {
            const dateA = a.recetas[0].fechaRegistro ? moment(a.recetas[0].fechaRegistro) : moment(a.recetas[0].createdAt);
            const dateB = b.recetas[0].fechaRegistro ? moment(b.recetas[0].fechaRegistro) : moment(b.recetas[0].createdAt);
            return dateB.diff(dateA);
        });
    }

    resetSeleccionRecetas() {
        this.groupRecetas();
        this.seleccionRecetas = [];
        this.seleccionSuspender = [];
    }

    openRecetaTab(group) {
        this.emitTabs(group, 'receta', 0);
    }

    esRecetaSeleccionable(receta) {
        const estadosPermitidos = ['vigente', 'pendiente'];
        const dispensasPermitidas = ['sin-dispensa', 'dispensa-parcial'];
        if (!receta.medicamento.tratamientoProlongado) {
            return (estadosPermitidos.includes(receta.estadoActual?.tipo)
                && dispensasPermitidas.includes(receta.estadoDispensaActual?.tipo)) && this.profesionalValido;
        } else {
            const recetasMismoRegistro = this.busquedaRecetas?.flatMap(grupo =>
                grupo.recetas.filter(r => r.idRegistro === receta.idRegistro && r.medicamento.concepto.conceptId === receta.medicamento.concepto.conceptId)
            ) || [];
            return recetasMismoRegistro.some(rec =>
                (estadosPermitidos.includes(rec.estadoActual?.tipo)
                    && dispensasPermitidas.includes(rec.estadoDispensaActual?.tipo)) && this.profesionalValido);
        }
    }

    getProfesional() {
        const profesionalId = this.auth.profesional;

        this.profesionalService.get({
            id: profesionalId
        }).subscribe((profesional) => {
            // Los codigos de los roles permitidos son los de las profesiones: Médico, Odontólogo y Obstetra respentivamente.
            const rolesPermitidos = [1, 2, 23];

            this.profesional = profesional[0];
            this.profesionalValido = rolesPermitidos.some(codigo =>
                this.profesional.formacionGrado?.some((formacion: { profesion: { codigo: number } }) => formacion.profesion.codigo === codigo)
            );
        });
    }

    seleccionarReceta(event, recetas, index) {
        const isSelected = event.value;
        let recetaSeleccionada = <any>[];
        const estadosNoSeleccionables = ['suspendida', 'vencida', 'dispensada'];
        setTimeout(() => {
            if (!this.recetaVisible(recetas).medicamento.tratamientoProlongado) {
                recetaSeleccionada = recetas
                    .filter(receta => receta.estadoActual.tipo === 'vigente')
                    .sort((a, b) => moment(b.fechaRegistro).diff(moment(a.fechaRegistro)))[0];

                if (isSelected) {
                    this.seleccionRecetas[index] = true;
                    this.seleccionSuspender.push(recetaSeleccionada);
                } else {
                    this.seleccionRecetas[index] = null;
                    this.seleccionSuspender = this.seleccionSuspender.filter(r => r.id !== recetaSeleccionada.id);
                }
            } else {
                if (isSelected) {
                    this.seleccionRecetas[index] = true;
                    this.seleccionSuspender.push(...recetas.filter(receta => !estadosNoSeleccionables.includes(receta.estadoDispensaActual.tipo) && !estadosNoSeleccionables.includes(receta.estadoActual.tipo)));
                } else {
                    this.seleccionRecetas[index] = null;
                    this.seleccionSuspender = this.seleccionSuspender.filter(
                        r => !recetas.some(receta => receta.id === r.id)
                    );
                }
            }
        }, 0);
    }

    recetaVisible(recetas) {
        return this.recetasService.getRecetaPrincipal(recetas);

    }
}
