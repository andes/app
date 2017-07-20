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

    public autorizado = false;
    public modelo: any = {};
    public registros = [];

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

        // No está autorizado para ver esta pantalla
        if (!this.autorizado) {
            this.redirect('inicio');
        } else {

            this.modelo.solicitud = {};
            this.modelo.estados = [];
            this.modelo.estados.push({
                tipo: 'pendiente'
            });

            // this.modelo.paciente = this.paciente;

            let pacienteSave = {
                id: this.paciente.id,
                documento: this.paciente.documento,
                apellido: this.paciente.apellido,
                nombre: this.paciente.nombre,
                sexo: this.paciente.sexo,
                fechaNacimiento: this.paciente.fechaNacimiento,
                telefono: ''
            };

            this.modelo.paciente = pacienteSave;

            // this.modelo.paciente.id = this.paciente.id;
            // this.modelo.paciente._id = this.paciente.id;
            // this.modelo.paciente.apellido = this.paciente.apellido;
            // this.modelo.paciente.nombre = this.paciente.nombre;
            // this.modelo.paciente.documento = this.paciente.documento;
            // this.modelo.paciente.fechaNacimiento = this.paciente.fechaNacimiento;
            // this.modelo.paciente.sexo = this.paciente.sexo;
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

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({}).subscribe(prestaciones => {
            event.callback(prestaciones);
        });
    }

    guardarSolicitud($event) {

        if ($event.formValid) {

            delete this.modelo.solicitud.organizacion.$order;
            delete this.modelo.solicitud.profesional.$order;
            delete this.modelo.solicitud.tipoPrestacion.$order;
            this.modelo.solicitud.registros = {
                concepto: this.modelo.solicitud.tipoPrestacion,
                valor: this.registros,
                tipo: 'solicitud'
            };

            let params = this.modelo;

            this.servicioPrestacion.post(params).subscribe(respuesta => {
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
            });
        } else {
            this.plex.alert('Debe completar los datos requeridos');
        }
    }

    cancelar() {
        this.cancelarSolicitudVentanilla.emit(true);
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

}