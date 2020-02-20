import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';

@Component({
    selector: 'app-movimientos-internacion',
    templateUrl: './movimientos-internacion.component.html',
})

export class MovimientosInternacionComponent implements OnInit {
    // EVENTOS
    @Input() prestacion: IPrestacion;

    @Output() cambioCama = new EventEmitter<any>();

    // VARIABLES
    public ambito: string;
    public capa: string;
    public movimientos: ISnapshot[];
    public desde = moment().toDate();
    public hasta = moment().toDate();
    public prestacionValidada = false;

    constructor(
        public auth: Auth,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.ambito = this.mapaCamasService.ambito;
        this.capa = this.mapaCamasService.capa;

        this.getMovimientos();

        if (this.prestacion) {
            this.prestacionValidada = (this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada');
        }
    }

    getMovimientos() {
        this.mapaCamasService.historial('internacion', this.desde, this.hasta).subscribe((movimientos: ISnapshot[]) => {
            this.movimientos = movimientos;
            this.movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        });
    }

    cambiarCama() {
        this.cambioCama.emit();
    }
}
