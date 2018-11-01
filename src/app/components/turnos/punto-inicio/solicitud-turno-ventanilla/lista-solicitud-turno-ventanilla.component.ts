import { Component, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';

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
    showCargarSolicitud = false;
    // VER SI HACE FALTA
    // public prioridadesPrestacion = enumToArray(PrioridadesPrestacion);

    constructor(
        public servicioPrestacion: PrestacionesService,
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
            estados: [
                'auditoria', // solicitudes a ser auditadas, pueden pasar a rechazadas o a pendientes
                'pendiente', // solicitudes pendientes pueden tener o no turno asociado, están pendientes de ejecución
                'rechazada', // solicitudes rechazadas en el proceso de auditoría
                'validada'   // solicitudes validadas, si tienen turno asociado veremos la información
            ]
        };

        this.servicioPrestacion.getSolicitudes(params).subscribe(resultado => {
            this.solicitudesPrestaciones = this.sortSolicitudees(resultado);
        });
    }

    private sortSolicitudees(solicitudes) {
        return solicitudes.sort((a, b) => {
            let inia = a.solicitud.fecha ? new Date(a.solicitud.fecha) : null;
            let inib = b.solicitud.fecha ? new Date(b.solicitud.fecha) : null;
            {
                return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
            }
            ;
        });

    }

    // Emite a <solicitud-turno-ventanilla> la solicitud/prestación completa para usar en darTurno
    solicitudPrestacionDarTurno(prestacionSolicitud) {
        this.solicitudPrestacionEmit.emit(prestacionSolicitud);
    }

    formularioSolicitud() {
        this.showCargarSolicitud = true;
    }

    cerrarSolicitudVentanilla(event) {
        this.showCargarSolicitud = false;
    }
    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }
}
