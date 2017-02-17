import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { Plex } from 'andes-plex/src/lib/core/service';
import { Component, OnInit, Input } from '@angular/core';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import * as moment from 'moment';
moment.locale('en');

@Component({
    selector: 'app-panel-espacio',
    templateUrl: 'panel-espacio.html'
})

export class PanelEspacioComponent implements OnInit {
    // private _agenda: any;
    public unidad = 60; // unidad horaria minima (en minutos)
    public fechaActual = new Date();
    public fecha: Date;
    public inicio: any;
    public fin: any;
    public horarios: any[] = [];
    public consultorios: any[] = [];
    public listaAgenda: any[] = [];
    public listaConsultorios: any[] = ['consultorio 1 ', 'consultorio 2', 'consultorio 3', 'consultorio 4', 'consultorio 5'];
    public agendas: any[];
    private espacios: IEspacioFisico[];
    public agenda: any;
    // public agenda = {
    //     inicio: moment(new Date(this.fechaActual.setHours(9, 0, 0, 0))),
    //     fin: moment(new Date(this.fechaActual.setHours(12, 0, 0, 0))),
    //     medico: 'Murakami',
    //     consultorio: 'consultorio 2',
    //     rows: 0,
    //     saltear: false
    // };

    constructor(private serviceAgenda: AgendaService, private serviceEspacio: EspacioFisicoService, public plex: Plex) { }

    ngOnInit() {
        this.loadEspacios();
        // if (this.agenda.rows === 0) {
        //     this.agenda.rows = this.agenda.fin.diff(this.agenda.inicio, 'm') / this.unidad;
        // }

        // this.inicio = new Date(this.fechaActual.setHours(8, 0, 0, 0));
        // let inicioM = moment(this.inicio);
        // this.fin = new Date(this.fechaActual.setHours(13, 0, 0, 0));
        // let diferencia = (this.fin.getTime() - this.inicio.getTime()) / 60000;
        // let cantidadBloques = diferencia / this.unidad;

        // for (let j = 0; j < cantidadBloques; j++) {
        //     let lista = [];
        //     for (let i = 0; i < this.listaConsultorios.length; i++) {
        //         if (inicioM.isBetween(this.agenda.inicio, this.agenda.fin, null, '[)') &&
        //             this.agenda.consultorio === this.listaConsultorios[i]) {
        //             if (this.agenda.rows > 1 && this.agenda.saltear === false) {
        //                 lista.push(this.agenda);
        //                 this.agenda.saltear = true;
        //             }
        //         } else {
        //             lista.push('');
        //         }
        //     }
        //     let elemento = {
        //         hora: inicioM.format('hh:mm'),
        //         lista: lista
        //     };
        //     this.horarios.push(elemento);
        //     inicioM.add(this.unidad, 'm');
        // }
        // console.log('lista', this.horarios);
    }

    loadEspacios() {
        this.serviceEspacio.get({}).subscribe(espacios => { this.espacios = espacios; console.log('espacios ', this.espacios); });
    }

    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            let horas: number;
            let minutes: number;
            let auxiliar: Date;

            auxiliar = new Date(fecha1);
            horas = fecha2.getHours();
            minutes = fecha2.getMinutes();
            // Date.setHours(hour, min, sec, millisec)
            auxiliar.setHours(horas, minutes, 0, 0);
            return auxiliar;
        } else {
            return null;
        }
    }

    buscarAgendas() {
        console.log(this.fecha);
        let params = {
            fechaDesde: this.fecha.setHours(0, 0, 0, 0),
            fechaHasta: this.fecha.setHours(23, 59, 0, 0),
        };
        this.serviceAgenda.get(params).subscribe(
            agendas => { this.agendas = agendas; this.llenarConsultorios(); },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    llenarConsultorios() {
        console.log('Agendas ', this.agendas);
        // this.agenda = this.agendas[0];
        // if (!this.agenda.rows) {
        //     this.agenda.rows = moment(this.agenda.horaFin).diff(this.agenda.horaInicio, 'm') / this.unidad;
        // }
        // this.agenda.saltear = false;
        this.inicio = new Date(this.fecha.setHours(8, 0, 0, 0));
        let inicioM = moment(this.inicio);
        this.fin = new Date(this.fecha.setHours(20, 0, 0, 0));
        let diferencia = (this.fin.getTime() - this.inicio.getTime()) / 60000;
        let cantidadBloques = diferencia / this.unidad;


        for (let j = 0; j < cantidadBloques; j++) {
            this.agendas.forEach((agenda, index) => {
                this.agenda = agenda;
                if (!this.agenda.rows) {
                    this.agenda.rows = moment(this.agenda.horaFin).diff(this.agenda.horaInicio, 'm') / this.unidad;
                }
                this.agenda.saltear = false;
                let lista = [];
                for (let i = 0; i < this.espacios.length; i++) {
                    if (inicioM.isBetween(this.agenda.horaInicio, this.agenda.horaFin, null, '[)') &&
                        this.agenda.espacioFisico._id === this.espacios[i].id) {
                        if (this.agenda.rows > 1 && this.agenda.saltear === false) {
                            lista.push(this.agenda);
                            this.agenda.saltear = true;
                        }
                    } else {
                        lista.push('');
                    }
                }
                let elemento = {
                    hora: inicioM.format('HH:mm'),
                    lista: lista
                };
                this.horarios.push(elemento);
                inicioM.add(this.unidad, 'm');
            });

        }

        console.log('lista', this.horarios);
    }

}
