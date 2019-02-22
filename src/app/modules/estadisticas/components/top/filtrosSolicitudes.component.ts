import * as moment from 'moment';
import { Component, AfterViewInit, HostBinding, EventEmitter, Output, Input, SimpleChanges, SimpleChange, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';
import { ProfesionalService } from '../../../../services/profesional.service';

// <div class="col-2">
//     <plex-select label="Tipo de filtro" [data]="opciones" [(ngModel)]="seleccion.tipoDeFiltro" name="tipoDeFiltro"></plex-select>
// </div>

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
            <plex-button type="success mb-1" label="Filtrar" (click)="onChange()" ></plex-button>
        </div>
        <div class="col-2 d-flex align-items-end" (click)="changeTablaGrafico()">
            <plex-button *ngIf="esTablaGrafico" icon="mdi mdi-chart-pie"></plex-button>
            <plex-button *ngIf="!esTablaGrafico" icon="mdi mdi-table-large"></plex-button>
        </div>
    </div>
    <div class="row">
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.prestacionDestino" (getData)="loadPrestaciones($event)" name="prestacionDestino"
                label="Prestación" ngModelOptions="{standalone: true}">
            </plex-select>
        </div>
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.profesional" name="profesional" (getData)="loadProfesionales($event)"
                label="Profesional" placeholder="Escriba el apellido del Profesional" labelField="apellido + ' ' + nombre">
            </plex-select>
        </div>
        <div class="col-3">
            <plex-select [multiple]="true" [data]="estados" [(ngModel)]="seleccion.estados" placeholder="Seleccione..." label="Estado">
            </plex-select>
        </div>
    </div>
    `
})
export class FiltrosSolicitudesComponent implements AfterViewInit, OnChanges {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();
    public opciones = [{ id: 'agendas', nombre: 'Agendas' }, { id: 'turnos', nombre: 'Turnos' }];
    public esTablaGrafico = false;

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
        tipoDeFiltro: { id: 'turnos', nombre: 'Turnos' },
        profesional: undefined,
        prestacionDestino: undefined,
        estados: undefined
    };

    constructor(
        private plex: Plex,
        public servicioProfesional: ProfesionalService,
        public servicioPrestacion: TipoPrestacionService) {
    }

    ngAfterViewInit() {
        this.onChange();
    }

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

    loadPrestaciones(event) {
        this.servicioPrestacion.get({}).subscribe(result => {
            event.callback(result);
        });
    }

    onChange() {
        let filtrosParams = {
            solicitudDesde: this.desde,
            solicitudHasta: this.hasta,
            prestacionDestino: this.seleccion.prestacionDestino ? this.seleccion.prestacionDestino.map(pr => {
                return {id: pr.conceptId, nombre: pr.term };
            }) : undefined,
            estados: this.seleccion.estados ? this.seleccion.estados.map(tipoEstado => { return tipoEstado.id; }) : undefined,
            // profesional: this.seleccion.profesional ? this.seleccion.profesional.map(prof => {
            //     return {id: prof.id, nombre: prof.nombre + ' ' + prof.apellido };
            // }) : undefined,
            // tipoDeFiltro: this.seleccion.tipoDeFiltro ? this.seleccion.tipoDeFiltro.id : undefined,
            };
        this.filter.emit(filtrosParams);
    }

    ngOnChanges(changes: SimpleChanges) {
        const name: SimpleChange = changes.name;
    }
}
