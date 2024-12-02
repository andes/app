import { Component, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';

// Interfaces
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';

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
    public tipoSolicitud = 'entrada';
    public itemsDropdown = [
        {
            id: 'entrada', label: 'ENTRADA', handler: () => {
                this.formularioSolicitud('entrada');
            }
        },
        {
            id: 'salida', label: 'SALIDA', handler: () => {
                this.formularioSolicitud('salida');
            }
        }
    ];
    // VER SI HACE FALTA
    // public prioridadesPrestacion = enumToArray(PrioridadesPrestacion);
    public puedeCrearSolicitud = false;
    constructor(
        public servicioPrestacion: PrestacionesService,
        public auth: Auth,
        private router: Router
    ) { }

    ngOnInit() {
        this.puedeCrearSolicitud = this.auth.check('turnos:puntoInicio:solicitud');
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        // No está autorizado para ver esta pantalla
        if (!this.autorizado) {
            this.redirect('inicio');
        } else {
            this.cargarSolicitudes();
        }
    }

    cargarSolicitudes() {
        const params = {
            idPaciente: this.paciente.id,
            estados: [
                'auditoria', // solicitudes a ser auditadas, pueden pasar a rechazadas o a pendientes
                'pendiente', // solicitudes pendientes pueden tener o no turno asociado, están pendientes de ejecución
                'asignada',
                'anulada'
            ]
        };

        this.servicioPrestacion.getSolicitudes(params).subscribe(resultado => {
            this.solicitudesPrestaciones = this.sortSolicitudes(resultado);
        });
    }

    private sortSolicitudes(solicitudes) {
        return solicitudes.sort((a, b) => {
            const inia = a.solicitud.fecha ? new Date(a.solicitud.fecha) : null;
            const inib = b.solicitud.fecha ? new Date(b.solicitud.fecha) : null;
            return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
        });

    }

    formularioSolicitud(tipoSolicitud) {
        this.showCargarSolicitud = true;
        this.tipoSolicitud = tipoSolicitud;
    }

    cerrarSolicitudVentanilla(event) {
        this.cargarSolicitudes();
        this.showCargarSolicitud = false;
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    darTurno(prestacion: IPrestacion) {
        this.solicitudPrestacionEmit.emit(prestacion);
    }

    puedeDarTurno(prestacion: IPrestacion) {
        return !prestacion.solicitud?.turno && prestacion.estadoActual.tipo === 'pendiente' && this.auth.organizacion.id === prestacion.solicitud.organizacion.id;
    }

    verEstado(prestacion: IPrestacion) {
        return !prestacion.solicitud?.turno && (this.auth.organizacion.id === prestacion?.solicitud?.organizacion?.id) && prestacion.inicio !== 'servicio-intermedio';
    }

    pendienteAuditada(prestacion: IPrestacion) {
        return prestacion.estados[prestacion.estados.length - 1]?.tipo === 'pendiente' || prestacion.estados[prestacion.estados.length - 1]?.tipo === 'auditoria';
    }
}
