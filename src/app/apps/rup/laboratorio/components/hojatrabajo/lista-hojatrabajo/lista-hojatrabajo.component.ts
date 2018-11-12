import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { HojaTrabajoService } from '../../../services/hojatrabajo.service';
import { TemplateData } from '@angular/core/src/view';
import { Plex, SelectEvent } from '@andes/plex';

@Component({
    selector: 'lista-hojatrabajo',
    templateUrl: './lista-hojatrabajo.html'
})
export class ListaHojatrabajoComponent implements OnInit {

    // Propiedades
    listado = [];
    loader = true;
    seleccion: any = [];

    // Eventos
    @Output() selected: EventEmitter<TemplateData> = new EventEmitter<TemplateData>();

    // Constructor
    constructor(
        private plex: Plex,
        private servicioHojaTrabajo: HojaTrabajoService
    ) {
        servicioHojaTrabajo.getHojasTrabajo().subscribe(hojas => {
            this.listado = hojas;
        });
    }

    ngOnInit() {
        this.cargarListado();
    }

    cargarListado() {
        // Simulamos un tiempo de busqueda
        this.loader = true;
        setTimeout(() => {
            this.loader = false;
            let len = Math.floor(Math.random() * this.listado.length);
            for (let i = 0; i < len; i++) {
                this.seleccion.push(this.listado[i]);
            }
        }, 3000);
    }

    seleccionar(item: TemplateData) {
        this.plex.info('success', 'Se seleccionó un item');
        this.selected.emit(item);
    }

}
