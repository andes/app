import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../services/turnos/agenda.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IAgenda } from './../../interfaces/turnos/IAgenda';

@Component({
    selector: 'buscar-agendas',
    templateUrl: 'buscar-agendas.html'
})

export class BuscarAgendasComponent implements OnInit {

    public modelo: any = {};
    public tipoPrestaciones: any = [];
    public agendas: any = [];

    showBuscarAgendas: boolean = true;
    showAgenda: boolean = false;
    seleccionada: boolean = false;

    @Output()
    selected: EventEmitter<IAgenda> = new EventEmitter<IAgenda>();

    searchForm: FormGroup;

    constructor(public plex: Plex, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService, public serviceAgenda: AgendaService, private formBuilder: FormBuilder,
        public servicioTipoPrestacion: TipoPrestacionService) { }

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            fechaDesde: new Date(),
            fechaHasta: new Date(),
            tipoPrestaciones: [''],
            profesionales: [''],
            espacioFisico: [''],
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            value.fechaHasta.setHours(23);
            value.fechaHasta.setMinutes(59);
            value.fechaHasta.setSeconds(59);
            this.serviceAgenda.get({
                fechaDesde: value.fechaDesde,
                fechaHasta: value.fechaHasta,
                idTipoPrestacion: value.tipoPrestaciones.id,
                idProfesional: value.profesionales.id,
                idEspacioFisico: value.espacioFisico.id
            }).subscribe(
                agendas => { this.agendas = agendas; },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
        });

        this.modelo = {
            fecha: [''],
            horaInicio: [''],
            horaFin: [''],
            espacioFisico: ['']
        };
    }

    loadTipoPrestaciones(event) {
        // this.servicioPrestacion.get({}).subscribe(event.callback);
        this.servicioTipoPrestacion.get({turneable:1}).subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get({}).subscribe(event.callback);
    }

    loadEspaciosFisicos(event) {
        this.serviceEspacioFisico.get({}).subscribe(event.callback);
    }

    editarAgenda(agenda: IAgenda) {
        // TODO: chequear que no me deje editar para algunos estados de la agenda, o para una agenda con fecha anterior?
        this.selected.emit(agenda);
    }

    verAgenda(agenda) {
        this.seleccionada = true;
        let fecha = new Date(agenda.horaInicio);
        let horaFin = new Date(agenda.horaFin);
        this.modelo = {
            fecha: fecha.getDate() + '/' + fecha.getMonth() + '/' + fecha.getFullYear(),
            horaInicio: fecha.getHours() + ':' + (fecha.getMinutes() < 10 ? '0' : '') + fecha.getMinutes(),
            horaFin: horaFin.getHours() + ':' + (horaFin.getMinutes() < 10 ? '0' : '') + horaFin.getMinutes(),
            profesionales: agenda.profesionales,
            tipoPrestaciones: agenda.tipoPrestaciones,
            espacioFisico: agenda.espacioFisico.nombre,
            bloques: agenda.bloques
        };
    }
}
