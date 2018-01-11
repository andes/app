import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
import * as moment from 'moment';

// Services
import { AgendaService } from '../../services/turnos/agenda.service';

@Component({
    selector: 'reporteC2',
    templateUrl: 'reporteC2.html',
    // styleUrls: ['reporteC2.css']
})

export class ReporteC2Component implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    private timeoutHandle: number;

    // Propiedades públicas
    public parametros;
    public horaInicio: any;
    public horaFin: any;
    public diagnosticos;
    public users;

    // Eventos
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex, private router: Router, private server: Server, private agendaService: AgendaService, private auth: Auth) {

    }

    public ngOnInit() {
        this.parametros = {
            horaInicio: '',
            horaFin: ''
        };
        this.diagnosticos = [];
    }

    public imprimir() {
        this.agendaService.findDiagnosticos(this.parametros).subscribe((diagnosticos) => {
            this.diagnosticos = diagnosticos;
            console.log('diagnosticos ', diagnosticos);
        });

    }

    refreshSelection(value, tipo) {
        if (tipo === 'fecha') {
            let horaInicio = moment(value).startOf('day');
            let horaFin = moment(value).endOf('day');
            if (horaInicio.isValid() || horaFin.isValid()) {
                this.parametros['horaInicio'] = horaInicio.isValid() ? this.horaInicio : moment().format();
                this.parametros['horaFin'] = horaFin.isValid() ? this.horaFin : moment().format();
            }
        }
    };
}
