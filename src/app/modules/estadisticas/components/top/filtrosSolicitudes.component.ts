import * as moment from 'moment';
import { Component, HostBinding, EventEmitter, Output, SimpleChanges, SimpleChange, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { ProfesionalService } from '../../../../services/profesional.service';
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
            <plex-button title="Visualizar de gráficos" *ngIf="esTablaGrafico" icon="chart-pie"></plex-button>
            <plex-button title="Visualizar tablas" *ngIf="!esTablaGrafico" icon="table-large"></plex-button>
        </div>
    </div>
    <div class="row">
        <div class="col-4">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.organizaciones" name="organizaciones" tmOrganizaciones
                label="Organización" placeholder="Seleccione la organización">
            </plex-select>
        </div>
        <div class="col-4">
            <plex-select [multiple]="true" [data]="estados" [(ngModel)]="seleccion.estados" placeholder="Seleccione..." label="Estado">
            </plex-select>
        </div>
    </div>
    <div class="row">
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.solicitudesOrigen" tmPrestaciones preload="true" name="prestacionOrigen"
                label="Prestación Origen" ngModelOptions="{standalone: true}">
            </plex-select>
        </div>
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.solicitudesDestino" tmPrestaciones preload="true" name="prestacionDestino"
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
        { id: 'rechazada', nombre: 'CONTRARREFERIDA' },
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
        public servicioProfesional: ProfesionalService
    ) { }

    changeTablaGrafico() {
        this.esTablaGrafico = !this.esTablaGrafico;
        this.onDisplayChange.emit(this.esTablaGrafico);
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
