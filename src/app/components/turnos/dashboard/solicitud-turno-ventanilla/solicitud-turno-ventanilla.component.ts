import { EdadPipe } from './../../../../pipes/edad.pipe';
import { Component, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';

// Services
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { OrganizacionService } from './../../../../services/organizacion.service';

// Interfaces
import { IPaciente } from './../../../../interfaces/IPaciente';

@Component({
    selector: 'solicitud-turno-ventanilla',
    templateUrl: 'solicitud-turno-ventanilla.html'
})

export class SolicitudTurnoVentanillaComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    // @Input('paciente') paciente: IPaciente;

    private _paciente: any;

    @Input('paciente')
    set paciente(value: any) {
        this._paciente = value;
        // Se crea un paciente que coincida con el schema de la collection 'prestacion'
        let paciente = {
            id: this.paciente.id,
            documento: this.paciente.documento,
            apellido: this.paciente.apellido,
            nombre: this.paciente.nombre,
            sexo: this.paciente.sexo,
            fechaNacimiento: this.paciente.fechaNacimiento,
            telefono: ''
        };


        // Se agrega el paciente al modelo
        this.modelo.paciente = paciente;
    }
    get paciente(): any {
        return this._paciente;
    }

    @Output() cancelarSolicitudVentanilla = new EventEmitter<boolean>();
    @Output() mostrarDarTurnoSolicitud = new EventEmitter<any>();

    public permisos = [];
    public autorizado = false;

    public modelo: any = {
        paciente: {},
        profesional: {},
        organizacion: {},
        solicitud: {
            fecha: null,
            paciente: {},
            organizacion: {},
            profesional: {},
            organizacionOrigen: {},
            profesionalOrigen: {},
            turno: null
        },
        estados: [
            { tipo: 'pendiente' }
        ]
    };
    public registros: any = {
        solicitudPrestacion: {
            profesionales: [],
            motivo: '',
            autocitado: false
        }
    };

    public showCargarSolicitud = false;
    public showBotonCargarSolicitud = true;

    // VER SI HACE FALTA
    // public prioridadesPrestacion = enumToArray(PrioridadesPrestacion);

    constructor(
        private servicioPrestacion: PrestacionesService,
        private servicioTipoPrestacion: TipoPrestacionService,
        private servicioOrganizacion: OrganizacionService,
        private servicioProfesional: ProfesionalService,
        private auth: Auth,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {

        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        this.showCargarSolicitud = false;

        // Está autorizado para ver esta pantalla?
        if (!this.autorizado) {
            this.redirect('inicio');
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
        // this.servicioOrganizacion.get({}).subscribe(organizaciones => {
        //     event.callback(organizaciones);
        // });
    }

    // loadProfesionales(event) {
    //     this.servicioProfesional.get({}).subscribe(profesionales => {
    //         event.callback(profesionales);
    //     });
    // }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                if (this.modelo.profesionales) {
                    listaProfesionales = (resultado) ? this.modelo.solicitud.profesional.concat(resultado) : this.modelo.profesionales;
                } else {
                    listaProfesionales = resultado;
                }
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.modelo.solicitud.profesional);
        }
    }

    loadProfesionalesMulti(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                if (this.registros.solicitudPrestacion.profesionales) {
                    listaProfesionales = (resultado) ? this.registros.solicitudPrestacion.profesionales.concat(resultado) : this.registros.solicitudPrestacion.profesionales;
                } else {
                    listaProfesionales = resultado;
                }
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.registros.solicitudPrestacion.profesionales);
        }
    }

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
            let dataF;
            if (this.permisos[0] === '*') {
                dataF = data;
            } else {
                dataF = data.filter((x) => { return this.permisos.indexOf(x.id) >= 0; });
            }
            event.callback(dataF);
        });
    }

    formularioSolicitud() {
        this.showCargarSolicitud = true;
        this.showBotonCargarSolicitud = false;
    }

    guardarSolicitud($event) {

        if ($event.formValid && this.modelo.solicitud.organizacion._id && this.modelo.solicitud.profesional._id) {

            // Se limpian keys del bendito plex-select
            delete this.modelo.solicitud.organizacion.$order;
            delete this.modelo.solicitud.profesional.$order;
            delete this.modelo.solicitud.tipoPrestacion.$order;
            if (this.registros.solicitudPrestacion.profesionales) {
                this.registros.solicitudPrestacion.profesionales.filter(profesional => {
                    return delete profesional.$order;
                });
            }

            this.modelo.solicitud.registros = {
                nombre: this.modelo.solicitud.tipoPrestacion.term,
                concepto: this.modelo.solicitud.tipoPrestacion,
                valor: {
                    solicitudPrestacion: this.registros.solicitudPrestacion
                },
                tipo: 'solicitud'
            };

            this.modelo.solicitud.organizacion = this.modelo.solicitud.organizacionDestino;
            this.modelo.solicitud.profesional = this.modelo.solicitud.profesionalesDestino ? this.modelo.solicitud.profesionalesDestino : { id: this.auth.profesional.id, nombre: this.auth.usuario.nombre, apellido: this.auth.usuario.apellido };
            this.modelo.solicitud.organizacionOrigen = this.auth.organizacion;
            this.modelo.solicitud.profesionalOrigen = { id: this.auth.profesional.id, nombre: this.auth.usuario.nombre, apellido: this.auth.usuario.apellido };

            // Se guarda la solicitud 'pendiente' de prestación
            this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {

                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
                this.showCargarSolicitud = false;
                this.showBotonCargarSolicitud = true;

                this.modelo = {
                    paciente: this.paciente,
                    profesional: {},
                    organizacion: {},
                    solicitud: {
                        fecha: null,
                        paciente: {},
                        profesional: {},
                        organizacion: {},
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

    // Emite a <puntoInicio-turnos> la solicitud/prestación completa que viene de <lista-solicitud-turno-ventanilla> para usarse en darTurno
    solicitudPrestacionDarTurno(event) {
        this.mostrarDarTurnoSolicitud.emit(event);
    }

    cancelar() {
        // this.modelo.solicitud = {};
        // this.registros = [];
        this.showCargarSolicitud = false;
        this.showBotonCargarSolicitud = true;
        this.showCargarSolicitud = false;
        // this.cancelarSolicitudVentanilla.emit(true);

        this.modelo = {
            paciente: this.paciente,
            profesional: {},
            organizacion: {},
            solicitud: {
                fecha: null,
                paciente: {},
                profesional: {},
                organizacion: {},
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

    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

}
