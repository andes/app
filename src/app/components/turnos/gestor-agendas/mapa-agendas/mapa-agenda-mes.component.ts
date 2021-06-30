import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { MapaAgendasService } from 'src/app/services/turnos/mapa-agendas.service';


@Component({
    selector: 'mapa-agenda-mes',
    templateUrl: 'mapa-agenda-mes.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasMesComponent implements OnInit {

    public headers = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    public _fecha;
    public dia;
    public calendario;
    public accion = null;
    @Output() semanaDetalle = new EventEmitter<any>();
    @Output() agendasDetalles = new EventEmitter<any>();
    @Input('fecha')
    set fecha(value: any) {
        this._fecha = value;
        this.cargarAgendas();
    }

    constructor(
        private mapaAgendasService: MapaAgendasService

    ) { }

    ngOnInit() {


    }

    private cargarAgendas() {

        this.mapaAgendasService.cargarAgendasMes(this._fecha);
        this.mapaAgendasService.calendario$.subscribe(date => this.calendario = date);
    }

    detalleDia(dia) {
        if (dia.agendas.length > 0) {
            let agendasDia = [];
            dia.agendas.forEach(tipoPrestacion =>
                tipoPrestacion.agendasPorPrestacion.forEach(agenda => {
                    agendasDia.push(agenda);
                })
            );
            this.dia = {
                fecha: dia.fecha,
                agendas: agendasDia
            };
            this.agendasDetalles.emit(this.dia);
        }
    }

    close() {
        this.accion = null;
    }
    week(semanas, indice) {
        let calendario = { semanas: semanas, indice: indice };
        this.semanaDetalle.emit(calendario);
    }

}
