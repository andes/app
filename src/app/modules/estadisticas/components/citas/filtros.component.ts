import * as moment from 'moment';
import { Component, AfterViewInit, HostBinding, EventEmitter, Output, Input, SimpleChanges, SimpleChange, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'turnos-filtros',
    template: `
    <div class="row">
        <div class="col-3">
            <plex-select label="Tipo de filtro" [data]="opciones" [(ngModel)]="seleccion.tipoDeFiltro" name="tipoDeFiltro" (change)="onChange()"></plex-select>
        </div>
        <div class="col-3">
            <plex-datetime label="Desde" [max]="hoy" type="date" [(ngModel)]="desde" name="desde" (change)="onChange()"></plex-datetime>
        </div>
        <div class="col-3">
            <plex-datetime label="Hasta" [max]="hoy" type="date" [(ngModel)]="hasta" name="hasta" (change)="onChange()"></plex-datetime>
        </div>
        <div class="col-3">
            <plex-button type="success" label="Filtrar" (click)="onChange()" class="vertical-center" ></plex-button>
        </div>
    </div>
    <div class="row">
        <div class="col-3" *ngIf="params.prestacion">
            <plex-select [multiple]="true" [data]="params.prestacion" [(ngModel)]="seleccion.prestacion" (change)="onChange($event)" placeholder="Seleccione..." label="Prestacion">
            </plex-select>
        </div>
        <div class="col-3" *ngIf="params.profesional">
            <plex-select [multiple]="true" [data]="params.profesional" [(ngModel)]="seleccion.profesional" (change)="onChange($event)" placeholder="Seleccione..." label="Profesional">
            </plex-select>
        </div>
        <div class="col-3" *ngIf="params.estado_turno">
            <plex-select [multiple]="true" [data]="params.estado_turno" [(ngModel)]="seleccion.estado_turno" (change)="onChange($event)" placeholder="Seleccione..." label="Estado">
            </plex-select>
        </div>
    </div>
    `
})
export class FiltrosComponent implements AfterViewInit, OnChanges {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();
    public opciones = [{ id: 'agendas', nombre: 'Agendas' }, { id: 'turnos', nombre: 'Turnos' }];

    @Input() params: any = {};
    @Output() filter = new EventEmitter();

    public seleccion: any = {
        tipoDeFiltro: { id: 'turnos', nombre: 'Turnos' },
        profesional: null,
        prestacion: null,
        estado_turno: []
    };

    constructor(private plex: Plex) { }

    ngAfterViewInit() {
        this.onChange();
    }

    onChange() {

        let params = {
            fechaDesde: this.desde,
            fechaHasta: this.hasta,
            tipoDeFiltro: this.seleccion.tipoDeFiltro ? this.seleccion.tipoDeFiltro.id : undefined,
            prestacion: this.seleccion.prestacion ? this.seleccion.prestacion.map(pr => pr.id) : undefined,
            profesional: this.seleccion.profesional ? this.seleccion.profesional.map(prof => prof.id) : undefined,
            estado_turno: this.seleccion.estado_turno.length ? this.seleccion.estado_turno.map(et => et.id) : undefined
        };
        this.filter.emit(params);
    }

    ngOnChanges(changes: SimpleChanges) {
        const name: SimpleChange = changes.name;
    }
}
