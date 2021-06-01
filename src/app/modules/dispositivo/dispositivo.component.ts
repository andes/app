import { Component, Input, OnInit } from '@angular/core';
import { DispositivoService } from '../../services/dispositivo/dispositivo.service';

@Component({
    selector: 'dispositivo',
    templateUrl: './dispositivo.html',
})
export class DispositivoComponent implements OnInit {
    @Input() modelo;
    @Input() tipo;
    tipoDispositivos = [];
    constructor(
        private dispositivoService: DispositivoService
    ) { }

    ngOnInit() {
        this.dispositivoService.search({ activo: true, tipo: this.tipo }).subscribe(resultado => {
            this.tipoDispositivos = resultado;
        });
    }



}
