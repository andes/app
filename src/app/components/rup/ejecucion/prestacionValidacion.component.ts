import { element } from 'protractor';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

// Rutas
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ElementosRupService } from './../../../services/rup/elementosRUP.service';
import { PacienteService } from '../../../services/paciente.service';

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
    /**
     * Solicitud de prestación para dar un turno autocitado
     */
    public: any;
    solicitudTurno;
    public registros: any[] = [];

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioElementosRUP: ElementosRupService,
        private servicioPaciente: PacienteService,
        public plex: Plex, public auth: Auth, private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];

            this.inicializar(id);
        });
    }

    inicializar(id) {
        // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
        this.servicioPrestacion.getById(id).subscribe(prestacion => {
            this.prestacion = prestacion;

            this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                this.paciente = paciente;
            });

            this.servicioElementosRUP.get({}).subscribe(elementosRup => {
                this.elementosRUP = elementosRup;
                // this.elementoRUPprestacion = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, prestacion.solicitud.tipoPrestacion, prestacion.ejecucion.registros[0].tipo);
                this.cargaRegistros();
            });
        });
    }

    cargaRegistros() {
        this.registros = [];
        let data: any;
        this.prestacion.ejecucion.registros.forEach(element => {
            let elementoRUP = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, element.concepto, element.tipo);

            // buscamos las prestaciones solicitadas luego de la validacion
            this.servicioPrestacion.get({ idPrestacionOrigen: this.prestacion.id }).subscribe(prestacionesSolicitadas => {

                // buscamos si el registro ahora es un plan creado (luego que hemos validado)
                let registroPlan = prestacionesSolicitadas.find(p => p.solicitud.tipoPrestacion.conceptId === element.concepto.conceptId);

                data = {
                    elementoRUP: elementoRUP,
                    concepto: element.concepto,
                    valor: element.valor,
                    tipo: element.tipo,
                    destacado: element.destacado ? element.destacado : false,
                    relacionadoCon: element.relacionadoCon ? element.relacionadoCon : null,
                    ...(registroPlan) && { prestacionPlan: registroPlan }
                };

                this.registros.push(data);
                // console.log(this.registros);
            });

        });
    }

    /**
     * Confirmamos validacion y guardamos
     * @memberof PrestacionValidacionComponent
     */
    validar() {
        this.plex.confirm('Luego de validar la prestación no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
            if (!validar) {
                return false;
            } else {
                // de los registros a
                let planes = this.registros.filter(r => r.tipo === 'planes');

                this.servicioPrestacion.validarPrestacion(this.prestacion, planes).subscribe(prestacion => {
                    this.prestacion = prestacion;

                    // recargamos los registros
                    this.cargaRegistros();

                }, (err) => {
                    this.plex.toast('danger', 'ERROR: No es posible validar la prestación');
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

    darTurnoAutocitado(prestacionSolicitud) {
        this.solicitudTurno = prestacionSolicitud;
        this.showDarTurnos = true;
        // DEBERÍA VENIR POR PARÁMETRO --- VER LINEA 148
        // this.solicitudTurno = null;
    }

}

