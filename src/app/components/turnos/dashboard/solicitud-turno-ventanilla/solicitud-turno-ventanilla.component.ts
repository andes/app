import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { OrganizacionService } from './../../../../services/organizacion.service';
import { Component, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';
import { enumToArray } from '../../../../utils/enums';
import { PrioridadesPrestacion } from './../../enums';


// Interfaces
import { IAgenda } from '../../../../interfaces/turnos/IAgenda';

// Servicios
import { AgendaService } from '../../../../services/turnos/agenda.service';

@Component({
    selector: 'solicitud-turno-ventanilla',
    templateUrl: 'solicitud-turno-ventanilla.html'
})

export class SolicitudTurnoVentanillaComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;


    public autorizado = false;
    public modelo: any = {};

    public prioridadesPrestacion = enumToArray(PrioridadesPrestacion);

    constructor(
        public servicioTipoPrestacion: TipoPrestacionService,
        public servicioOrganizacion: OrganizacionService,
        public servicioProfesional: ProfesionalService,
        public serviceAgenda: AgendaService,
        public auth: Auth,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        // No está autorizado para ver esta pantalla
        if (!this.autorizado) {
            this.redirect('inicio');
        } else {
            this.plex.toast('danger', 'TODO', 'TODO', 4000);
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

    guardarSolicitud() {

        // let alertCount = 0;
        // this.turnosSeleccionados.forEach((turno, index) => {

        //     let patch = {
        //         'op': 'guardarNotaTurno',
        //         'idAgenda': this.agenda.id,
        //         'idTurno': turno.id,
        //         'textoNota': this.nota
        //     };

        //     this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {

        //         if (alertCount === 0) {
        //             if (this.turnosSeleccionados.length === 1) {
        //                 this.plex.toast('success', 'La Nota se guardó correctamente');
        //             } else {
        //                 this.plex.toast('success', 'Las Notas se guardaron correctamente');
        //             }
        //             alertCount++;
        //         }

        //         this.agenda = resultado;
        //         if (index === this.turnosSeleccionados.length - 1) {
        //             this.saveAgregarNotaTurno.emit();
        //         }
        //     },
        //         err => {
        //             if (err) {
        //                 console.log(err);
        //             }
        //         });

        // });
    }

    cancelar() {
        // this.cancelaAgregarNota.emit(true);
        // this.turnosSeleccionados = [];
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

}