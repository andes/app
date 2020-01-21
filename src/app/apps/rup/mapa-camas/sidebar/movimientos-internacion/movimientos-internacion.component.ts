import { Component, OnInit, Input } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../mapa-camas.service';

@Component({
    selector: 'app-movimientos-internacion',
    templateUrl: './movimientos-internacion.component.html',
})

export class MovimientosInternacionComponent implements OnInit {
    // EVENTOS
    @Input() cama;

    // VARIABLES
    public ambito: string;
    public capa: string;
    public movimientos;
    public desde = moment().toDate();
    public hasta = moment().toDate();

    constructor(
        public auth: Auth,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.ambito = this.mapaCamasService.ambito;
        this.capa = this.mapaCamasService.capa;

        this.getMovimientos();
    }

    getMovimientos() {
        this.mapaCamasService.historial(this.ambito, this.capa, this.desde, this.hasta, { idInternacion: this.cama.idInternacion }).subscribe(movimientos => {
            this.movimientos = movimientos;
            this.movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        });
    }
}
