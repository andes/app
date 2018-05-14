import * as moment from 'moment';

import { Observable } from 'rxjs/Rx';
import { Component, AfterViewInit, HostBinding, EventEmitter, Output, Input, SimpleChanges, SimpleChange, OnChanges } from '@angular/core';

import { Plex } from '@andes/plex';

@Component({
    selector: 'turnos-filtros',
    template: `
    <div class="row">
        <div class="col-3">
            <plex-datetime label="Desde" [max]="hoy" type="date" [(ngModel)]="desde" name="desde" (change)="onChange()"></plex-datetime>
        </div> 
        <div class="col-3">
            <plex-datetime label="Hasta" [max]="hoy" type="date" [(ngModel)]="hasta" name="hasta" (change)="onChange()"></plex-datetime>
        </div> 
        <div class="col-2">
            <plex-button type="success" label="Filtrar" (click)="onChange()" ></plex-button>
        </div>
    </div>
    <div class="row">
        <div class="col-2" *ngIf="params.sexo">
            <plex-select [data]="params.sexo" [(ngModel)]="seleccion.sexo" (change)="onChange($event)" placeholder="Seleccione..." label="Sexo">
            </plex-select>
        </div>
        <div class="col-2" *ngIf="params.edad">
            <plex-select [data]="params.edad" [(ngModel)]="seleccion.edad" (change)="onChange($event)" placeholder="Seleccione..." label="Edad">
            </plex-select>
        </div>
        <div class="col-2" *ngIf="params.prestacion">
            <plex-select [data]="params.prestacion" [(ngModel)]="seleccion.prestacion" (change)="onChange($event)" placeholder="Seleccione..." label="Prestacion">
            </plex-select>
        </div>
        <div class="col-2" *ngIf="params.profesional">
            <plex-select [data]="params.profesional" [(ngModel)]="seleccion.profesional" (change)="onChange($event)" placeholder="Seleccione..." label="Profesional">
            </plex-select>
        </div>
        <div class="col-2" *ngIf="params.administrativo">
            <plex-select [data]="params.administrativo" [(ngModel)]="seleccion.administrativo" (change)="onChange($event)" placeholder="Seleccione..." label="Administrativo">
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

    @Input() params = {};
    @Output() filter = new EventEmitter();

    public seleccion = {
        sexo: null,
        edad: null,
        profesional: null,
        prestacion: null,
        administrativo: null
    };

    constructor(private plex: Plex) { }

    ngAfterViewInit() {
        this.onChange();
    }

    onChange () {
        let params = {
            fechaDesde: this.desde,
            fechaHasta: this.hasta,
            sexo: this.seleccion.sexo ? this.seleccion.sexo.nombre : undefined,
            edad: this.seleccion.edad ? this.seleccion.edad.id : undefined,
            prestacion: this.seleccion.prestacion ? this.seleccion.prestacion.id : undefined,
            profesional: this.seleccion.profesional ? this.seleccion.profesional.id : undefined,
            administrativo: this.seleccion.administrativo ? this.seleccion.administrativo.id : undefined
        };
        this.filter.emit(params);
    }

    ngOnChanges (changes: SimpleChanges) {
        const name: SimpleChange = changes.name;
    }
}
