import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../services/turnos/agenda.service';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { IBloque } from './../../interfaces/turnos/IBloque';
import { TurnoService } from './../../services/turnos/turno.service';
import { TurnosComponent } from './turnos.component';
import { VistaAgendaComponent } from './vista-agenda.component';

@Component({
    templateUrl: 'gestor-agendas.html'
})

export class GestorAgendasComponent implements OnInit {

    @Output() data: EventEmitter<IAgenda> = new EventEmitter<IAgenda>();

    constructor(public plex: Plex, private formBuilder: FormBuilder, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService, public serviceAgenda: AgendaService, public serviceTurno: TurnoService) { }

    searchForm: FormGroup;

    public agendas: any = [];
    // public agendaSel: AgendaSeleccionada;
    // public modelo: any = {};
    // private _agenda: any;
    // public turnos: ITurno[];
    // public bloques: IBloque[];
    public agendaSel: AgendaSeleccionada;

    public showTurnos: boolean = false;
    public showVistaAgendas: boolean = false;
    
    ag: IAgenda;
    vistaAgenda: IAgenda;

    ngOnInit() {

        this.searchForm = this.formBuilder.group({
            fechaDesde: [new Date()],
            fechaHasta: [new Date()],
            prestaciones: [''],
            profesionales: [''],
            espacioFisico: [''],
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {

            this.serviceAgenda.get({
                "fechaDesde": value.fechaDesde,
                "fechaHasta": value.fechaHasta,
                "idPrestacion": value.prestaciones.id,
                "idProfesional": value.profesionales.id,
                "idEspacioFisico": value.espacioFisico.id
            }).subscribe(
                agendas => { this.agendas = agendas },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
        })
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get({}).subscribe(event.callback);
    }

    loadEspaciosFisicos(event) {
        this.serviceEspacioFisico.get().subscribe(event.callback);
    }

    verAgenda(agenda) {
        this.ag = agenda;
        this.vistaAgenda = agenda;

        debugger;
        if (this.agendaSel) {
            this.agendaSel.agendaSeleccionada = false;
            this.agendaSel.agendaSeleccionadaColor = 'default';
        }

        agenda.agendaSeleccionada = true;
        agenda.agendaSeleccionadaColor = 'success';

        this.agendaSel = agenda;

        this.showTurnos = true;
        this.showVistaAgendas = true;
    }  
}

class AgendaSeleccionada {
    public agendaSeleccionada: boolean;
    public agendaSeleccionadaColor: String;
}
//     verAgenda(agenda) {

//         var fecha = new Date(agenda.horaInicio);
//         var horaFin = new Date(agenda.horaFin);
//         this.modelo = {
//             fecha: fecha.getDate() + '/' + fecha.getMonth() + '/' + fecha.getFullYear(),
//             horaInicio: fecha.getHours() + ':' + (fecha.getMinutes() < 10 ? '0' : '') + fecha.getMinutes(),
//             horaFin: horaFin.getHours() + ':' + (horaFin.getMinutes() < 10 ? '0' : '') + horaFin.getMinutes(),
//             profesionales: agenda.profesionales,
//             prestaciones: agenda.prestaciones,
//             espacioFisico: agenda.espacioFisico.nombre,
//             bloques: agenda.bloques
//         };

//         this.agenda = agenda;

//         if (this.agendaSel) {
//             this.agendaSel.agendaSeleccionada = false;
//             this.agendaSel.agendaSeleccionadaColor = 'default';
//         }

//         agenda.agendaSeleccionada = true;
//         agenda.agendaSeleccionadaColor = 'success';

//         this.agendaSel = agenda;
//         debugger;
//         this.bloques = agenda.bloques;

//     }

//     set agenda(value: IAgenda) {
//         this._agenda = value;

//     }
// }

// class AgendaSeleccionada {
//     public agendaSeleccionada: boolean;
//     public agendaSeleccionadaColor: String;
// }