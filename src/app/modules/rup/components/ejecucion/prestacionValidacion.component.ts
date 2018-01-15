import { HeaderPacienteComponent } from './../../../../components/paciente/headerPaciente.component';
import { SemanticTag } from './../../interfaces/semantic-tag.type';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { SnomedService } from './../../../../services/term/snomed.service';
import { PrestacionEjecucionComponent } from './prestacionEjecucion.component';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation, ViewChildren, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PacienteService } from './../../../../services/paciente.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { FrecuentesProfesionalService } from './../../services/frecuentesProfesional.service';

import * as html2pdf from 'html2pdf.js';
import * as moment from 'moment';

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
    ordenSeleccionado: string;
    
    //@ViewChild('headerPaciente') content: HeaderPacienteComponent;
    

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
        private route: ActivatedRoute, private servicioTipoPrestacion: TipoPrestacionService) {
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

                        // Mueve el registro que tenga esDiagnosticoPrincipal = true arriba de todo
                        // let indexDiagnosticoPrincipal = this.prestacion.ejecucion.registros.findIndex(reg => reg.esDiagnosticoPrincipal === true);
                        // if (indexDiagnosticoPrincipal > -1) {
                        //     let diagnosticoPrincipal = this.prestacion.ejecucion.registros[indexDiagnosticoPrincipal];
                        //     this.prestacion.ejecucion.registros[indexDiagnosticoPrincipal] = this.prestacion.ejecucion.registros[0];
                        //     this.prestacion.ejecucion.registros[0] = diagnosticoPrincipal;
                        // }

                        this.prestacion.ejecucion.registros.forEach(registro => {
                            if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                                registro.relacionadoCon = registro.relacionadoCon.map(idRegistroRel => { return this.prestacion.ejecucion.registros.find(r => r.id === idRegistroRel); });
                            }
                        });
                        // actualizamos las prestaciones de la HUDS
                        this.servicioPrestacion.getByPaciente(this.paciente.id, true).subscribe(resultado => {
                        });
                        if (prestacion.solicitadas) {
                            this.cargaPlan(prestacion.solicitadas, conceptosTurneables);
                        }
                        this.diagnosticoReadonly = true;

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

    imprimirResumen() {
        /* Version inicial que abre dialogo de impresión y utiliza CSS
        this.prestacion.ejecucion.registros.forEach(x => {
            x.icon = 'down';
        });
        setTimeout(() => {
            window.print();
        });
        */

        let content = "";
        let headerPrestacion:any = document.getElementById("headerPrestacion").cloneNode(true);
        let datosSolicitud:any = document.getElementById("datosSolicitud").cloneNode(true);

        // merse code starting ....
        // quitamos mersamente los botones, del encabezado
        headerPrestacion.children[0].style = "width: 100%; max-width: 100%; flex:0 0 100%";
        headerPrestacion.children[0].children[0].style = "font-size: 18px; margin-bottom: 20px; border-bottom: 1px solid black;";
        headerPrestacion.children[0].children[0].children[2].innerHTML = '';
        
        datosSolicitud.children[0].style = "margin-bottom: 20px;";

        const header = '<header>' + 
            headerPrestacion.innerHTML + 
            datosSolicitud.innerHTML + 
        '</header>';

        content +=  header;

        // agregamos prestaciones
        let elementosRUP:HTMLCollection = document.getElementsByClassName("elementoRup");

        const total = elementosRUP.length;
        for (let i = 0; i < total; i++) {
            content += elementosRUP[i].innerHTML;
        }


        // creamos el nombre del archivo quitando caracteres raros, espacios, etc.
        const fileName = this.slugify(this.prestacion.solicitud.tipoPrestacion.term + ' ' + this.paciente.nombreCompleto + moment(new Date(this.prestacion.ejecucion.fecha)).format("DD-MM-YYYY")) + '.pdf';

        html2pdf(content, {
            pdfCallback: function(doc) {
                // decomentar cuando la funcion pdfCallback este estable, de esta forma vamos a 
                // poder agregar el header y también indicarle que el output sea una nueva ventana para imprimir
                // doc.add(header);
                // doc.output('dataurlnewwindow');
            },
            margin:       [10, 20],
            filename:     fileName,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { dpi: 192, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'p' }
        });

    }

    /**
     * Creamos un slug para el nombre del archivo y quitamos caracteres raros
     *
     * @private
     * @param {string} text Nombre a formatear 
     * @returns {string} Slug formateado
     * @memberof PrestacionValidacionComponent
     */
    private slugify (text) {
        const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
        const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
        const p = new RegExp(a.split('').join('|'), 'g')
      
        return text.toString().toLowerCase()
          .replace(/\s+/g, '-')           // Replace spaces with -
          .replace(p, c =>
              b.charAt(a.indexOf(c)))     // Replace special chars
          .replace(/&/g, '-and-')         // Replace & with 'and'
          .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
          .replace(/\-\-+/g, '-')         // Replace multiple - with single -
          .replace(/^-+/, '')             // Trim - from start of text
          .replace(/-+$/, '')             // Trim - from end of text
      }
}
