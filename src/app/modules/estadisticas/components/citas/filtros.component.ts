import * as moment from 'moment';
import { Component, HostBinding, EventEmitter, Output, SimpleChanges, SimpleChange, OnChanges, OnInit } from '@angular/core';
import { ProfesionalService } from '../../../../services/profesional.service';
import { Auth } from '@andes/auth';
import * as loadCombos from '../../utils/comboLabelFiltro.component';

@Component({
    selector: 'turnos-filtros',
    template: `
    <plex-wrapper>
        <plex-select label="Tipo de filtro" [data]="opciones" [(ngModel)]="seleccion.tipoDeFiltro" name="tipoDeFiltro" [required]="true"></plex-select>
        <plex-datetime label="Desde" [max]="hasta" type="date" [(ngModel)]="desde" name="desde"></plex-datetime>
        <plex-datetime label="Hasta" [min]="desde" type="date" [(ngModel)]="hasta" name="hasta"></plex-datetime>
        <plex-button type="success" label="Buscar" (click)="onChange()" [disabled]="(seleccion.tipoDeFiltro && desde && hasta) ? false : true"></plex-button>
        <plex-button [title]="esTablaGrafico ? 'Mostrar gráficos' : 'Mostrar tablas'" [icon]="esTablaGrafico ? 'chart-pie' : 'table-large'"
                (click)="changeTablaGrafico()"></plex-button>
        <div collapse>
            <plex-select [multiple]="true"
                         [(ngModel)]="seleccion.prestacion"
                         tmPrestaciones="visualizacionInformacion:dashboard:citas:tipoPrestacion:?" preload="true" name="prestaciones"
                            label="Prestación" >
            </plex-select>
            <plex-select *ngIf="verProfesionales" [multiple]="true" [(ngModel)]="seleccion.profesional" name="profesional" (getData)="loadProfesionales($event)"
                label="Profesional" placeholder="Escriba el apellido del Profesional" labelField="apellido + ' ' + nombre">
            </plex-select>
            <plex-select *ngIf="seleccion.tipoDeFiltro && seleccion.tipoDeFiltro.id === 'turnos'" [multiple]="true" [data]="estadoTurnos" [(ngModel)]="seleccion.estado_turno" placeholder="Seleccione..." label="Estado">
            </plex-select>
            <plex-select *ngIf="seleccion.tipoDeFiltro && seleccion.tipoDeFiltro.id === 'turnos'" [multiple]="true" [data]="tipoTurno" [(ngModel)]="seleccion.tipoTurno" placeholder="Seleccione..." label="Tipo de turno">
            </plex-select>
            <plex-select *ngIf="seleccion.tipoDeFiltro && seleccion.tipoDeFiltro.id === 'agendas'" [multiple]="true" [data]="estadosAgendas" [(ngModel)]="seleccion.estado_agenda" placeholder="Seleccione..." label="Estado">
            </plex-select>
        </div>
    </plex-wrapper>
    `
})
export class FiltrosComponent implements OnInit, OnChanges {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();
    public opciones = [{ id: 'agendas', nombre: 'Agendas' }, { id: 'turnos', nombre: 'Turnos' }];
    public esTablaGrafico = false;
    public tipoTurno = [];
    public estadoTurnos = [];
    public estadosAgendas = [];

    // Permisos
    public verProfesionales;
    @Output() filter = new EventEmitter();
    @Output() onDisplayChange = new EventEmitter();

    public seleccion: any = {
        tipoDeFiltro: { id: 'turnos', nombre: 'Turnos' },
        profesional: undefined,
        prestacion: undefined,
        estado_turno: undefined,
        estado_agenda: undefined,
        tipoTurno: undefined
    };

    constructor(
        private auth: Auth,
        private servicioProfesional: ProfesionalService
    ) { }

    ngOnInit() {
        this.verProfesionales = this.auth.check('visualizacionInformacion:dashboard:citas:verProfesionales');
        if (!this.verProfesionales) {
            this.servicioProfesional.get({ id: this.auth.profesional }).subscribe(resultado => {
                this.seleccion.profesional = resultado;
            });
        }
        this.tipoTurno = loadCombos.getTipoTurnos();
        this.estadoTurnos = loadCombos.getEstadosTurnos();
        this.estadosAgendas = loadCombos.getEstadosAgendas();
    }

    changeTablaGrafico() {
        this.esTablaGrafico = !this.esTablaGrafico;
        this.onDisplayChange.emit(this.esTablaGrafico);
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            const query = {
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
        const filtrosParams = {
            fechaDesde: this.desde,
            fechaHasta: this.hasta,
            tipoDeFiltro: this.seleccion.tipoDeFiltro ? this.seleccion.tipoDeFiltro.id : undefined,
            prestacion: this.seleccion.prestacion ? this.seleccion.prestacion.map(pr => {
                return { id: pr.conceptId, nombre: pr.term };
            }) : undefined,
            profesional: this.seleccion.profesional ? this.seleccion.profesional.map(prof => {
                return { id: prof.id, nombre: prof.nombre + ' ' + prof.apellido };
            }) : undefined,
            estado_turno: this.seleccion.estado_turno && this.seleccion.tipoDeFiltro.id === 'turnos' ? this.seleccion.estado_turno.map(et => et.id) : undefined,
            tipoTurno: this.seleccion.tipoTurno && this.seleccion.tipoDeFiltro.id === 'turnos' ? this.seleccion.tipoTurno.map(tt => tt.id) : undefined,
            estado_agenda: this.seleccion.estado_agenda && this.seleccion.tipoDeFiltro.id === 'agendas' ? this.seleccion.estado_agenda.map(et => et.id) : undefined
        };
        this.filter.emit(filtrosParams);
    }

    ngOnChanges(changes: SimpleChanges) {
        const name: SimpleChange = changes.name;
    }
}
