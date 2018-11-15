import { ListaHojatrabajoComponent } from './../lista-hojatrabajo/lista-hojatrabajo.component';
import { IHojaTrabajo } from '../../../interfaces/practica/hojaTrabajo/IHojaTrabajo';
import { HojaTrabajoService } from '../../../services/hojatrabajo.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'gestor-hojatrabajo',
    templateUrl: './gestor-hojatrabajo.html'
})
export class GestorHojatrabajoComponent implements OnInit {

    // Propiedades
    public accionIndex = 0;
    public modo = '';
    public hojaTrabajo: IHojaTrabajo;

    @ViewChild(ListaHojatrabajoComponent)
    private listaHojatrabajoComponent: ListaHojatrabajoComponent;

    // Constructor
    constructor(
        private plex: Plex,
        private servicioHojaTrabajo: HojaTrabajoService
    ) { }

    ngOnInit() {
        this.agregarHoja();
    }

    cambio($event) {
        this.accionIndex = $event;
        if ($event === 0) {
            this.modo = 'impresion';
        } else if ($event === 1) {
            this.modo = 'practicas';
        } else if ($event === 2) {
            this.modo = 'carga';
        }
        // this.refreshSelection();
    }

    seleccionarHojaTrabajo($event) {
        this.hojaTrabajo = $event;
    }


    guardarHoja() {
        if (!this.hojaTrabajo.id) {
            this.servicioHojaTrabajo.post(this.hojaTrabajo).subscribe(respuesta => {
                this.recargarHojasTrabajo();
            });
        } else {
            this.servicioHojaTrabajo.put(this.hojaTrabajo).subscribe(respuesta => {
                this.recargarHojasTrabajo();
            });
        }
    }

    recargarHojasTrabajo() {
        this.plex.toast('success', ' ', 'Hoja trabajo guardada', 1000);
        this.listaHojatrabajoComponent.cargarListado();
    }

    agregarHoja() {
        this.hojaTrabajo = new IHojaTrabajo();
    }

    volverLista() {
        console.log('guardar hoja', new Date);
    }

    cargarHoja() {
        if (this.hojaTrabajo._id) {

        }
    }
}
