import * as moment from 'moment';
import { Component, AfterViewInit, HostBinding, EventEmitter, Output, Input, SimpleChanges, SimpleChange, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';
import { ProfesionalService } from '../../../../services/profesional.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'solicitudes-filtros',
    template: `
    <div class="row">
        <div class="col-2">
            <plex-datetime label="Desde" [max]="hoy" type="date" [(ngModel)]="desde" name="desde"></plex-datetime>
        </div>
        <div class="col-2">
            <plex-datetime label="Hasta" [max]="hoy" type="date" [(ngModel)]="hasta" name="hasta"></plex-datetime>
        </div>
        <div class="col-4 d-flex align-items-end">
            <plex-button type="success mb-1" label="Buscar" (click)="onChange()" ></plex-button>
        </div>
        <div class="col-2 d-flex align-items-end" (click)="changeTablaGrafico()">
            <plex-button title="Visualizar de gráficos" *ngIf="esTablaGrafico" icon="mdi mdi-chart-pie"></plex-button>
            <plex-button title="Visualizar tablas" *ngIf="!esTablaGrafico" icon="mdi mdi-table-large"></plex-button>
        </div>
    </div>
    <div class="row">
        <div class="col-4">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.organizaciones" name="organizaciones" (getData)="loadOrganizacion($event)"
                label="Organización" placeholder="Seleccione la organización" labelField="nombre">
            </plex-select>
        </div>
        <div class="col-4">
            <plex-select [multiple]="true" [data]="estados" [(ngModel)]="seleccion.estados" placeholder="Seleccione..." label="Estado">
            </plex-select>
        </div>
    </div>
    <div class="row">
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.solicitudesOrigen" (getData)="loadPrestaciones($event)" name="prestacionOrigen"
                label="Prestación Origen" ngModelOptions="{standalone: true}">
            </plex-select>
        </div>
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.solicitudesDestino" (getData)="loadPrestaciones($event)" name="prestacionDestino"
                label="Prestación Destino" ngModelOptions="{standalone: true}">
            </plex-select>
        </div>
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.profesionalesOrigen" name="profesionalOrigen" (getData)="loadProfesionales($event)"
                label="Profesional Origen" placeholder="Escriba el apellido del Profesional" labelField="apellido + ' ' + nombre">
            </plex-select>
        </div>
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.profesionalesDestino" name="profesionalDestino" (getData)="loadProfesionales($event)"
                label="Profesional Destino" placeholder="Escriba el apellido del Profesional" labelField="apellido + ' ' + nombre">
            </plex-select>
        </div>
    </div>
    `
})
export class FiltrosSolicitudesComponent implements OnChanges {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public esTablaGrafico = false;
    public hasta: Date = new Date();
    public hoy = new Date();

    public estados = [
        { id: 'auditoria', nombre: 'AUDITORIA' },
        { id: 'pendiente', nombre: 'PENDIENTE' },
        { id: 'rechazada', nombre: 'RECHAZADA' },
        { id: 'turnoDado', nombre: 'TURNO DADO' },
        { id: 'anulada', nombre: 'ANULADA' }
    ];

    @Output() filter = new EventEmitter();
    @Output() onDisplayChange = new EventEmitter();

    public seleccion: any = {
        organizaciones: undefined,
        profesionalesOrigen: undefined,
        profesionalesDestino: undefined,
        solicitudesOrigen: undefined,
        solicitudesDestino: undefined,
        estados: undefined
    };

    constructor(
        private plex: Plex,
        public auth: Auth,
        public servicioProfesional: ProfesionalService,
        public servicioPrestacion: TipoPrestacionService,
        public servicioOrganizacion: OrganizacionService
    ) {}

    changeTablaGrafico() {
        this.esTablaGrafico = !this.esTablaGrafico;
        this.onDisplayChange.emit(this.esTablaGrafico);
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                listaProfesionales = resultado;
                event.callback(listaProfesionales);
            });
        } else {
            event.callback([]);
        }
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get({}).subscribe(result => {
            event.callback(result);
        });
    }

    onChange() {
        let filtrosParams = {
            solicitudDesde: this.desde,
            solicitudHasta: this.hasta,
            estados: this.seleccion.estados ? this.seleccion.estados.map(tipoEstado => { return tipoEstado.id; }) : undefined,
            organizaciones: this.seleccion.organizaciones ? this.seleccion.organizaciones.map(org => {
                return { id: org.id };
            }) : undefined,
            solicitudesOrigen: this.seleccion.solicitudesOrigen ? this.seleccion.solicitudesOrigen.map(pr => {
                return { id: pr.conceptId, nombre: pr.term };
            }) : undefined,
            solicitudesDestino: this.seleccion.solicitudesDestino ? this.seleccion.solicitudesDestino.map(pr => {
                return { id: pr.conceptId, nombre: pr.term };
            }) : undefined,
            profesionalesOrigen: this.seleccion.profesionalesOrigen ? this.seleccion.profesionalesOrigen.map(prof => {
                return { id: prof.id, nombre: prof.nombre + ' ' + prof.apellido };
            }) : undefined,
            profesionalesDestino: this.seleccion.profesionalesDestino ? this.seleccion.profesionalesDestino.map(prof => {
                return { id: prof.id, nombre: prof.nombre + ' ' + prof.apellido };
            }) : undefined,
        };
        this.filter.emit(filtrosParams);
    }

    ngOnChanges(changes: SimpleChanges) {
        const name: SimpleChange = changes.name;
    }
}
