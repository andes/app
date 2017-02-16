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
    public inicio: any;
    public fin: any;
    public horarios: any[] = [];
    public consultorios: any[] = [];
    public listaAgenda: any[] = [];
    public listaConsultorios: any[] = ['consultorio 1 ', 'consultorio 2'];
    // @Input('agenda')
    // set agenda(value: any) {
    //     this._agenda = value;
    // }
    // get agenda(): any {
    //     return this._agenda;
    // }
    private espacios: IEspacioFisico[];
    public agenda = {
        inicio: moment(new Date(this.fechaActual.setHours(9, 0, 0, 0))),
        fin: moment(new Date(this.fechaActual.setHours(12, 0, 0, 0))),
        medico: 'Murakami',
        consultorio: 'consultorio 2'
    };
    public filas = 2;
    constructor(private serviceAgenda: AgendaService, private serviceEspacio: EspacioFisicoService, public plex: Plex) { }

    ngOnInit() {
        this.loadEspacios();
        this.inicio = new Date(this.fechaActual.setHours(8, 0, 0, 0));
        let inicioM = moment(this.inicio);
        this.fin = new Date(this.fechaActual.setHours(13, 0, 0, 0));
        let diferencia = (this.fin.getTime() - this.inicio.getTime()) / 60000;
        let cantidadBloques = diferencia / this.unidad;

        // for (let j = 0; j < cantidadBloques; j++) {
        //     let lista = [];
        //     for (let i = 0; i < this.listaConsultorios.length; i++) {
        //         if (inicioM.isBetween(this.agenda.inicio, this.agenda.fin, null, '[)') &&
        //             this.agenda.consultorio === this.listaConsultorios[i]) {
        //             lista.push(this.agenda.medico);
        //         } else {
        //             lista.push('');
        //         }
        //     }
        //     let elemento = {
        //         hora: inicioM.format('hh:mm'),
        //         lista: lista
        //     }
        //     this.horarios.push(elemento);
        //     inicioM.add(this.unidad, 'm');
        // }
        for (let j = 0; j < this.listaConsultorios.length; j++) {
            let lista = [];
            for (let i = 0; i < cantidadBloques; i++) {
                if (inicioM.isBetween(this.agenda.inicio, this.agenda.fin, null, '[)') &&
                    this.agenda.consultorio === this.listaConsultorios[j]) {
                    lista.push(this.agenda.medico);
                } else {
                    lista.push('');
                }
            }
            let elemento = {
                hora: inicioM.format('hh:mm'),
                lista: lista
            }
            // this.horarios.push(elemento);
            this.consultorios.push(elemento);
            inicioM.add(this.unidad, 'm');
        }
        console.log('lista', this.consultorios);
    };

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

}
