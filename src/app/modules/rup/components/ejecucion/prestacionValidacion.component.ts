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

@Component({
    selector: 'rup-prestacionValidacion',
    templateUrl: 'prestacionValidacion.html',
    styleUrls: ['prestacionValidacion.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class PrestacionValidacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    // prestacion actual en ejecucion
    public prestacion: any;
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

    constructor(private servicioPrestacion: PrestacionesService,
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
            this.inicializar(id);

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

            // Busca el elementoRUP que implementa esta prestación
            this.elementoRUPprestacion = this.elementosRUPService.buscarElemento(prestacion.solicitud.tipoPrestacion, false);

            // Una vez que esta la prestacion llamamos a la funcion cargaPlan que muestra para cargar turnos si tienen permisos
            if (prestacion.estados[prestacion.estados.length - 1].tipo === 'validada') {
                this.servicioTipoPrestacion.get({}).subscribe(conceptosTurneables => {
                    this.servicioPrestacion.get({ idPrestacionOrigen: id }).subscribe(prestacionSolicitud => {
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
                        registro.relacionadoCon = registro.relacionadoCon.map(idRegistroRel => { return this.prestacion.ejecucion.registros.find(r => r.id === idRegistroRel); });
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
            this.plex.toast('info', 'Debe seleccionar un diagnóstico principal');
            return false;
        }
        if (diagnosticoRepetido) {
            this.plex.toast('info', 'Debe seleccionar sólo un diagnóstico principal');
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

                        if (prestacion.solicitadas) {
                            this.cargaPlan(prestacion.solicitadas, conceptosTurneables);
                        }

                        this.diagnosticoReadonly = true;
                        // actualizamos las prestaciones de la HUDS
                        this.servicioPrestacion.getByPaciente(this.paciente.id, true).subscribe(resultado => {
                        });
                        this.plex.toast('success', 'La prestación se valido correctamente');
                    }, (err) => {
                        this.plex.toast('danger', 'ERROR: No es posible validar la prestación');
                    });
                });
            }
        });

    }

    romperValidacion() {
        this.plex.confirm('Esta acción puede traer consecuencias 💀 ☠️💀 ☠️<br />¿Desea continuar?', 'Romper validación').then(validar => {
            if (!validar) {
                return false;
            } else {

                // hacemos el patch y luego creamos los planes
                let cambioEstado: any = {
                    op: 'romperValidacion',
                    estado: { tipo: 'ejecucion' }
                };

                // Vamos a cambiar el estado de la prestación a ejecucion
                this.servicioPrestacion.patch(this.prestacion.id, cambioEstado).subscribe(prestacion => {
                    this.prestacion = prestacion;

                    this.router.navigate(['rup/ejecucion', this.prestacion.id]);
                }, (err) => {
                    this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación');
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
            { return conceptosTurneables.find(c => c.conceptId === ps.solicitud.tipoPrestacion.conceptId); }
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
                        if (this.prestacionesAgendas.find(pa => pa.conceptId === element.solicitud.tipoPrestacion.conceptId)) {
                            this.asignarTurno[element.solicitud.tipoPrestacion.conceptId] = true;
                        }
                    });
                }
            });
        }
    }

    diagnosticoPrestacion(elem) {

        elem.esDiagnosticoPrincipal = !elem.esDiagnosticoPrincipal;

        // let actual = this.prestacion.ejecucion.registros.find(p => p.esDiagnosticoPrincipal = (p.id === elem.id));
        // if (actual) {
        //     actual.esDiagnosticoPrincipal = false;
        // }

    }
}

