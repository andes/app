import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';
@Component({
    selector: 'arbolItem',
    templateUrl: 'arbolItem.html',
})

export class ArbolItem implements OnInit {
    private indices;
    private titulo;
    private padres: any[];
    private hijos: any[];
    @Output() enviarDetalle = new EventEmitter();
    @Output() enviarDatosMedicamento = new EventEmitter();
    @Input()indice: any;
    @Input() deep: Number;
    medicamentoSelect;

    constructor( public servicioFormTerapeutico: FormTerapeuticoService
    ) {

    }

    esHoja () {
        return !this.indice.arbol || this.indice.arbol.length === 0;
    }

    ngOnInit() {
        console.log("aca si wacho")
    }

    buscarHijos() {
        this.servicioFormTerapeutico.get({ tree: 1, idpadre: this.indice._id }).subscribe((data: any) => {
            console.log(data)

             this.hijos = data;
        });
    }

    verDetalle(indice) {
    this.medicamentoSelect = indice;
    this.enviarDetalle.emit(this.medicamentoSelect)
    console.log(this.medicamentoSelect)

    }

    agregarMedicamento(indice){
        this.enviarDatosMedicamento.emit(this.indice._id)
    }

}
