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

    constructor(private servicioPrestacion: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        private servicioPaciente: PacienteService,
        public plex: Plex, public auth: Auth, private router: Router, private route: ActivatedRoute) {
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
            // Una vez que esta la prestacion llamamos a la funcion cargaPlan
            if (prestacion.estados[prestacion.estados.length - 1].tipo === 'validada') {
                this.cargaPlan(id);
                this.diagnosticoReadonly = true;
            }
            // Carga la información completa del paciente
            // [jgabriel] ¿Hace falta esto?
            this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                this.paciente = paciente;
            });

            this.prestacion.ejecucion.registros.forEach(registro => {
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                    registro.relacionadoCon = registro.relacionadoCon.map(idRegistroRel => { return this.prestacion.ejecucion.registros.find(r => r.id = idRegistroRel); });
                }

            });

            // Busca el elementoRUP que implementa esta prestación
            this.elementoRUPprestacion = this.elementosRUPService.buscarElemento(prestacion.solicitud.tipoPrestacion, false);
        });
    }

    /**
     * Confirmamos validacion y guardamos
     * @memberof PrestacionValidacionComponent
     */
    validar() {
        let existeDiagnostico = this.prestacion.ejecucion.registros.find(p => p.esDiagnosticoPrincipal === true);
        if (existeDiagnostico) {
            this.plex.confirm('Luego de validar la prestación no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
                if (!validar) {
                    return false;
                } else {
                    let planes = this.prestacion.ejecucion.registros.filter(r => r.esSolicitud);
                    this.servicioPrestacion.validarPrestacion(this.prestacion, planes).subscribe(prestacion => {
                        this.prestacion = prestacion;
                        this.cargaPlan(prestacion.id);
                        this.diagnosticoReadonly = true;
                        // actualizamos las prestaciones de la HUDS
                        this.servicioPrestacion.getByPaciente(this.paciente.id, true).subscribe(resultado => {
                        });
                        this.plex.toast('success', 'La prestación se valido correctamente');
                    }, (err) => {
                        this.plex.toast('danger', 'ERROR: No es posible validar la prestación');
                    });
                }
            });
        } else {
            this.plex.toast('warning', 'Debe seleccionar un diagnostico principal');
        }
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

    cargaPlan(id) {
        this.servicioPrestacion.get({ idPrestacionOrigen: id }).subscribe(prestacionSolicitud => {
            let arraySolicitudes = prestacionSolicitud;
            this.prestacion.ejecucion.registros.forEach(registro => {
                arraySolicitudes.forEach(prestacionSolicitada => {
                    if (registro.concepto.conceptId === prestacionSolicitada.solicitud.tipoPrestacion.conceptId) {
                        registro.prestacionSolicitud = prestacionSolicitada;
                    }
                });
            });
        });
    }
    diagnosticoPrestacion(i) {
        let actual = this.prestacion.ejecucion.registros.find(p => p.esDiagnosticoPrincipal === true);
        if (actual) {
            actual.esDiagnosticoPrincipal = false;
        }
    }
}

