import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';
import { SnomedService } from '../../apps/mitos';


@Component({
    selector: 'app-addFormTerapeutico',
    templateUrl: './add-form-terapeutico.html'
})
export class AddformTerapeuticoComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    @Input() indice: any;
    @Input() deep: Number;
    public detalleMedicamento: any;
    public datosParaAgregar = {
        concepto: null,
        indicaciones: null,
        nivelComplejidad: null,
        nodo: null,
        medicamento: true,
        carroEmergencia: null,
        idpadre: null
    };
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
        this.objNuevoMedicamento.emit(this.datosParaAgregar);
    }




    selectConcept(unConcepto) {
        this.conceptoSeleccionado = unConcepto;
        this.datosParaAgregar.concepto = unConcepto;
        this.busqueda = unConcepto.term;
    }

    loadMedicamentos(event) {
        if (event && event.query) {
            const query = {
                search: event.query,
                semanticTag: ['producto', 'fármaco de uso clínico']
            };
            this.SNOMED.get(
                query
            ).subscribe((salida: any) => {
                this.conceptos = salida;
                event.callback(salida);

            });

        } else {

            event.callback([]);
        }
    }


}
