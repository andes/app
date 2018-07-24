import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';


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
        nombre: null,
        indicaciones: null,
        complejidad: null,
        nodo: null,
        medicamento: null,
        carroDeEmergencia: null
    }

    @Output() objNuevoMedicamento =  new EventEmitter(); 

    constructor(private router: Router,
        private plex: Plex, public auth: Auth,
        public servicioFormTerapeutico: FormTerapeuticoService) { }


    ngOnInit() {

    }


    agregar(){
        console.log(this.datosParaAgregar)
        this.objNuevoMedicamento.emit(this.datosParaAgregar);
    }


}