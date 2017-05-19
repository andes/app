import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { PacienteService } from '../../../services/paciente.service';
import * as moment from 'moment';

@Component({
    selector: 'lista-turnos',
    templateUrl: 'lista-turnos.html'
})

export class ListaTurnosComponent implements OnInit {
    private _agenda: IAgenda;
    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
        this.horaInicio = moment(this._agenda.horaInicio).format('dddd').toUpperCase();
        this.bloques = this.agenda.bloques;
        for (let i = 0; i < this.bloques.length; i++) {
            this.turnos = (this.bloques[i].turnos).filter((turno) => { return turno.estado === 'asignado'; });
            for (let t = 0; t < this.turnos.length; t++) {
                // let params = { documento: this.turnos[t].paciente.documento, organizacion: this.auth.organizacion.id };
                this.servicePaciente.getById(this.turnos[t].paciente.id).subscribe((paciente) => {
                    if (paciente && paciente.carpetaEfectores) {
                        let carpetaEfector = null;
                        carpetaEfector = paciente.carpetaEfectores.filter((data) => {
                            return (data.organizacion.id === this.auth.organizacion.id);
                        });
                        console.log('carpeta ', carpetaEfector);
                    }
                });
            }
            this.bloques[i].turnos = this.turnos;
        }
    }
    get agenda(): any {
        return this._agenda;
    }

    turnos = [];
    bloques = [];
    horaInicio: any;

    // Contiene el cálculo de la visualización de botones
    botones: any = {};

    constructor(public plex: Plex, public servicePaciente: PacienteService, public auth: Auth) { }

    ngOnInit() {
    }

}
