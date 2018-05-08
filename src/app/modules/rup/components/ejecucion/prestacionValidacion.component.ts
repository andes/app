import { DomSanitizer } from '@angular/platform-browser';
import { SemanticTag } from './../../interfaces/semantic-tag.type';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { SnomedService } from './../../../../services/term/snomed.service';
import { PrestacionEjecucionComponent } from './prestacionEjecucion.component';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PacienteService } from './../../../../services/paciente.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { FrecuentesProfesionalService } from './../../services/frecuentesProfesional.service';
import { DocumentosService } from './../../../../services/documentos.service';
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

    constructor(private servicioPrestacion: PrestacionesService,
        private frecuentesProfesionalService: FrecuentesProfesionalService,
        public elementosRUPService: ElementosRUPService,
        private servicioPaciente: PacienteService, private SNOMED: SnomedService,
        public plex: Plex, public auth: Auth, private router: Router,
        public servicioAgenda: AgendaService,
        private route: ActivatedRoute, private servicioTipoPrestacion: TipoPrestacionService,
        private servicioDocumentos: DocumentosService,
        private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
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
        // this.zone.runOutsideAngular(() => {
        //     console.log(22);
        // });
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
                this.servicioPrestacion.getPlanes(this.prestacion.id, this.prestacion.paciente.id).subscribe(prestacionesSolicitadas => {
                    if (prestacionesSolicitadas) {
                        this.cargaPlan(prestacionesSolicitadas);
                    }
                });
                this.motivoReadOnly = true;
            }

            this.elementosRUPService.guiada(this.prestacion.solicitud.tipoPrestacion.conceptId).subscribe((grupos) => {
                this.gruposGuiada = grupos;
            });

            // Carga la información completa del paciente
            this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                this.paciente = paciente;
                this.prestacion.ejecucion.registros.forEach(registro => {
                    if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                        registro.relacionadoCon = registro.relacionadoCon.map(idRegistroRel => {
                            return this.prestacion.ejecucion.registros.find(r => r.id === idRegistroRel);
                        });
                    }
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
            this.defualtDiagnosticoPrestacion();
            this.registrosOrdenados = this.prestacion.ejecucion.registros;
            this.armarRelaciones(this.registrosOrdenados);
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

        if (!existeDiagnostico) {
            this.plex.toast('info', 'Debe seleccionar un motivo de consulta principal', 'Motivo de consulta principal', 1000);
            return false;
        }
        if (diagnosticoRepetido) {
            this.plex.toast('info', 'No puede seleccionar más de un motivo de consulta principal');
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
                            registro.relacionadoCon = registro.relacionadoCon.map(idRegistroRel => { return this.prestacion.ejecucion.registros.find(r => r.id === idRegistroRel); });
                        }
                    });
                    // actualizamos las prestaciones de la HUDS
                    this.servicioPrestacion.getPlanes(this.prestacion.id, this.paciente.id, true).subscribe(prestacionesSolicitadas => {
                        if (prestacionesSolicitadas) {
                            this.cargaPlan(prestacionesSolicitadas);
                        }
                    });

                    this.motivoReadOnly = true;

                    // Cargar el mapeo de snomed a cie10 para las prestaciones que vienen de agendas
                    if (this.prestacion.solicitud.turno && !this.servicioPrestacion.prestacionPacienteAusente(this.prestacion)) {
                        this.servicioAgenda.patchCodificarTurno({ 'op': 'codificarTurno', 'turnos': [this.prestacion.solicitud.turno] }).subscribe(salida => { });
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
                let prestacionCopia = JSON.parse(JSON.stringify(this.prestacion));

                // Agregamos el estado de la prestacion copiada.
                let estado = { tipo: 'modificada', idOrigenModifica: prestacionCopia.id };

                // Guardamos la prestacion copia
                this.servicioPrestacion.clonar(prestacionCopia, estado).subscribe(prestacionClonada => {

                    let prestacionModificada = prestacionClonada;

                    // hacemos el patch y luego creamos los planes
                    let cambioEstado: any = {
                        op: 'romperValidacion',
                        estado: { tipo: 'ejecucion', idOrigenModifica: prestacionModificada.id }
                    };
                    // Vamos a cambiar el estado de la prestación a ejecucion
                    this.servicioPrestacion.patch(this.prestacion.id, cambioEstado).subscribe(prestacion => {
                        this.prestacion = prestacion;

                        // actualizamos las prestaciones de la HUDS
                        this.servicioPrestacion.getByPaciente(this.paciente.id, true).subscribe(resultado => {
                        });

                        this.router.navigate(['rup/ejecucion', this.prestacion.id]);
                    }, (err) => {
                        this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación');
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

    volverInicio() {
        this.router.navigate(['rup']);
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

    diagnosticoPrestacion(elem) {
        this.prestacion.ejecucion.registros.map(reg => reg.esDiagnosticoPrincipal = false);
        elem.esDiagnosticoPrincipal = !elem.esDiagnosticoPrincipal;
    }

    defualtDiagnosticoPrestacion() {
        let count = 0;
        // for (let elemento of this.prestacion.ejecucion.registros) {
        let items = this.prestacion.ejecucion.registros.filter(elemento => ['hallazgo', 'trastorno', 'situación', 'procedimiento', 'entidad observable', 'régimen/tratamiento', 'producto'].indexOf(elemento.concepto.semanticTag) >= 0);
        if (items.length === 1) {
            items[0].esDiagnosticoPrincipal = true;
        }

        // }
    }

    primeraVez(elem) {
        // this.prestacion.ejecucion.registros.map(reg => reg.esPrimeraVez = false);
        elem.esPrimeraVez = !elem.esPrimeraVez;
    }

    mostrarDatosSolicitud(bool) {
        this.showDatosSolicitud = bool;
    }

    relacionadoConPadre(id) {
        return this.prestacion.ejecucion.registros.filter(rel => rel.relacionadoCon[0] === id);
    }

    armarRelaciones(registros) {

        registros = this.prestacion.ejecucion.registros;

        let relacionesOrdenadas = [];

        registros.forEach((cosa, index) => {
            let esPadre = registros.filter(x => x.relacionadoCon[0] === cosa.id);

            if (esPadre.length > 0) {
                if (relacionesOrdenadas.filter(x => x === cosa).length === 0) {
                    relacionesOrdenadas.push(cosa);
                }
                esPadre.forEach(hijo => {
                    if (relacionesOrdenadas.filter(x => x === hijo).length === 0) {
                        relacionesOrdenadas.push(hijo);
                    }
                });
            } else {
                if (cosa.relacionadoCon && registros.filter(x => x.id === cosa.relacionadoCon[0] || x.relacionadoCon[0] === cosa.id).length === 0) {
                    relacionesOrdenadas.push(cosa);
                }
            }

        });

        this.registrosOrdenados = relacionesOrdenadas;
    }

    reordenarRelaciones() {
        let rel: any;
        let relIdx: any;
        this.prestacion.ejecucion.registros.forEach((item, index) => {
            rel = this.prestacion.ejecucion.registros.find(x => x.id === item.relacionadoCon[0].id);
            relIdx = this.prestacion.ejecucion.indexOf(rel);

            if (rel.length > 0 && relIdx > index) {
                this.swapItems(rel, item);
            }
        });
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

            let content = '';
            let headerPrestacion: any = document.getElementById('pageHeader').cloneNode(true);
            let datosSolicitud: any = document.getElementById('datosSolicitud').cloneNode(true);

            /**
             * Cada logo va a quedar generado como base64 desde la API:
             *
             * <img src="data:image/png;base64,..." style="float: left;">
             * <img src="data:image/png;base64,..." style="width: 80px; margin-right: 10px;">
             * <img src="data:image/png;base64,..." style="display: inline-block; width: 100px; float: right;">
             *
             */

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

            this.servicioDocumentos.descargar(content).subscribe(data => {
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
        let nombreArchivo = this.slug.slugify(this.prestacion.solicitud.tipoPrestacion.term + '-' + moment().format('DD-MM-YYYY-hmmss')) + '.pdf';
        saveAs(blob, nombreArchivo);
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

}

