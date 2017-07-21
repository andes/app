import { PrestacionPacienteService } from './../../../../services/rup/prestacionPaciente.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { OrganizacionService } from './../../../../services/organizacion.service';
import { Component, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';

// Interfaces
import { IPaciente } from './../../../../interfaces/IPaciente';

@Component({
    selector: 'solicitud-turno-ventanilla',
    templateUrl: 'solicitud-turno-ventanilla.html'
})

export class SolicitudTurnoVentanillaComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    @Input('paciente') paciente: IPaciente;
    @Output() cancelarSolicitudVentanilla = new EventEmitter<boolean>();
    @Output() mostrarDarTurnoSolicitud = new EventEmitter<any>();

    public autorizado = false;

    public modelo: any = {
        paciente: {},
        profesional: {},
        organizacion: {},
        solicitud: {
            fecha: null,
            paciente: {},
            profesional: {},
            organizacion: {},
            turno: null
        },
        estados: []
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
        public servicioPrestacion: PrestacionPacienteService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public servicioOrganizacion: OrganizacionService,
        public servicioProfesional: ProfesionalService,
        public auth: Auth,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {

        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;

        // Está autorizado para ver esta pantalla?
        if (!this.autorizado) {
            this.redirect('inicio');
        } else {
            this.modelo.estados.push({
                tipo: 'pendiente'
            });

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
    }

    loadOrganizacion(event) {
        this.servicioOrganizacion.get({}).subscribe(organizaciones => {
            event.callback(organizaciones);
        });
    }

    loadProfesionales(event) {
        this.servicioProfesional.get({}).subscribe(profesionales => {
            event.callback(profesionales);
        });
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
            event.callback(this.registros.solicitudPrestacion.profesionales || []);
        }
    }

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({}).subscribe(prestaciones => {
            event.callback(prestaciones);
        });
    }

    formularioSolicitud() {
        this.showCargarSolicitud = true;
        this.showBotonCargarSolicitud = false;
    }

    guardarSolicitud($event) {

        if ($event.formValid) {

            delete this.modelo.solicitud.organizacion.$order;
            delete this.modelo.solicitud.profesional.$order;
            delete this.modelo.solicitud.tipoPrestacion.$order;

            this.registros.solicitudPrestacion.profesionales.filter(profesional => {
                return delete profesional.$order;
            });

            this.modelo.solicitud.registros = {
                concepto: this.modelo.solicitud.tipoPrestacion,
                valor: {
                    solicitudPrestacion: this.registros.solicitudPrestacion
                },
                tipo: 'solicitud'
            };

            // Se guarda la solicitud 'pendiente' de prestación
            this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
                this.modelo.solicitud.registros = {};
                this.registros.solicitudPrestacion = {};
                this.showCargarSolicitud = false;
                this.showBotonCargarSolicitud = true;
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
        this.modelo.solicitud = {};
        this.registros = [];
        this.showCargarSolicitud = false;
        this.showBotonCargarSolicitud = true;
        this.cancelarSolicitudVentanilla.emit(true);
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

}