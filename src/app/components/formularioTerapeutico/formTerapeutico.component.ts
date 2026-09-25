import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, HostBinding, ViewChild } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';
import { ArbolItemComponent } from './arbolItem.component';


@Component({
    selector: 'app-formTerapeutico',
    templateUrl: './formTerapeutico.html'
})
export class FormTerapeuticoComponent implements OnInit {
    @ViewChild('arbol', { static: false }) arbolHijo: ArbolItemComponent;
    @HostBinding('class.plex-layout') layout = true;
    @Input() indice: any;
    @Input() deep: number;
    public indices;
    private titulo;
    private padres: any[];
    private hijos: any[];
    public detalleMedicamento: any;
    public datosArbol: any;
    public newMedicamento: any;
    constructor(private router: Router,
                private plex: Plex, public auth: Auth,
                public servicioFormTerapeutico: FormTerapeuticoService) { }


    ngOnInit() {
        this.servicioFormTerapeutico.get({ tree: 1, root: 1 }).subscribe((data: any) => {
            this.indices = data;

        });
    }

    detallesMedicamento(data) {
        this.detalleMedicamento = data;
        this.datosArbol = null;
    }

    recibeMedicamenteAgregar(data) {
        this.datosArbol = data;
        this.detalleMedicamento = null;
    }

    recibeHijos(data) {
        return data;
    }

    agregar(data) {
        if (data.carroEmergencia === true) {
            data.carroEmergencia = 'SI';
        } else {
            data.carroEmergencia = '';
        }
        data.idpadre = this.datosArbol.indice._id;

        this.servicioFormTerapeutico.post(data).subscribe((salida: any) => {
            this.plex.toast('success', 'El medicamento se agrego correctamente', 'Información', 3000);
            this.datosArbol.hijos.push(salida);
            // this.idMedicamentoPadre.hijos = [this.idMedicamentoPadre.hijos];

        });
    }

    plegar() {
        this.servicioFormTerapeutico.get({ tree: 1, root: 1 }).subscribe((data: any) => {
            this.indices = data;

        });
    }



}
