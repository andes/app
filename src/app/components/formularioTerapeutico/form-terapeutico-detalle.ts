import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';

@Component({
    selector: 'form-terapeutico-detalle',
    templateUrl: 'form-terapeutico-detalle.html',
    styleUrls: ['form-terapeutico-detalle.scss']
})

export class FormTerapeuticoDetallePage implements OnInit,OnChanges {
    mostrarMenu = false;
    private item;
    private padres;

    @Input() medicamento: any;


    ngOnInit() {
        console.log(this.medicamento)
     }

     ngOnChanges(changes: any) {
        this.medicamento ;
    }

}
