import { element } from 'protractor';
import { ElementosRupService } from './../../../services/rup/elementosRUP.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
// Rutas
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'rup-prestacionValidacion',
    templateUrl: 'prestacionValidacion.html'
})
export class PrestacionValidacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    // prestacion actual en ejecucion
    public prestacion: any;
    // array de elementos RUP que se pueden ejecutar
    public elementosRUP: any[];
    // elementoRUP de la prestacion actual
    public elementoRUPprestacion: any;

    public registros: any[] = [];

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioElementosRUP: ElementosRupService,
        public plex: Plex, public auth: Auth, private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];
            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
            this.servicioPrestacion.getById(id).subscribe(prestacion => {
                this.prestacion = prestacion;
                this.servicioElementosRUP.get({}).subscribe(elementosRup => {
                    this.elementosRUP = elementosRup;
                    // this.elementoRUPprestacion = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, prestacion.solicitud.tipoPrestacion, prestacion.ejecucion.registros[0].tipo);
                    this.cargaRegistros();
                });
            });
        });
    }

    cargaRegistros() {
        let data: any;
        this.prestacion.ejecucion.registros.forEach(element => {
            let elementoRUP = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, element.concepto, element.tipo);
            data = {
                elementoRUP: elementoRUP,
                concepto: element.concepto,
                valor: element.valor,
                tipo: element.tipo,
                destacado: element.destacado ? element.destacado : false,
                relacionadoCon: element.relacionadoCon ? element.relacionadoCon : null
            };
            console.log(data);
            this.registros.push(data);
        });
        console.log(this.registros);
    }

    validar() {
        console.log(this.registros);
        // hacemos el patch y luego creamos los planes
        let cambioEstado: any = {
            op: 'estadoPush',
            estado: { tipo: 'validada' }
        };

        // Vamos a cambiar el estado de la prestación a ejecucion
        this.servicioPrestacion.patch(this.prestacion.id, cambioEstado).subscribe(prestacion => {

            // buscamos los planes dentro de los registros
            let planes = this.registros.filter(r => r.tipo === 'planes');

            if (planes.length) {
                planes.forEach(plan => {

                    let nuevaPrestacion;
                    nuevaPrestacion = {
                        paciente: this.prestacion.paciente,
                        solicitud: {
                            tipoPrestacion: plan.concepto,
                            fecha: new Date(),
                            turno: null,
                            hallazgos: [],
                            prestacionOrigen: null,
                            // profesional logueado
                            profesional:
                            {
                                id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                                apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                            },
                            // organizacion desde la que se solicita la prestacion
                            organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.id.nombre },
                        },
                        estados: {
                            fecha: new Date(),
                            tipo: 'pendiente'
                        }
                    };

                    this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
                        this.plex.alert('Prestación creada.').then(() => {
                            // this.router.navigate(['/rup/ejecucion', prestacion.id]);
                        });
                    }, (err) => {
                        this.plex.toast('danger', 'ERROR: No fue posible crear la prestación');
                    });


                });
            }
        }, (err) => {
            this.plex.toast('danger', 'ERROR: No es posible validar la prestación');
        });

    }

    volver() {
        this.router.navigate(['rup/ejecucion/', this.prestacion.id]);
    }
}

