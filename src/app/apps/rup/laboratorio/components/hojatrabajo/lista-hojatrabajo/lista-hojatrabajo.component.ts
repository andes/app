import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HojaTrabajoService } from '../../../services/hojatrabajo.service';
import { Plex } from '@andes/plex';
import { IHojaTrabajo } from '../../../interfaces/practica/hojaTrabajo/IHojaTrabajo';

@Component({
    selector: 'lista-hojatrabajo',
    templateUrl: './lista-hojatrabajo.html'
})
export class ListaHojatrabajoComponent implements OnInit {

    // Propiedades
    hojasTrabajo = [];
    loader = true;
    seleccion: any = [];

    // Eventos
    @Output() hojaTrabajoSelectedEmmiter: EventEmitter<IHojaTrabajo> = new EventEmitter<IHojaTrabajo>();
    @Output() hojaTrabajoAgregarEmmiter: EventEmitter<IHojaTrabajo> = new EventEmitter<IHojaTrabajo>();

    // Constructor
    constructor(
        private plex: Plex,
        private servicioHojaTrabajo: HojaTrabajoService
    ) { }

    ngOnInit() {
        this.loader = true;
        this.cargarListado();
    }

    cargarListado() {
        this.servicioHojaTrabajo.get().subscribe(hojasTrabajo => {
            this.hojasTrabajo = hojasTrabajo;
            this.loader = false;
        });
    }

    seleccionar(hojaTrabajo: any) {
        this.hojaTrabajoSelectedEmmiter.emit(hojaTrabajo);
    }

    agregarHoja() {
        this.hojaTrabajoAgregarEmmiter.emit();
    }
}
