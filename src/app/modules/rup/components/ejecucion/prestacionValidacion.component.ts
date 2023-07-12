import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, HostBinding, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, forkJoin, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SnomedService } from '../../../../apps/mitos';
import { HeaderPacienteComponent } from '../../../../components/paciente/headerPaciente.component';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { ITipoPrestacion } from '../../../../interfaces/ITipoPrestacion';
import { ConceptosTurneablesService } from '../../../../services/conceptos-turneables.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { ReglaService } from '../../../../services/top/reglas.service';
import { populateRelaciones, unPopulateRelaciones } from '../../operators/populate-relaciones';
import { CodificacionService } from '../../services/codificacion.service';
import { HUDSService } from '../../services/huds.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { PrestacionesService } from './../../services/prestaciones.service';


@Component({
    selector: 'rup-prestacionValidacion',
    templateUrl: 'prestacionValidacion.html',
    styleUrls: [
        'prestacionValidacion.scss',
        'prestacionValidacion-print.scss'
    ],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class PrestacionValidacionComponent implements OnInit, OnDestroy {

    elementoRUP: any;
    @HostBinding('class.plex-layout') layout = true;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    // Orden en que se muestran los registros
    public ordenSeleccionado: string;
    public tipoOrden: any[] = null;
    // Prestación actual en Ejecución
    public prestacion: any;
    public registrosOriginales: any;
    // Paciente MPI
    public paciente;
    // Array de elementos RUP que se pueden ejecutar
    public elementosRUP: any[];
    // Indica si muestra el calendario para dar turno autocitado
    public showDarTurnos = false;
    // Mostrar datos de la Solicitud "padre"?
    public showDatosSolicitud = false;
    // Datos de la Solicitud que se usará para dar un turno
    public solicitudTurno;
    // Si la Prestación está Validada ya no se podrá cambiar el motivo principal de la consulta
    public motivoReadOnly = false;
    // Array con los mapeos de snomed a cie10
    public codigosCie10 = {};
    // Array con los planes autocitados para dar turno
    public prestacionesAgendas = [];
    // Array con los Planes que se van a guardar en los turnos
    public asignarTurno = [];
    // Array para armar árbol de relaciones
    public relaciones: any[];
    // Array que guarda el árbol de relaciones
    public registrosOrdenados: any[] = [];
    // Orden de los registros en pantalla
    public ordenRegistros: any = '';
    // Array con opciones para indicar si es primera vez
    public opcionDiagnosticoPrincipal = [
        { id: true, label: 'Si' },
        { id: false, label: 'No' }
    ];

    // Array con opciones para indicar si es primera vez
    public opcionPrimeraVez = [
        { id: true, label: 'Si' },
        { id: false, label: 'No' }
    ];
    public btnVolver;
    public rutaVolver;
    verMasRelaciones: any = [];
    conceptosTurneables: ITipoPrestacion[] = [];
    public title;

    public hasPacs: boolean;
    public noNominalizada = true;
    public puedeRomperValidacion = false;

    constructor(
        public servicioPrestacion: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        private servicioPaciente: PacienteService,
        private SNOMED: SnomedService,
        public plex: Plex,
        public auth: Auth,
        private router: Router,
        public servicioAgenda: AgendaService,
        private route: ActivatedRoute,
        private codificacionService: CodificacionService,
        public servicioReglas: ReglaService,
        public huds: HUDSService,
        public organizacionService: OrganizacionService,
        private conceptosTurneablesService: ConceptosTurneablesService
    ) {
    }

    get validada() {
        return this.prestacion && this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada';
    }

    ngOnDestroy() {
        this.prestacionSubscription.unsubscribe();
    }

    ngOnInit() {
        // consultamos desde que pagina se ingreso para poder volver a la misma
        this.btnVolver = 'Volver';
        this.servicioPrestacion.rutaVolver.subscribe((resp: any) => {
            if (resp) {
                this.btnVolver = resp.nombre;
                this.rutaVolver = resp.ruta;
            }
        });
        // Verificamos permisos globales para rup, si no posee realiza redirect al home
        const permisosAmbulatorio = this.auth.getPermissions('rup:?').length > 0;
        const permisosInternacion = this.auth.getPermissions('internacion:rol:?').length > 0;
        if (!(permisosAmbulatorio || permisosInternacion) || !this.auth.profesional) {
            this.redirect('inicio');
        }

        this.route.params.subscribe(params => {
            const id = params['id'];
            this.elementosRUPService.ready.subscribe((resultado) => {
                if (resultado) {
                    this.inicializar(id);
                }
            });
        });
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    get registros() {
        return [...this.prestacion.ejecucion.registros, ...this.c2Array];
    }

    public c2Array = [];

    private prestacionSubscription: Subscription;

    inicializar(id) {
        // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
        this.prestacionSubscription = combineLatest(
            this.conceptosTurneablesService.getAll(),
            this.servicioPrestacion.getById(id).pipe(
                map(prestacion => populateRelaciones(prestacion))
            )
        ).subscribe(([conceptosTurneables, prestacion]) => {
            this.conceptosTurneables = conceptosTurneables;
            this.prestacion = prestacion;
            this.title = 'Resumen | ' + prestacion.solicitud.tipoPrestacion.term + ' - ' + moment(prestacion.solicitud.fecha).format('dd DD/MM/YYYY');
            this.registrosOriginales = prestacion.ejecucion.registros;
            this.plex.updateTitle([{
                route: '/',
                name: 'ANDES'
            }, {
                route: '/rup',
                name: 'RUP'
            }, {
                name: this.prestacion && this.prestacion.solicitud.tipoPrestacion.term ? this.prestacion.solicitud.tipoPrestacion.term : ''
            }]);
            this.prestacion.ejecucion.registros.sort((a: any, b: any) => a.updatedAt - b.updatedAt);
            // Busca el elementoRUP que implementa esta prestación
            this.elementoRUP = this.elementosRUPService.buscarElemento(prestacion.solicitud.tipoPrestacion, false);
            // Si el elemento no indica si requiere diagnostico principal, lo setea en true por defecto
            this.elementoRUP.requiereDiagnosticoPrincipal = typeof this.elementoRUP.requiereDiagnosticoPrincipal === 'undefined' ? true : this.elementoRUP.requiereDiagnosticoPrincipal;

            this.hasPacs = this.prestacion.metadata?.findIndex(item => item.key === 'pacs-uid') >= 0;

            // Una vez que esta la prestacion llamamos a la funcion cargaPlan que muestra para cargar turnos si tienen permisos
            if (prestacion.estadoActual.tipo === 'validada') {
                if (!this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
                    this.servicioPrestacion.getPlanes(this.prestacion.id, this.prestacion.paciente.id).subscribe(prestacionesSolicitadas => {
                        if (prestacionesSolicitadas) {
                            this.cargaPlan(prestacionesSolicitadas);
                        }
                    });
                    this.motivoReadOnly = true;
                }
                this.checkRomperValidacion();

            } else {
                this.puedeRomperValidacion = false;
            }

            if (this.elementoRUP.requeridos.length > 0) {
                for (const elementoRequerido of this.elementoRUP.requeridos) {
                    this.elementosRUPService.coleccionRetsetId[String(elementoRequerido.concepto.conceptId)] = elementoRequerido.params;
                }
            }

            if (!this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
                // Carga la información completa del paciente
                this.noNominalizada = false;
                this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                    this.paciente = paciente;
                    this.plex.setNavbarItem(HeaderPacienteComponent, { paciente: this.paciente });
                    const registros = this.prestacion.ejecucion.registros;

                    if (!this.validada) {
                        const puederSerC2 = (registro) => {
                            return (registro.concepto.semanticTag === 'hallazgo' || registro.concepto.semanticTag === 'trastorno' || registro.concepto.semanticTag === 'situación' || registro.concepto.semanticTag === 'evento');
                        };

                        const encolarRequestCIE10 = (registro) => {
                            const parametros = {
                                conceptId: registro.concepto.conceptId,
                                paciente: this.paciente,
                                secondaryConcepts: this.prestacion.ejecucion.registros.map(r => r.concepto.conceptId)
                            };
                            this.codigosCie10[registro.id] = {};
                            subscriptions.push(
                                forkJoin({
                                    registro: of(registro),
                                    cie10: this.SNOMED.getCie10(parametros).pipe(catchError(() => of({})))
                                })
                            );
                        };

                        const subscriptions = [];
                        registros.forEach(registro => {
                            if (registro.hasSections) { // COLONO O EPICRISIS
                                registro.registros.forEach(seccion => {
                                    if (seccion.isSection && !seccion.noIndex) {
                                        seccion.registros.forEach((registroInterno) => {
                                            if (puederSerC2(registroInterno)) {
                                                this.c2Array.push(registroInterno);
                                                encolarRequestCIE10(registroInterno);
                                            }
                                        });
                                    }
                                });
                            } else {
                                if (puederSerC2(registro)) {
                                    encolarRequestCIE10(registro);
                                }
                            }
                        });
                        forkJoin(subscriptions).subscribe((codigos: any[]) => {
                            codigos.forEach(codigo => {
                                this.codigosCie10[codigo.registro.id] = codigo.cie10;
                            });
                        });
                    }

                    //  (['73761001', '2341000013106']

                });
            }
            this.defualtDiagnosticoPrestacion();
            this.registrosOrdenados = this.prestacion.ejecucion.registros;
        });
    }

    checkRomperValidacion() {
        const miPrestacion = this.prestacion.estadoActual.createdBy.username === this.auth.usuario.username;
        const puedeValidar = this.auth.check('rup:validacion:' + this.prestacion.solicitud.tipoPrestacion.id);
        this.puedeRomperValidacion = miPrestacion || puedeValidar;
    }


    /**
     * Confirmamos validacion y guardamos
     * @memberof PrestacionValidacionComponent
     */
    validar() {
        const existeDiagnostico = this.registros.find(p => p.esDiagnosticoPrincipal === true);
        const diagnosticoRepetido = this.registros.filter(p => p.esDiagnosticoPrincipal === true).length > 1;

        const existeC2 = this.registros.find(p => (p.esPrimeraVez === undefined && this.codigosCie10[p.id] && this.codigosCie10[p.id].c2));
        if (existeC2) {
            this.plex.toast('info', existeC2.concepto.term.toUpperCase() + '. Debe indicar si es primera vez.');
            return false;
        }

        if (this.elementoRUP.requiereDiagnosticoPrincipal && !existeDiagnostico) {
            this.plex.toast('info', 'Debe seleccionar un procedimiento / diagnóstico principal', 'procedimiento / diagóstico principal', 1000);
            return false;
        }
        if (diagnosticoRepetido) {
            this.plex.toast('info', 'No puede seleccionar más de un procedimiento / diagnóstico principal');
            return false;
        }

        this.plex.confirm('Luego de validar la prestación no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
            if (!validar) {
                return false;
            } else {
                let seCreoSolicitud = false;
                unPopulateRelaciones(this.prestacion);
                this.servicioPrestacion.validarPrestacion(this.prestacion).pipe(
                    map(prestacion => populateRelaciones(prestacion))
                ).subscribe(prestacion => {
                    this.prestacion = prestacion;
                    this.checkRomperValidacion();
                    const recorrerRegistros = registro => {
                        if (!seCreoSolicitud && registro.esSolicitud && registro.valor.solicitudPrestacion.organizacionDestino) {
                            seCreoSolicitud = true;
                            this.plex.info('success', 'La solicitud está en la bandeja de entrada de la organización destino', 'Información');
                        }

                        if (registro.hasSections) { // COLONO O EPICRISIS
                            registro.registros.forEach(seccion => {
                                if (seccion.isSection && !seccion.noIndex) {
                                    seccion.registros.forEach(r => recorrerRegistros(r));
                                }
                            });
                        }
                    };
                    this.prestacion.ejecucion.registros.forEach((r) => recorrerRegistros(r));
                    this.motivoReadOnly = true;
                    if (!this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
                        this.servicioPrestacion.clearConceptosPaciente(this.paciente.id);

                        // actualizamos las prestaciones de la HUDS
                        this.servicioPrestacion.getPlanes(this.prestacion.id, this.paciente.id, true).subscribe(prestacionesSolicitadas => {
                            if (prestacionesSolicitadas) {
                                this.cargaPlan(prestacionesSolicitadas);
                            }
                        });
                        // Cargar el mapeo de snomed a cie10 para las prestaciones fuera de agenda
                        if (!this.prestacion.solicitud.turno) {
                            this.codificacionService.addCodificacion(prestacion.id).subscribe();
                        }
                    }
                    this.plex.toast('success', 'La prestación se validó correctamente', 'Información', 300);
                }, (err) => {
                    this.plex.toast('danger', 'ERROR: No es posible validar la prestación');
                });
            }
        });

    }

    romperValidacion() {
        this.plex.confirm('Esta acción puede traer consecuencias <br />¿Desea continuar?', 'Romper validación').then(validar => {
            if (!validar) {
                return false;
            } else {
                // hacemos el patch y luego creamos los planes
                const cambioEstado: any = {
                    op: 'romperValidacion'
                };

                // En api el estado de la prestación cambia a ejecucion
                this.servicioPrestacion.patch(this.prestacion._id, cambioEstado).subscribe(prestacion => {
                    this.prestacion = prestacion;
                    // chequeamos si es no nominalizada si
                    if (!this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
                        // actualizamos las prestaciones de la HUDS
                        this.servicioPrestacion.getByPaciente(this.paciente.id, true).subscribe(resultado => {
                        });
                    } else {
                        this.router.navigate(['rup/ejecucion', this.prestacion.id]);
                    }

                    this.router.navigate(['rup/ejecucion', this.prestacion.id]);
                }, (err) => {
                    this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación');
                });
            }

        });
    }

    turnoDado(e) {
        // actualizamos las prestaciones de la HUDS
        this.servicioPrestacion.getPlanes(this.prestacion.id, this.paciente.id, true).subscribe(prestacionesSolicitadas => {
            if (prestacionesSolicitadas) {
                this.cargaPlan(prestacionesSolicitadas);
            }
            this.showDarTurnos = false;
        });
    }

    tienePermisos(tipoPrestacion) {
        const permisos = this.auth.getPermissions('rup:tipoPrestacion:?');
        const existe = permisos.find(permiso => (permiso === tipoPrestacion._id));

        return existe;
    }

    volver() {
        this.router.navigate(['rup/ejecucion/', this.prestacion.id]);
    }

    volverInicio(ambito = 'ambulatorio', ruta = null) {
        let mensaje = ambito === 'ambulatorio' ? 'Punto de Inicio' : 'Mapa de Camas';
        let ruteo;

        if (ruta) {
            mensaje = this.btnVolver;
            ruteo = ruta;
        } else {
            if (ambito === 'ambulatorio') {
                mensaje = 'Punto de Inicio';
                ruteo = 'rup';
            } else if (ambito === 'internacion') {
                mensaje = 'Mapa de Camas';
                ruteo = '/mapa-camas';
            }
        }
        this.router.navigate([ruteo]);
    }

    darTurno(prestacionSolicitud) {
        this.solicitudTurno = prestacionSolicitud;
        this.showDarTurnos = true;
    }

    cargaPlan(prestacionesSolicitadas) {
        prestacionesSolicitadas = prestacionesSolicitadas.filter(ps => ps.solicitud.registros[0].valor.solicitudPrestacion.autocitado);
        const tiposPrestaciones = prestacionesSolicitadas.map(ps => {
            return this.conceptosTurneables.find(c => c.conceptId === ps.solicitud.tipoPrestacion.conceptId);
        });

        prestacionesSolicitadas.forEach(ps => {
            const idRegistro = ps.solicitud.registros[0].id;
            this.asignarTurno[idRegistro] = [];
            if (ps.solicitud.turno) {
                this.asignarTurno[idRegistro] = ps;
            }
        });

        if (tiposPrestaciones && tiposPrestaciones.length > 0) {
            // let filtroPretaciones = tiposPrestaciones.map(c => c.id);
            this.servicioAgenda.get({
                fechaDesde: new Date(),
                organizacion: this.auth.organizacion.id,
                estados: ['disponible', 'publicada'],
                profesionales: [this.auth.profesional]
            }).subscribe(agendas => {
                // Buscar agendas con bloques donde "restantesProfesional" > 0
                agendas = agendas.filter(a => a.bloques.find(b => b.restantesProfesional > 0));

                if (agendas) {
                    agendas.forEach(a => this.prestacionesAgendas = [...this.prestacionesAgendas, ...a.tipoPrestaciones]);
                    prestacionesSolicitadas.forEach(element => {
                        const idRegistro = element.solicitud.registros[0].id;
                        if (this.prestacionesAgendas.find(pa => pa.conceptId === element.solicitud.tipoPrestacion.conceptId && pa.term === element.solicitud.tipoPrestacion.term)) {
                            this.asignarTurno[idRegistro] = element;
                        }
                    });
                }
            });
        }
    }

    diagnosticoPrestacion(event, elem) {
        this.prestacion.ejecucion.registros.map(reg => reg.esDiagnosticoPrincipal = false);
        elem.esDiagnosticoPrincipal = event && event.value;
    }

    defualtDiagnosticoPrestacion() {
        const count = 0;
        const items = this.prestacion.ejecucion.registros.filter(elemento => ['hallazgo', 'trastorno', 'situación', 'procedimiento', 'entidad observable', 'régimen/tratamiento', 'producto', 'fármaco de uso clínico'].indexOf(elemento.concepto.semanticTag) >= 0);
        if (items.length === 1 && this.elementoRUP.requiereDiagnosticoPrincipal) {
            items[0].esDiagnosticoPrincipal = true;
        }
    }

    mostrarDatosSolicitud(bool) {
        this.showDatosSolicitud = bool;
    }

    swapItems(a, b) {
        this.prestacion.ejecucion.registros[a] = this.prestacion.ejecucion.registros.splice(b, 1, this.prestacion.ejecucion.registros[a])[0];
        return this;
    }

    hayRegistros(tipos: any[], tipo: any = null) {
        if (!tipo) {
            return this.prestacion.ejecucion.registros.filter(x => {
                return tipos.find(y => (!x.esSolicitud && y === x.concepto.semanticTag));
            }).length > 0;
        } else {
            return this.prestacion.ejecucion.registros.filter(x => {
                return tipos.find(y => (x.esSolicitud && y === x.concepto.semanticTag));
            }).length > 0;
        }
    }

    esRegistroDeTipo(registro, tipos: any[], tipo: any = null) {
        if (registro.id) {
            if (!tipo) {
                return tipos.find(y => (!registro.esSolicitud && y === registro.concepto.semanticTag));
            } else {
                return tipos.find(y => (registro.esSolicitud && y === registro.concepto.semanticTag));
            }
        } else {
            return false;
        }

    }

    esTipoOrden(registro, tipos: any[]) {

        if (!registro.esSolicitud) {
            return tipos.find(x => x === registro.concepto.semanticTag);
        } else {
            return tipos.find(x => x === 'planes');
        }
    }

    public reemplazar(arr, glue) {
        return arr.join(glue);
    }

    /**
     *
     * @param direccion orden ascendente 'down' o descendente 'up' (por registro.createdAt)
     */
    ordenarPorFecha(direccion: any) {
        if (direccion) {
            this.ordenRegistros = direccion;
            this.prestacion.ejecucion.registros = this.prestacion.ejecucion.registros.sort((a, b) => {
                a = new Date(a.createdAt);
                b = new Date(b.createdAt);
                if (direccion === 'down') {
                    return a > b ? -1 : a < b ? 1 : 0;
                } else if (direccion === 'up') {
                    return a < b ? -1 : a > b ? 1 : 0;
                }
            });
        }
    }

    ordenarPorTipo(tipos: any[]) {
        this.ordenSeleccionado = tipos.join(',');
        if (this.tipoOrden === tipos) {
            return 0;
        } else {
            this.tipoOrden = tipos;
        }
        this.prestacion.ejecucion.registros = this.prestacion.ejecucion.registros.sort(registro => {
            if ((registro.esSolicitud && tipos.find(x => x === 'planes'))) {
                return -1;
            }
            if (registro.esSolicitud === false && tipos.find(x => x === registro.concepto.semanticTag)) {
                return -1;
            }
            if (registro.concepto.semanticTag !== tipos || tipos.find(x => x !== 'planes')) {
                return 1;
            }
            return 0;
        });
    }

    limpiarOrden() {
        this.prestacion.ejecucion.registros = this.registrosOriginales;
        this.tipoOrden = this.ordenSeleccionado = null;
    }

    compareArrays(arr1: any[], arr2: any[]) {
        return arr1.join('') === arr2.join('');
    }

    toggleVerMasRelaciones(item) {
        this.verMasRelaciones[item] = !this.verMasRelaciones[item];
    }

    onPacs() {
        this.servicioPrestacion.visualizarImagen(this.prestacion);
    }

}

