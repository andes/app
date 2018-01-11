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
    public diagnosticos = [];
    public totalConsultas = 0;
    public totalMenor1 = 0;
    public total1 = 0;
    public total24 = 0;
    public total59 = 0;
    public total1014 = 0;
    public total1524 = 0;
    public total2534 = 0;
    public total3544 = 0;
    public total4564 = 0;
    public totalMayor65 = 0;
    public totalMasculino = 0;
    public totalFemenino = 0;
    public totalOtro = 0;

    // Eventos
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex, private router: Router, private server: Server, private agendaService: AgendaService, private auth: Auth) {

    }

    public ngOnInit() {
        this.parametros = {
            horaInicio: '',
            horaFin: ''
        };
        // this.diagnosticos = [];
    }

    public imprimir() {
        this.agendaService.findDiagnosticos(this.parametros).subscribe((diagnosticos) => {
            this.diagnosticos = diagnosticos;
            this.totalConsultas = this.diagnosticos.map(elem => { return elem.total; }).reduce(this.add, 0);
            this.totalMenor1 = this.diagnosticos.map(elem => { return elem.sumaMenor1; }).reduce(this.add, 0);
            this.total1 = this.diagnosticos.map(elem => { return elem.suma1; }).reduce(this.add, 0);
            this.total24 = this.diagnosticos.map(elem => { return elem.suma24; }).reduce(this.add, 0);
            this.total59 = this.diagnosticos.map(elem => { return elem.suma59; }).reduce(this.add, 0);
            this.total1014 = this.diagnosticos.map(elem => { return elem.suma1014; }).reduce(this.add, 0);
            this.total1524 = this.diagnosticos.map(elem => { return elem.suma1524; }).reduce(this.add, 0);
            this.total2534 = this.diagnosticos.map(elem => { return elem.suma2534; }).reduce(this.add, 0);
            this.total3544 = this.diagnosticos.map(elem => { return elem.suma3544; }).reduce(this.add, 0);
            this.total4564 = this.diagnosticos.map(elem => { return elem.suma4564; }).reduce(this.add, 0);
            this.totalMayor65 = this.diagnosticos.map(elem => { return elem.sumaMayor65; }).reduce(this.add, 0);
            this.totalMasculino = this.diagnosticos.map(elem => { return elem.sumaMasculino; }).reduce(this.add, 0);
            this.totalFemenino = this.diagnosticos.map(elem => { return elem.sumaFemenino; }).reduce(this.add, 0);
            this.totalOtro = this.diagnosticos.map(elem => { return elem.sumaOtro; }).reduce(this.add, 0);
        });
    }

    add(a, b) {
        return a + b;
    }

    refreshSelection(value, tipo) {
        if (tipo === 'horaInicio') {
            let horaInicio = moment(this.horaInicio).startOf('day');
            if (horaInicio.isValid()) {
                this.parametros['horaInicio'] = horaInicio.isValid() ? horaInicio.toDate() : moment().format();
            }
        }
        if (tipo === 'horaFin') {
            let horaFin = moment(this.horaFin).endOf('day');
            if (horaFin.isValid()) {
                this.parametros['horaFin'] = horaFin.isValid() ? horaFin.toDate() : moment().format();
            }
        }
    };
}
