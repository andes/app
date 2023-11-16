import * as moment from 'moment';
import { Component, HostBinding, EventEmitter, Output, SimpleChanges, SimpleChange, OnChanges, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { ProfesionalService } from '../../../../services/profesional.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'solicitudes-filtros',
    templateUrl: 'filtrosSolicitudes.component.html',
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
        { id: 'anulada', nombre: 'ANULADA' },
        { id: 'validada', nombre: 'REGISTRO EN HUDS' },
        { id: 'vencida', nombre: 'VENCIDA' }
    ];

    @Output() filter = new EventEmitter();
    @Output() onDisplayChange = new EventEmitter();
    @Input() activeTab: any;

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
            solicitudDesde: this.desde,
            solicitudHasta: this.hasta,
            estados: this.seleccion.estados ? this.seleccion.estados.map(tipoEstado => {
                return tipoEstado.id;
            }) : undefined,
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
