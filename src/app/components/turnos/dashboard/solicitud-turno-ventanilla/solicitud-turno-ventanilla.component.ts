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
// import { enumToArray } from '../../../../utils/enums';
// import { PrioridadesPrestacion } from './../../enums';

@Component({
    selector: 'solicitud-turno-ventanilla',
    templateUrl: 'solicitud-turno-ventanilla.html'
})

export class SolicitudTurnoVentanillaComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

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

            // PACIENTE ACá NATIIIIII
            this.modelo.paciente = {
                '_id': '586e6e8427d3107fde10fa11',
                'documento': '39083443',
                'nombre': 'MONICA AINARA',
                'apellido': 'CARRASCO',
                'sexo': 'femenino',
                'fechaNacimiento': '1995-10-14T03:00:00.000Z',
                'telefono': '2995153807'
            };

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