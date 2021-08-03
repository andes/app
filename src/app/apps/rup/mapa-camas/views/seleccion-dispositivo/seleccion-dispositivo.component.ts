import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DispositivoService } from 'src/app/services/dispositivo/dispositivo.service';

@Component({
    selector: 'app-seleccion-dispositivo',
    templateUrl: 'seleccion-dispositivo.html'
})
export class SeleccionDispositivoComponent implements OnInit {

    public dispositivo;
    public tipoDispositivos = [];

    @Output() selected = new EventEmitter<any>();

    constructor(
        private dispositivosService: DispositivoService
    ) { }

    ngOnInit() {
        this.dispositivosService.search({ activo: true }).subscribe(resultado => {
            this.tipoDispositivos = resultado;
        });
    }

    onSelect(event) {
        this.selected.emit(event);
    }
}
