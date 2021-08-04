import { Component, EventEmitter, Output, Input, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';

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
    public permisoEdicion = false;
    // public editar: Boolean = false;

    public filtros: any = {
        fecha: new Date(),
        edificio: undefined,
        nombre: undefined
    };


    constructor(public plex: Plex,
                public espacioFisicoService: EspacioFisicoService,
                public organizacionService: OrganizacionService,
                public servicioAgenda: AgendaService,
                public auth: Auth,
                private router: Router) { }

    ngOnInit() {
        this.permisoEdicion = this.auth.getPermissions('espaciosFisicos:?').length > 0 ? this.auth.getPermissions('espaciosFisicos:?')[0] === '*' : false;

        // if (this.auth.check('turnos:editarEspacio') || this.auth.check('turnos:*')) {
        //     this.editar = true;
        // }
        // buscamos la organizacion para obtener el listado de edificios
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.listadoEdificios = organizacion.edificio;
            // si la organizacion tiene un solo edificio definido lo agregamos como filtro por defecto
            if (this.listadoEdificios && this.listadoEdificios.length === 1) {
                this.filtros.fecha = new Date();
                this.filtros.edificio = this.listadoEdificios[0];
                this.matrizEspaciosFisicos(true);
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

    matrizEspaciosFisicos(valido) {
        if (valido) {
            this.seleccionada = null;
            this.servicioAgenda.get({
                fechaDesde: moment(this.filtros.fecha).isValid() ? moment(this.filtros.fecha).startOf('day').toDate() : new Date(),
                fechaHasta: moment(this.filtros.fecha).isValid() ? moment(this.filtros.fecha).endOf('day').toDate() : new Date(),
                organizacion: this.auth.organizacion.id
            }).subscribe(listadoAgendas => {
                this.listadoAgendas = listadoAgendas;
                this.espacioFisicoService.get({
                    organizacion: this.organizacion.id,
                    edificio: this.filtros.edificio ? this.filtros.edificio.descripcion : null,
                    nombre: this.filtros.nombre,
                    activo: true
                }).subscribe(listaEspaciosFisicos => {
                    this.listadoEspaciosFisicos = listaEspaciosFisicos;
                });
            });
        }

    }

    visualizarDetalleAgenda(agenda) {
        this.seleccionada = 8;
        this.agendaSeleccionada = agenda;
    }

    routeEspaciosFisicos() {
        this.router.navigate(['./tm/espacio_fisico']);
    }
}

