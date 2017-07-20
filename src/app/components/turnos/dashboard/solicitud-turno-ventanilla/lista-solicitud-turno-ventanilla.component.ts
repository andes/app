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
    selector: 'lista-solicitud-turno-ventanilla',
    templateUrl: 'lista-solicitud-turno-ventanilla.html'
})

export class ListaSolicitudTurnoVentanillaComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    private _paciente: any;

    @Input('paciente')
    set paciente(value: any) {
        this._paciente = value;
        this.cargarSolicitudes();
    }
    get paciente(): any {
        return this._paciente;
    }

    @Output() solicitudPrestacionEmit = new EventEmitter<any>();

    public autorizado = false;
    public solicitudesPrestaciones = [];

    // VER SI HACE FALTA
    // public prioridadesPrestacion = enumToArray(PrioridadesPrestacion);

    constructor(
        public servicioPrestacion: PrestacionPacienteService,
        public auth: Auth,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {

        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;

        // No está autorizado para ver esta pantalla
        if (!this.autorizado) {
            this.redirect('inicio');
        } else {

            this.cargarSolicitudes();

        }
    }

    cargarSolicitudes() {
        let params = {
            idPaciente: this.paciente.id,
            idPrestacionOrigen: null
        };
        this.servicioPrestacion.get(params).subscribe(resultado => {
            this.solicitudesPrestaciones = resultado;
        });
    }

    // Emite a <solicitud-turno-ventanilla> la solicitud/prestación completa para usar en darTurno
    solicitudPrestacionDarTurno(prestacionSolicitud) {
        this.solicitudPrestacionEmit.emit(prestacionSolicitud);
    }


    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

}