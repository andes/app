import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';
import { SnomedService } from '../../services/term/snomed.service';


@Component({
    selector: 'app-addFormTerapeutico',
    templateUrl: './add-form-terapeutico.html'
})
export class AddformTerapeuticoComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    @Input() indice: any;
    @Input() deep: Number;
    private indices;
    private titulo;
    private padres: any[];
    private hijos: any[];
    public detalleMedicamento: any;
    public datosParaAgregar = {
        concepto: null,
        indicaciones: null,
        nivelComplejidad: null,
        nodo: null,
        medicamento: true,
        carroEmergencia: null,
        idpadre: null
    }
    public busqueda;
    public conceptos = [];
    public conceptoSeleccionado;

    @Output() objNuevoMedicamento = new EventEmitter();

    constructor(private router: Router,
        private plex: Plex, public auth: Auth,
        public servicioFormTerapeutico: FormTerapeuticoService,
        private SNOMED: SnomedService
    ) { }


    ngOnInit() {
        // this.loadMedicamentos();
    }


    agregar() {
        console.log(this.datosParaAgregar)
        this.objNuevoMedicamento.emit(this.datosParaAgregar);
    }


    // loadMedicamentos(data) {
    //     let search = this.busqueda
    //     console.log(this.busqueda)
    //     this.SNOMED.get({
    //         search: search,
    //         semanticTag: ['producto']
    //     }).subscribe((salida: any) => {
    //         console.log(salida)
    //         this.conceptos = salida

    //     });
    // }


    selectConcept(unConcepto) {
        console.log(unConcepto)
        this.conceptoSeleccionado = unConcepto;
        this.datosParaAgregar.concepto = unConcepto;
        this.busqueda = unConcepto.term
    }

    loadMedicamentos(event) {
        console.log(event)
        if (event && event.query) {
            let query = {
                search: event.query,
                semanticTag: ['producto']
            };
            this.SNOMED.get(
                query
            ).subscribe((salida: any) => {
                console.log(salida)
                this.conceptos = salida
                event.callback(salida);

            });

        } else {

            event.callback([]);
        }
    }


}