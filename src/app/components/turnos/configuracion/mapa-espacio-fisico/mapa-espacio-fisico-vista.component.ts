import { Component, EventEmitter, Output, Input, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { IEdificio } from './../../../../interfaces/IEdificio';
import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';

import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { OrganizacionService } from './../../../../services/organizacion.service';
import { IOrganizacion } from '../../../../interfaces/IOrganizacion';
import { AgendaService } from '../../../../services/turnos/agenda.service';

@Component({
    selector: 'mapa-espacio-fisico-vista',
    templateUrl: 'mapa-espacio-fisico-vista.html',
    styleUrls: [
        'mapa-espacio-fisico.scss'
    ]
})
export class MapaEspacioFisicoVistaComponent implements OnInit {

    public organizacion: IOrganizacion;
    public listadoEdificios: IEdificio[] = [];
    public headers = [];
    public columnas = [];
    public listadoEspaciosFisicos: IEspacioFisico[] = [];
    public listadoAgendas: IAgenda[] = [];
    public matrix = [];
    public seleccionada;
    public agendaSeleccionada: IAgenda;

    public filtros: any = {
        fecha: new Date(),
        edificio: undefined,
        nombre: undefined
    };


    constructor(public plex: Plex,
        public espacioFisicoService: EspacioFisicoService,
        public organizacionService: OrganizacionService,
        public servicioAgenda: AgendaService,
        public auth: Auth) { }

    ngOnInit() {
        // buscamos la organizacion para obtener el listado de edificios
        this.organizacionService.getById(this.auth.organizacion._id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.listadoEdificios = organizacion.edificio;
            // si la organizacion tiene un solo edificio definido lo agregamos como filtro por defecto
            if (this.listadoEdificios && this.listadoEdificios.length === 1) {
                this.filtros.edificio = this.listadoEdificios[0];
            }
        });
    }

    generarHeader() {
        const inicio = moment(this.filtros.fecha.setHours(8, 0, 0, 0));
        const final = moment(this.filtros.fecha.setHours(21, 0, 0, 0));
        let temp = moment(this.filtros.fecha.setHours(8, 0, 0, 0));
        while (temp < final) {
            this.headers.push({ date: temp, hora: temp.format('HH:mm') });
            temp = temp.add(1, 'hours');
        }

        let tempMinutos = inicio.clone();
        while (tempMinutos < final) {
            this.columnas.push({ date: tempMinutos.clone() });
            tempMinutos = tempMinutos.add(15, 'minutes');
        }
    }

    matrizEspaciosFisicos(form) {
        if (form.formValid) {
            this.seleccionada = null;
            this.servicioAgenda.get({
                fechaDesde: moment(this.filtros.fecha).isValid() ? moment(this.filtros.fecha).startOf('day').toDate() : new Date(),
                fechaHasta: moment(this.filtros.fecha).isValid() ? moment(this.filtros.fecha).endOf('day').toDate() : new Date(),
                organizacion: this.auth.organizacion.id
            }).subscribe(listadoAgendas => {
                this.listadoAgendas = listadoAgendas;
                this.espacioFisicoService.get({
                    organizacion: this.organizacion.id,
                    edificio: this.filtros.edificio,
                    nombre: this.filtros.nombre,
                    activo: true
                }).subscribe(listaEspaciosFisicos => {
                    this.listadoEspaciosFisicos = listaEspaciosFisicos;
                    // this.completarMatriz();
                });
            });
        }

    }

    visualizarDetalleAgenda(agenda) {
        this.seleccionada = 8;
        this.agendaSeleccionada = agenda;
    }



    completarMatriz() {
        this.seleccionada = 12;
        this.agendaSeleccionada = null;
        let matrix = [];
        if (this.listadoEspaciosFisicos) {
            this.listadoEspaciosFisicos.forEach(espacio => {
                matrix.push({
                    id: espacio.id,
                    _value: espacio,
                    _items: [],
                    columnas: []
                });
            });
        }
        // ...this.columnas
        this.listadoAgendas.forEach(agenda => {
            let start_time = moment(agenda.horaInicio);
            let end_time = moment(agenda.horaFin);
            let diferencia = end_time.diff(start_time, 'minutes');
            let colspan = Math.trunc(diferencia / 15);

            if (agenda.espacioFisico) {
                let _id = agenda.espacioFisico.id;
                let temp = matrix.find(item => item.id === _id);
                if (temp) {
                    let columnasXEF = [];
                    if (temp.columnas) {
                        columnasXEF = [...temp.columnas];
                    }
                    let datoAgenda = Object.assign({}, {
                        id: agenda.id,
                        espacioID: _id,
                        horaInicio: agenda.horaInicio,
                        horaFin: agenda.horaFin,
                        prestaciones: agenda.tipoPrestaciones,
                        profesionales: agenda.profesionales || null,
                        _value: agenda.id,
                        colspan: colspan
                    });
                    let inicio = 0;
                    for (let i = 0; i < this.columnas.length; i++) {
                        if (this.columnas[i].date >= start_time && this.columnas[i].date < end_time) {
                            if (inicio <= 0) {
                                columnasXEF[i] = datoAgenda;
                            }
                            inicio += 1;
                        } else {
                            columnasXEF[i] = null;
                        }
                    }
                    temp.columnas = [...columnasXEF];
                }
            }
        });

        this.matrix = [...matrix];
    }

}

