import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { TurnoService } from '../../../services/turnos/turno.service';

@Component({
    selector: 'nueva-solicitud',
    templateUrl: './nuevaSolicitud.html',
})
export class NuevaSolicitudComponent {
    showSeleccionarPaciente = true;
    paciente: any;
    profesionalDestino: any;
    organizacionDestino: any;
    registros: any = {
        solicitudPrestacion: {
            profesionales: [],
            motivo: '',
            autocitado: false
        }
    };
    modelo: any = {
        paciente: {},
        profesional: {},
        organizacion: {},
        solicitud: {
            fecha: null,
            paciente: {},
            organizacion: {},
            profesional: {},
            organizacionOrigen: this.auth.organizacion,
            profesionalOrigen: {},
            turno: null
        },
        estados: [
            { tipo: 'pendiente' }
        ]
    };

    permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');


    @Output() newSolicitudEmitter: EventEmitter<any> = new EventEmitter<any>();
    constructor(
        private router: Router,
        private plex: Plex,
        private auth: Auth,
        private servicioTipoPrestacion: TipoPrestacionService,
        private servicioOrganizacion: OrganizacionService,
        private servicioProfesional: ProfesionalService,
        private servicioPrestacion: PrestacionesService,
        public servicioTurnos: TurnoService
    ) { }


    seleccionarPaciente(paciente: any): void {
        if (paciente.id) {
            this.paciente = paciente;
            this.showSeleccionarPaciente = false;
        }
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(resultado => {
                event.callback(resultado);
            });
        }
    }

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data: any) => {
            let dataF;
            if (this.permisos[0] === '*') {
                dataF = data;
            } else {
                dataF = data.filter((x) => { return this.permisos.indexOf(x.id) >= 0; });
            }
            event.callback(dataF);
        });
    }

    guardarSolicitud($event) {

        if ($event.formValid) {

            this.modelo.solicitud.registros = {
                nombre: this.modelo.solicitud.tipoPrestacion.term,
                concepto: this.modelo.solicitud.tipoPrestacion,
                valor: {
                    solicitudPrestacion: this.registros.solicitudPrestacion
                },
                tipo: 'solicitud'
            };

            this.modelo.paciente = this.paciente;
            this.modelo.solicitud.organizacion = this.organizacionDestino;
            this.modelo.solicitud.profesional = this.profesionalDestino ? this.profesionalDestino : { id: this.auth.profesional.id, nombre: this.auth.usuario.nombre, apellido: this.auth.usuario.apellido };
            this.modelo.solicitud.organizacionOrigen = this.auth.organizacion;
            this.modelo.solicitud.profesionalOrigen = { id: this.auth.profesional.id, nombre: this.auth.usuario.nombre, apellido: this.auth.usuario.apellido };

            // Se guarda la solicitud 'pendiente' de prestación
            this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {
                this.newSolicitudEmitter.emit();
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
                // this.showCargarSolicitud = false;
                // this.showBotonCargarSolicitud = true;

                this.modelo = {
                    paciente: this.paciente,
                    profesional: {},
                    organizacion: {},
                    solicitud: {
                        fecha: null,
                        paciente: {},
                        organizacion: {},
                        organizacionOrigen: this.auth.organizacion,
                        profesional: {},
                        profesionalOrigen: {},
                        turno: null
                    },
                    estados: [
                        { tipo: 'pendiente' }
                    ]
                };
                this.registros = {
                    solicitudPrestacion: {
                        profesionales: [],
                        motivo: '',
                        autocitado: false,
                    }
                };

            });

        } else {
            this.plex.alert('Debe completar los datos requeridos');
        }
    }

    cancelar() {
        this.modelo = {
            paciente: this.paciente,
            profesional: {},
            organizacion: this.auth.organizacion,
            solicitud: {
                fecha: null,
                paciente: {},
                organizacion: {},
                organizacionOrigen: this.auth.organizacion,
                profesional: {},
                profesionalOrigen: {},
                turno: null
            },
            estados: [
                { tipo: 'pendiente' }
            ]
        };
        this.registros = {
            solicitudPrestacion: {
                profesionales: [],
                motivo: '',
                autocitado: false
            }
        };
        this.newSolicitudEmitter.emit();
    }
}
