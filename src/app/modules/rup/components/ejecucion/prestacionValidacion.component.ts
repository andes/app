import { DomSanitizer } from '@angular/platform-browser';
import { SemanticTag } from './../../interfaces/semantic-tag.type';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { SnomedService } from './../../../../services/term/snomed.service';
import { PrestacionEjecucionComponent } from './prestacionEjecucion.component';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PacienteService } from './../../../../services/paciente.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { FrecuentesProfesionalService } from './../../services/frecuentesProfesional.service';
import { DocumentosService } from './../../../../services/documentos.service';
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
    logoPDP: string;
    logotipoAndesPNG: string;
    logoAndesPNG: any;
    pending: boolean;
    idAgenda: any;
    ordenSeleccionado: string;
    @HostBinding('class.plex-layout') layout = true;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    // prestacion actual en ejecucion
    public prestacion: any;
    public registrosOriginales: any;
    public paciente;
    // array de elementos RUP que se pueden ejecutar
    public elementosRUP: any[];
    // elementoRUP de la prestacion actual
    public elementoRUPprestacion: any;
    /**
     * Indica si muestra el calendario para dar turno autocitado
     */
    public showDarTurnos = false;
    solicitudTurno;
    public diagnosticoReadonly = false;

    // array con los mapeos de snomed a cie10
    public codigosCie10 = {};

    // array con los planes autocitados para dar turno
    public prestacionesAgendas = [];
    public asignarTurno = {};

    // Datos de solicitud "padre"
    public showDatosSolicitud = false;

    // Array para armar árbol de relaciones
    public relaciones: any[];

    // Array que guarda el árbol de relaciones
    public registrosOrdenados: any[] = [];

    // Orden de los registros en pantalla
    public ordenRegistros: any = '';

    tipoOrden: any[] = null;
    arrayTitulos: any[] = [];


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

            // Mueve el registro que tenga esDiagnosticoPrincipal = true arriba de todo
            // let indexDiagnosticoPrincipal = this.prestacion.ejecucion.registros.findIndex(reg => reg.esDiagnosticoPrincipal === true);
            // if (indexDiagnosticoPrincipal > -1) {
            //     let diagnosticoPrincipal = this.prestacion.ejecucion.registros[indexDiagnosticoPrincipal];
            //     this.prestacion.ejecucion.registros[indexDiagnosticoPrincipal] = this.prestacion.ejecucion.registros[0];
            //     this.prestacion.ejecucion.registros[0] = diagnosticoPrincipal;
            // }

            // Busca el elementoRUP que implementa esta prestación
            this.elementoRUPprestacion = this.elementosRUPService.buscarElemento(prestacion.solicitud.tipoPrestacion, false);

            // Una vez que esta la prestacion llamamos a la funcion cargaPlan que muestra para cargar turnos si tienen permisos
            if (prestacion.estados[prestacion.estados.length - 1].tipo === 'validada') {
                this.servicioTipoPrestacion.get({}).subscribe(conceptosTurneables => {
                    this.servicioPrestacion.get({ idPrestacionOrigen: this.prestacion.id }).subscribe(prestacionSolicitud => {
                        this.cargaPlan(prestacionSolicitud, conceptosTurneables);
                    });
                });

                this.diagnosticoReadonly = true;
            }

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
            this.plex.toast('info', 'Debe seleccionar un diagnóstico principal', 'Diagnóstico principal', 1000);
            return false;
        }
        if (diagnosticoRepetido) {
            this.plex.toast('info', 'No puede seleccionar más de un diagnóstico principal');
            return false;
        }
        this.plex.confirm('Luego de validar la prestación no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
            if (!validar) {
                return false;
            } else {
                this.servicioTipoPrestacion.get({}).subscribe(conceptosTurneables => {
                    // filtramos los planes que deben generar prestaciones pendientes (Planes con conceptos turneales)
                    let planes = this.prestacion.ejecucion.registros.filter(r => r.esSolicitud);

                    this.servicioPrestacion.validarPrestacion(this.prestacion, planes, conceptosTurneables).subscribe(prestacion => {
                        this.prestacion = prestacion;

                        this.prestacion.ejecucion.registros.forEach(registro => {
                            if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                                registro.relacionadoCon = registro.relacionadoCon.map(idRegistroRel => { return this.prestacion.ejecucion.registros.find(r => r.id === idRegistroRel); });
                            }
                        });
                        // actualizamos las prestaciones de la HUDS
                        this.servicioPrestacion.getByPaciente(this.paciente.id, true).subscribe(resultado => {
                        });

                        // Chequear si es posible asignar turno a los planes generados
                        if (prestacion.solicitadas) {
                            this.cargaPlan(prestacion.solicitadas, conceptosTurneables);
                        }
                        this.diagnosticoReadonly = true;

                        // cargar los conceptos mas frecuentes por profesional y tipo de prestación
                        // Se copian los registros de la ejecución actual, para agregarle la frecuencia
                        let registros = this.prestacion.ejecucion.registros;
                        let registrosFrecuentes = [];

                        registros.forEach(x => {
                            registrosFrecuentes.push({
                                concepto: x.concepto,
                                frecuencia: 1
                            });
                        });

                        let frecuentesProfesional = {
                            profesional: {
                                id: this.auth.profesional.id,
                                nombre: this.auth.profesional.nombre,
                                apellido: this.auth.profesional.apellido,
                                documento: this.auth.profesional.documento
                            },
                            tipoPrestacion: this.prestacion.solicitud.tipoPrestacion,
                            organizacion: this.prestacion.solicitud.organizacion,
                            frecuentes: registrosFrecuentes
                        };
                        this.frecuentesProfesionalService.updateFrecuentes(this.auth.profesional.id, frecuentesProfesional).subscribe(frecuentes => { });

                        // Cargar el mapeo de snomed a cie10 para las prestaciones que vienen de agendas
                        if (this.prestacion.solicitud.turno) {
                            this.servicioAgenda.patchCodificarTurno({ 'op': 'codificarTurno', 'turnos': [this.prestacion.solicitud.turno] }).subscribe(salida => { });
                        }


                        this.plex.toast('success', 'La prestación se validó correctamente', 'Información', 300);
                    }, (err) => {
                        this.plex.toast('danger', 'ERROR: No es posible validar la prestación');
                    });
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
        // recargamos
        this.inicializar(this.prestacion.id);
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

    cargaPlan(prestacionesSolicitadas, conceptosTurneables) {

        let tiposPrestaciones = prestacionesSolicitadas.map(ps => {
            return conceptosTurneables.find(c => c.conceptId === ps.solicitud.tipoPrestacion.conceptId);
        });
        prestacionesSolicitadas.forEach(ps => {
            let idRegistro = ps.solicitud.registros[0].id;
            this.asignarTurno[idRegistro] = {};
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
                        if (this.prestacionesAgendas.find(pa => pa.conceptId === element.solicitud.tipoPrestacion.conceptId)) {
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

    primeraVez(elem) {
        this.prestacion.ejecucion.registros.map(reg => reg.esPrimeraVez = false);
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

        // this.prestacion.ejecucion.registros = relacionesOrdenadas;
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

    private descargarArchivo(data: any, headers: any): void {

        let blob = new Blob([data], headers);
        saveAs(blob, 'rup.pdf');
    }

    imprimirResumen() {
        this.prestacion.ejecucion.registros.forEach(x => {
            x.icon = 'down';
        });
        setTimeout(() => {

            let content = '';
            let headerPrestacion: any = document.getElementById('pageHeader').cloneNode(true);
            let datosSolicitud: any = document.getElementById('datosSolicitud').cloneNode(true);

            // datosSolicitud.children[0].style = 'margin-bottom: 20px;';

            this.logoAndesPNG = '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';

            this.logotipoAndesPNG = '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';


            this.logoPDP = `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`;

            // console.log(this.logoAndesPNG);

            const header = `
                <header id="pageHeader" style="background-color: rgba(0,0,0,0.1); font-size: 10px; height: 40px !important; padding-top: 8px; padding-left:5px;">
                    <div class="col-4 m-0 p-0">
                        <img src="data:image/png;base64,${this.logoAndesPNG.toString()}" style="float: left;">
                        <div class="logo p-2" style="float: left; padding: 5px;">
                        <!-- background-color: #002738; -->
                            <img src="data:image/png;base64,${this.logotipoAndesPNG.toString()}" style="width: 80px; margin-right: 10px;">
                        </div>
                    </div>
                    <div class="col-8 m-0 p-0">
                        <div class="organizacion" style="position: relative; top: 17px;">${this.auth.organizacion.nombre}</div>
                    </div>
                </header>
                <div>
                    ${headerPrestacion.innerHTML}
                    ${datosSolicitud.innerHTML}
                </div>
            `;

            content += header;
            content += `
            <div class="paciente">
                <b>Paciente:</b> ${this.paciente.apellido},  ${this.paciente.nombre} - 
                ${this.paciente.documento} - ${moment(this.paciente.fechaNacimiento).fromNow(true)}
            </div>
            `;

            // agregamos prestaciones
            let elementosRUP: HTMLCollection = document.getElementsByClassName('rup-card');

            const total = elementosRUP.length;
            for (let i = 0; i < total; i++) {
                content += ' <div class="rup-card">' + elementosRUP[i].innerHTML + '</div>';
            }

            // content = this.sanitizer.sanitize(1, content);


            // let cssFiles = Object.keys(document.styleSheets);

            // content += '<style>';

            // for (let fkey in cssFiles) {
            //     let cssKeys = document.styleSheets[fkey];

            //     for (let key in cssKeys) {
            //         // console.log(document.styleSheets[fkey].ownerNode.textContent);
            //         content += document.styleSheets[fkey].ownerNode.textContent;
            //         // console.log(document.styleSheets[fkey].ownerNode.textContent);
            //     }
            // }

            // content += '</style>';

            content += `
                <footer id="pageFooter" style="background-color: rgba(0,0,0,0.1); display: inline-block; font-size: 8px; margin-bottom: 15px; padding: 5px;">
                    <img src="data:image/png;base64,${this.logoPDP}" style="display: inline-block; width: 100px; float: right;">
                    <div style="display: inline-block; float: left; width: 400px; margin-right: 10px; text-align: justify;">
                        El contenido de este informe ha sido validado digitalmente siguiendo los estándares de calidad y seguridad requeridos. El   Hospital Provincial Neuquén es responsable Inscripto en el Registro Nacional de Protección de Datos Personales bajo el N° de Registro 100000182, según lo requiere la Ley N° 25.326 (art. 3° y 21 inciso 1)
                        ${JSON.stringify(this.auth.usuario.nombreCompleto)} - ${moment().format('DD/MM/YYYY H:m')} hs
                    </div>
                </footer>
            `;

            // console.log(content);

            this.servicioDocumentos.descargar(content).subscribe(data => {
                this.descargarArchivo(data, { type: 'application/pdf' });
                // window.print();
            });
        });
    }


}

