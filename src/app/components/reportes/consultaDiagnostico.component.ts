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
    selector: 'consultaDiagnostico',
    templateUrl: 'consultaDiagnostico.html',
   
})

export class ConsultaDiagnosticoComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    private timeoutHandle: number;

    // Propiedades públicas
    public parametros;
    public horaInicio: any;
    public horaFin: any;
    public diagnosticos = [];
    public diagnostico;
    public seleccionada = [];
    public listaPacientes = false;

  
    // Eventos
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex, private router: Router, private server: Server,private agendaService: AgendaService, private auth: Auth) {

    }

    public ngOnInit() {
        this.parametros = {
            horaInicio: '',
            horaFin: ''
            //organizacion:''
        };
    }

    public imprimir() {
        if (this.parametros['horaInicio'] && this.parametros['horaFin']) {
            this.agendaService.findDiagnosticos(this.parametros).subscribe((diagnosticos) => {
                this.diagnosticos = diagnosticos;
               });
        }
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
       
       
    }
    datosPacientes(indice) {
        this.diagnostico = this.diagnosticos[indice];
        for (let i = 0; i < this.seleccionada.length; i++) {
            this.seleccionada[i] = false;
        }
        if (this.diagnostico.ficha !== null) {
            this.seleccionada[indice] = true;
            this.listaPacientes = true;
        } else {
            this.listaPacientes = false;
        }
    }

  
}
