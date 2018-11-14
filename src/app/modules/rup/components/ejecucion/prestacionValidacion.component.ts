import { AgendaService } from './../../../../services/turnos/agenda.service';
import { SnomedService } from './../../../../services/term/snomed.service';
import { Component, OnInit, Output, EventEmitter, HostBinding, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PacienteService } from './../../../../services/paciente.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { DocumentosService } from './../../../../services/documentos.service';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';
import { Slug } from 'ng2-slugify';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import 'rxjs/Rx';

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
export class PrestacionValidacionComponent implements OnInit {

    elementoRUP: IElementoRUP;
    @HostBinding('class.plex-layout') layout = true;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    // Tiene permisos para descargar?
    public puedeDescargarPDF = false;

    // Usa el keymap 'default'
    private slug = new Slug('default');

    // Id de la Agenda desde localStorage (revisar si aun hace falta)
    public idAgenda: any;

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

    // elementoRUP de la Prestación actual
    public elementoRUPprestacion: any;

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

    // Array que guarda los grupos de conceptos en la Búsqueda Guiada
    public gruposGuiada: any[] = [];

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
    public nombreArchivo: any;
    public btnVolver;
    public rutaVolver;

    constructor(private servicioPrestacion: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        private servicioPaciente: PacienteService, private SNOMED: SnomedService,
        public plex: Plex, public auth: Auth, private router: Router,
        public servicioAgenda: AgendaService,
        private route: ActivatedRoute,
        private servicioDocumentos: DocumentosService
    ) {
    }

    ngOnInit() {
        // consultamos desde que pagina se ingreso para poder volver a la misma
        this.btnVolver = 'Volver';
        this.rutaVolver =
            this.servicioPrestacion.rutaVolver.subscribe((resp: any) => {
                if (resp) {
                    this.btnVolver = resp.nombre;
                    this.rutaVolver = resp.ruta;
                }
            });
        // Verificamos permisos globales para rup, si no posee realiza redirect al home
        if (this.auth.getPermissions('rup:?').length <= 0) {
            this.redirect('inicio');
        }
        if (!this.auth.profesional) {
            this.redirect('inicio');
        }
        this.puedeDescargarPDF = this.auth.getPermissions('descargas:?').length > 0;
        this.route.params.subscribe(params => {
            let id = params['id'];
            this.idAgenda = localStorage.getItem('agenda');
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

    inicializar(id) {

        // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
        this.servicioPrestacion.getById(id).subscribe(prestacion => {
            this.prestacion = prestacion;
            this.registrosOriginales = prestacion.ejecucion.registros;

            this.prestacion.ejecucion.registros.sort((a: any, b: any) => a.updatedAt - b.updatedAt);

            // Busca el elementoRUP que implementa esta prestación
            this.elementoRUPprestacion = this.elementosRUPService.buscarElemento(prestacion.solicitud.tipoPrestacion, false);

            // Una vez que esta la prestacion llamamos a la funcion cargaPlan que muestra para cargar turnos si tienen permisos
            if (prestacion.estados[prestacion.estados.length - 1].tipo === 'validada') {
                if (!this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
                    this.servicioPrestacion.getPlanes(this.prestacion.id, this.prestacion.paciente.id).subscribe(prestacionesSolicitadas => {
                        if (prestacionesSolicitadas) {
                            this.cargaPlan(prestacionesSolicitadas);
                        }
                    });
                    this.motivoReadOnly = true;
                }
            }

            // Trae el elementoRUP que implementa esta Prestación
            this.elementoRUP = this.elementosRUPService.buscarElemento(prestacion.solicitud.tipoPrestacion, false);
            if (this.elementoRUP.requeridos.length > 0) {
                for (let elementoRequerido of this.elementoRUP.requeridos) {
                    this.elementosRUPService.coleccionRetsetId[String(elementoRequerido.concepto.conceptId)] = elementoRequerido.params;
                }
            }

            this.elementosRUPService.guiada(this.prestacion.solicitud.tipoPrestacion.conceptId).subscribe((grupos) => {
                this.gruposGuiada = grupos;
            });

            if (!this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
                // Carga la información completa del paciente
                this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                    this.paciente = paciente;


                    this.prestacion.ejecucion.registros.forEach(registro => {

                        if (registro.concepto.semanticTag === 'hallazgo' || registro.concepto.semanticTag === 'trastorno' || registro.concepto.semanticTag === 'situacion') {
                            let parametros = {
                                conceptId: registro.concepto.conceptId,
                                paciente: this.paciente,
                                secondaryConcepts: this.prestacion.ejecucion.registros.map(r => r.concepto.conceptId)
                            };
                            this.codigosCie10[registro.id] = {};
                            this.SNOMED.getCie10(parametros).subscribe(codigo => {
                                this.codigosCie10[registro.id] = codigo;
                            });
                        }
                    });

                });
            }

            if (this.prestacion) {
                this.prestacion.ejecucion.registros.forEach(registro => {

                    if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                        registro.relacionadoCon.forEach((registroRel, key) => {
                            let esRegistro = this.prestacion.ejecucion.registros.find(r => {
                                if (r.id) {
                                    return r.id === registroRel;
                                } else {
                                    return r.concepto.conceptId === registroRel;
                                }
                            });
                            // Es registro RUP o es un concepto puro?
                            if (esRegistro) {
                                registro.relacionadoCon[key] = esRegistro;
                            } else {
                                registro.relacionadoCon[key] = registroRel;
                            }
                        });
                    }
                });
                // this.armarRelaciones(this.prestacion.ejecucion.registros);
            }

            this.defualtDiagnosticoPrestacion();
            this.registrosOrdenados = this.prestacion.ejecucion.registros;
            this.armarRelaciones();
            // this.reordenarRelaciones();

        });
    }

    /**
     * Confirmamos validacion y guardamos
     * @memberof PrestacionValidacionComponent
     */
    validar() {
        let existeDiagnostico = this.prestacion.ejecucion.registros.find(p => p.esDiagnosticoPrincipal === true);
        let diagnosticoRepetido = this.prestacion.ejecucion.registros.filter(p => p.esDiagnosticoPrincipal === true).length > 1;
        let existeC2 = this.prestacion.ejecucion.registros.find(p => (p.esPrimeraVez === undefined && this.codigosCie10[p.id] && this.codigosCie10[p.id].c2));

        if (existeC2) {
            this.plex.toast('info', existeC2.concepto.term.toUpperCase() + '. Debe indicar si es primera vez.');
            return false;
        }
        if (!existeDiagnostico && this.prestacion.solicitud.ambitoOrigen !== 'internacion' && !this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
            this.plex.toast('info', 'Debe seleccionar un procedimiento / diagnostico principal', 'procedimiento / diagnostico principal', 1000);
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

                // cargar los conceptos mas frecuentes por profesional y tipo de prestación
                // Se copian los registros de la ejecución actual, para agregarle la frecuencia
                let registros = this.prestacion.ejecucion.registros;

                // filtramos los planes que deben generar prestaciones pendientes (Planes con conceptos turneales)
                let planes = this.prestacion.ejecucion.registros.filter(r => r.esSolicitud);
                this.servicioPrestacion.validarPrestacion(this.prestacion, planes).subscribe(prestacion => {
                    this.prestacion = prestacion;
                    this.prestacion.ejecucion.registros.forEach(registro => {
                        if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                            if (registro.relacionadoCon[0] && (typeof registro.relacionadoCon[0] === 'string')) {
                                registro.relacionadoCon = registro.relacionadoCon.map(idRegistroRel => {
                                    return this.prestacion.ejecucion.registros.find(r => r.id === idRegistroRel);
                                });
                            }
                        }
                    });

                    this.motivoReadOnly = true;
                    if (!this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
                        // actualizamos las prestaciones de la HUDS
                        this.servicioPrestacion.getPlanes(this.prestacion.id, this.paciente.id, true).subscribe(prestacionesSolicitadas => {
                            if (prestacionesSolicitadas) {
                                this.cargaPlan(prestacionesSolicitadas);
                            }
                        });
                        // Cargar el mapeo de snomed a cie10 para las prestaciones que vienen de agendas
                        this.servicioPrestacion.prestacionPacienteAusente().subscribe(
                            result => {
                                let filtroRegistros = this.prestacion.ejecucion.registros.filter(x => result.find(y => y.conceptId === x.concepto.conceptId));
                                if (this.prestacion.solicitud.turno && !(filtroRegistros && filtroRegistros.length > 0)) {
                                    this.servicioAgenda.patchCodificarTurno({ 'op': 'codificarTurno', 'turnos': [this.prestacion.solicitud.turno] }).subscribe(salida => { });
                                }
                            });
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
                // guardamos una copia de la prestacion antes de romper la validacion.
                // let prestacionCopia = JSON.parse(JSON.stringify(this.prestacion));
                const prestacionCopia = this.prestacion;

                // Agregamos el estado de la prestacion copiada.
                let estado = { tipo: 'modificada', idOrigenModifica: prestacionCopia._id };

                // Guardamos la prestacion copia
                this.servicioPrestacion.clonar(prestacionCopia, estado).subscribe(prestacionClonada => {

                    let prestacionModificada = prestacionClonada;

                    // hacemos el patch y luego creamos los planes
                    let cambioEstado: any = {
                        op: 'romperValidacion',
                        estado: { tipo: 'ejecucion', idOrigenModifica: prestacionModificada.id }
                    };

                    this.route.params.subscribe(params => {
                        // Vamos a cambiar el estado de la prestación a ejecucion
                        this.servicioPrestacion.patch(this.prestacion._id || params['id'], cambioEstado).subscribe(prestacion => {
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
                    });
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
        let permisos = this.auth.getPermissions('rup:tipoPrestacion:?');
        let existe = permisos.find(permiso => (permiso === tipoPrestacion._id));

        return existe;
    }

    volver() {
        this.router.navigate(['rup/ejecucion/', this.prestacion.id]);
    }

    volverInicio(ambito = 'ambulatorio', ruta = null) {
        let mensaje = ambito === 'ambulatorio' ? 'Punto de Inicio' : 'Mapa de Camas';
        let ruteo;
        if (ambito === 'ambulatorio') {
            ruteo = 'rup';
            this.btnVolver = mensaje;
        } else {
            if (ruta) {
                ruteo = ruta;
            } else {
                ruteo = '/internacion/camas';
            }
        }
        this.router.navigate([ruteo]);
        // this.plex.confirm('<i class="mdi mdi-alert"></i> Se van a perder los cambios no guardados', '¿Volver al ' + mensaje + '?').then(confirmado => {
        //     if (confirmado) {
        //         this.router.navigate([ruteo]);
        //     } else {
        //         return;
        //     }
        // });
    }

    darTurno(prestacionSolicitud) {
        this.solicitudTurno = prestacionSolicitud;
        this.showDarTurnos = true;
    }

    cargaPlan(prestacionesSolicitadas) {
        prestacionesSolicitadas = prestacionesSolicitadas.filter(ps => ps.solicitud.registros[0].valor.solicitudPrestacion.autocitado);
        let tiposPrestaciones = prestacionesSolicitadas.map(ps => {
            return this.servicioPrestacion.conceptosTurneables.find(c => c.conceptId === ps.solicitud.tipoPrestacion.conceptId);
        });

        prestacionesSolicitadas.forEach(ps => {
            let idRegistro = ps.solicitud.registros[0].id;
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
                profesionales: [this.auth.profesional.id]
            }).subscribe(agendas => {
                // Buscar agendas con bloques donde "restantesProfesional" > 0
                agendas = agendas.filter(a => a.bloques.find(b => b.restantesProfesional > 0));

                if (agendas) {
                    agendas.forEach(a => this.prestacionesAgendas = [...this.prestacionesAgendas, ...a.tipoPrestaciones]);
                    prestacionesSolicitadas.forEach(element => {
                        let idRegistro = element.solicitud.registros[0].id;
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
        let count = 0;
        let items = this.prestacion.ejecucion.registros.filter(elemento => ['hallazgo', 'trastorno', 'situación', 'procedimiento', 'entidad observable', 'régimen/tratamiento', 'producto'].indexOf(elemento.concepto.semanticTag) >= 0);
        if (items.length === 1) {
            items[0].esDiagnosticoPrincipal = true;
        }
    }

    mostrarDatosSolicitud(bool) {
        this.showDatosSolicitud = bool;
    }


    // Indices de profundidad de las relaciones
    registrosDeep: any = {};
    armarRelaciones() {
        let relacionesOrdenadas = [];
        let registros = this.prestacion.ejecucion.registros;
        let roots = registros.filter(x => x.relacionadoCon.length === 0);

        let traverse = (_registros, registro, deep) => {
            let orden = [];
            let hijos = _registros.filter(item => item.relacionadoCon[0] === registro.id || item.relacionadoCon[0] === registro.concepto.conceptId);
            this.registrosDeep[registro.id] = deep;
            hijos.forEach((hijo) => {
                orden = [...orden, hijo, ...traverse(_registros, hijo, deep + 1)];
            });
            return orden;
        };

        roots.forEach((root) => {
            this.registrosDeep[root.id] = 0;
            relacionesOrdenadas = [...relacionesOrdenadas, root, ...traverse(this.prestacion.ejecucion.registros, root, 1)];
        });


        this.registrosOrdenados = relacionesOrdenadas;
    }



    reordenarRelaciones() {
        let rel: any;
        let relIdx: any;
        // this.prestacion.ejecucion.registros.forEach((item, index) => {
        //     rel = this.prestacion.ejecucion.registros.find(x => x.id === item.relacionadoCon[0].id);
        //     relIdx = this.prestacion.ejecucion.indexOf(rel);

        //     if (rel.length > 0 && relIdx > index) {
        //         this.swapItems(rel, item);
        //     }
        // });
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
            this.prestacion.ejecucion.registros = this.prestacion.ejecucion.registros.sort(function (a, b) {
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

    descargarResumen() {
        this.prestacion.ejecucion.registros.forEach(x => {
            x.icon = 'down';
        });
        setTimeout(() => {

            this.nombreArchivo = this.slug.slugify(this.prestacion.solicitud.tipoPrestacion.term);
            let content = '';
            let headerPrestacion: any = document.getElementById('pageHeader').cloneNode(true);
            let datosSolicitud: any = document.getElementById('datosSolicitud').cloneNode(true);


            const header = `
                    <div class="resumen-solicitud">
                        ${datosSolicitud.innerHTML}
                    </div>
                `;

            content += header;
            content += `
                <div class="paciente">
                    <b>Paciente:</b> ${this.paciente.apellido}, ${this.paciente.nombre} -
                    ${this.paciente.documento} - ${moment(this.paciente.fechaNacimiento).fromNow(true)}
                </div>
                `;

            // agregamos prestaciones
            let elementosRUP: HTMLCollection = document.getElementsByClassName('rup-card');

            const total = elementosRUP.length;
            for (let i = 0; i < total; i++) {
                content += ' <div class="rup-card">' + elementosRUP[i].innerHTML + '</div>';
            }

            // Sanitizar? no se recibe HTML "foráneo", quizá no haga falta
            // content = this.sanitizer.sanitize(1, content);

            // this.servicioDocumentos.descargar(content).subscribe(data => {
            //     if (data) {
            //         // Generar descarga como PDF
            //         this.descargarArchivo(data, { type: 'application/pdf' });
            //     } else {
            //         // Fallback a impresión normal desde el navegador
            //         window.print();
            //     }
            // });

            let informe = {
                idPrestacion: this.prestacion.id
            };

            this.servicioDocumentos.descargarV2(informe).subscribe(data => {
                if (data) {
                    // Generar descarga como PDF
                    this.descargarArchivo(data, { type: 'application/pdf' });
                } else {
                    // Fallback a impresión normal desde el navegador
                    window.print();
                }
            });
        });
    }

    private descargarArchivo(data: any, headers: any): void {
        let blob = new Blob([data], headers);
        saveAs(blob, this.nombreArchivo + this.slug.slugify('-' + moment().format('DD-MM-YYYY-hmmss')) + '.pdf');
    }
    /**
     * Busca los grupos de la búsqueda guiada a los que pertenece un concepto
     * @param {IConcept} concept
     */
    enBusquedaGuiada(concept) {
        let results = [];
        this.gruposGuiada.forEach(data => {
            if (data.conceptIds.indexOf(concept.conceptId) >= 0) {
                results.push(data);
            }
        });
        return results;
    }


    /**
     * Determina si muestra el label motivo de consulta.
     */

    showMotivo(elemento) {
        if (this.elementoRUPprestacion.motivoConsoltaOpcional) {
            return false;
        }
        let last = this.prestacion.estados.length - 1;
        return this.prestacion.estados[last].tipo !== 'validada' && elemento.valor.estado !== 'transformado';

    }

}

