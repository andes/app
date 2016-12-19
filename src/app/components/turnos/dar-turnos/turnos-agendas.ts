import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PrestacionService } from './../../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../../services/profesional.service';
import { EspacioFisicoService } from './../../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../../services/turnos/agenda.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';

@Component({
    selector: 'turnos-agendas',
    templateUrl: 'turnos-agendas.html'
})
export class TurnosAgendaComponent implements OnInit {
    constructor(public plex: Plex, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService, public serviceAgenda: AgendaService, private formBuilder: FormBuilder) { }

    public prestaciones: any = [];
    private _agendas: IAgenda[];
    private _agenda: IAgenda;
    public turnos: any = [];

    semana: String[] = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sabado"];
    showBuscarAgendas: boolean = true;
    showAgenda: boolean = false;
    indice: number = -1;

    ngOnInit() {
    }

    @Output('agenda-changed') onChange = new EventEmitter();
    @Input('agendas')
    set agendas(value: Array<IAgenda>) {
        this._agendas = value;
        //this.verAgenda(true);
    }
    get agendas(): Array<IAgenda> {
        return this._agendas;
    }

    @Input('agenda')
    set agenda(value: IAgenda) {
        this._agenda = value;
        if (value)
            this.indice = this.agendas.indexOf(this.agenda);
    }
    get agenda(): IAgenda {
        return this._agenda;
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get().subscribe(event.callback);
    }

    loadEspaciosFisicos(event) {
        this.serviceEspacioFisico.get().subscribe(event.callback);
    }

    verAgenda(suma: boolean) {
        if (this.agendas) {
            var condiciones = suma ? ((this.indice + 1) < this.agendas.length) : ((this.indice - 1) >= 0);
            if (condiciones) {
                if (suma)
                    this.indice++
                else
                    this.indice--;
                this.agenda = this.agendas[this.indice];
                debugger
            }
        }
        if (this.agenda)
            this.onChange.emit(this.agenda);
    }
}