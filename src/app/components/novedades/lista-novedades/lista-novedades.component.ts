import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { INovedad } from 'src/app/interfaces/novedades/INovedad.interface';

@Component({
    selector: 'lista-novedades',
    templateUrl: './lista-novedades.component.html',
    styleUrls: ['./lista-novedades.scss']
})

export class ListaNovedadesComponent implements OnInit, OnChanges {
    @Input() novedad: INovedad;
    @Output() setNovedad = new EventEmitter<any>();

    cacheNovedades = [];

    ngOnInit() {
        this.cacheNovedades = Object.values(JSON.parse(localStorage.getItem('novedades')) || []).reverse();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.novedad.currentValue) {
            this.agregarVistaNovedad(changes.novedad.currentValue);
        }
    }

    agregarVistaNovedad(novedad: INovedad) {
        const existeVista = novedad && this.cacheNovedades.some(elem => elem._id === novedad._id);

        if (!existeVista) {
            if (this.cacheNovedades.length === 5) { this.cacheNovedades.shift(); }

            this.cacheNovedades.push(this.novedad);
            localStorage.setItem('novedades', JSON.stringify(this.cacheNovedades));
        }
    }

    verDetalle(novedad: INovedad) {
        this.setNovedad.emit(novedad);
    }
}
