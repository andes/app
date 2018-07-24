import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';


@Component({
    selector: 'app-formTerapeutico',
    templateUrl: './formTerapeutico.html'
})
export class formTerapeuticoComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    @Input() indice: any;
    @Input() deep: Number;
    private indices;
    private titulo;
    private padres: any[];
    private hijos: any[];
    public detalleMedicamento: any;

    constructor(private router: Router,
        private plex: Plex, public auth: Auth,
        public servicioFormTerapeutico: FormTerapeuticoService) { }


    ngOnInit() {
        this.servicioFormTerapeutico.get({ tree: 1, root: 1 }).subscribe((data: any) => {
            console.log(data)
            this.indices = data

        });
    }

    detallesMedicamento(data){
        this.detalleMedicamento = data;
console.log("padre",data)
    }

}