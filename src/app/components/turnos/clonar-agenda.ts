import { Component, OnInit } from '@angular/core';
import { AgendaService } from './../../services/turnos/agenda.service';
import { FormBuilder } from '@angular/forms';

@Component({
    selector: 'clonar-agenda',
    templateUrl: 'clonar-agenda.html'
})

export class ClonarAgendaComponent implements OnInit {
    constructor(private formBuilder: FormBuilder, private ServicioAgenda: AgendaService) { }
    ngOnInit() {
    }

}