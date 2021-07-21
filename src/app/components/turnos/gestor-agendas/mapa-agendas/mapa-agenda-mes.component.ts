import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MapaAgendasService } from './mapa-agendas.service';


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
        if (dia.prestaciones?.length > 0) {
            this.agendasDetalles.emit(dia);
        }

    }

    close() {
        this.accion = null;
    }
    week(semana) {

        this.semanaDetalle.emit(semana);
    }

}
