import { Auth } from '@andes/auth';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HojaTrabajoService } from '../../../services/hojatrabajo.service';
import { IHojaTrabajo } from '../../../interfaces/practica/hojaTrabajo/IHojaTrabajo';

@Component({
    selector: 'lista-hojatrabajo',
    templateUrl: './lista-hojatrabajo.html'
})
export class ListaHojatrabajoComponent implements OnInit {

    // Propiedades
    hojasTrabajo = [];
    hojasTrabajoFiltered = [];
    loader = true;
    seleccion: any = [];
    selectedArea: any;
    hojaTrabajoSelected: IHojaTrabajo | null;

    @Input() areas: any[];
    // Eventos
    @Output() hojaTrabajoSelectedEmmiter: EventEmitter<IHojaTrabajo> = new EventEmitter<IHojaTrabajo>();
    @Output() hojaTrabajoAgregarEmmiter: EventEmitter<IHojaTrabajo> = new EventEmitter<IHojaTrabajo>();

    // Constructor
    constructor(
        private servicioHojaTrabajo: HojaTrabajoService,
        private auth: Auth
    ) { }

    ngOnInit() {
        this.loader = true;
        this.cargarListado();
    }

    /**
     *
     *
     * @memberof ListaHojatrabajoComponent
     */
    cargarListado() {
        this.servicioHojaTrabajo.get(this.auth.organizacion.id).subscribe(hojasTrabajo => {
            this.hojasTrabajo = hojasTrabajo;
            this.hojasTrabajoFiltered = hojasTrabajo;
            this.hojaTrabajoSelected = null;
            this.loader = false;
            return;
        });
    }

    /**
     *
     *
     * @param {*} hojaTrabajo
     * @memberof ListaHojatrabajoComponent
     */
    seleccionar(hojaTrabajo: any) {
        this.hojaTrabajoSelected = hojaTrabajo;
        this.hojaTrabajoSelectedEmmiter.emit(hojaTrabajo);
    }

    /**
     *
     *
     * @memberof ListaHojatrabajoComponent
     */
    agregarHoja() {
        this.hojaTrabajoAgregarEmmiter.emit();
    }

    /**
     *
     *
     * @param {*} $event
     * @memberof ListaHojatrabajoComponent
     */
    filtrarHT($event) {
        if ($event.value) {
            this.hojasTrabajoFiltered = this.hojasTrabajo.filter(ht => ht.area.nombre === $event.value.nombre);
        } else {
            this.hojasTrabajoFiltered = this.hojasTrabajo;
        }
    }
}
