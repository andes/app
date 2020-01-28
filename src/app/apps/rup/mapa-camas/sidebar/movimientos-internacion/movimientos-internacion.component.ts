import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../mapa-camas.service';

@Component({
    selector: 'app-movimientos-internacion',
    templateUrl: './movimientos-internacion.component.html',
})

export class MovimientosInternacionComponent implements OnInit {
    // EVENTOS
    @Input() prestacion;

    @Output() cancel = new EventEmitter<any>();

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
        this.mapaCamasService.historial(this.desde, this.hasta, { idInternacion: this.prestacion._id }).subscribe(movimientos => {
            this.movimientos = movimientos;
            this.movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        });
    }

    cancelar() {
        this.cancel.emit();
    }
}
