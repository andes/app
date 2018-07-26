import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';
import { forEach } from '@angular/router/src/utils/collection';
@Component({
    selector: 'arbolItem',
    templateUrl: 'arbolItem.html',
})

export class ArbolItem implements OnInit, OnChanges {
    public hijos: any[];
    @Output() enviarDetalle = new EventEmitter();
    @Output() enviarDatosMedicamento = new EventEmitter();
    @Output() hijosOutPut = new EventEmitter();
    @Output() refreshOutPut = new EventEmitter();
    @Input() indice: any;
    @Input() newMedicamento: any;
    @Input() deep: Number;
    medicamentoSelect;

    constructor(public servicioFormTerapeutico: FormTerapeuticoService, private plex: Plex
    ) {

    }

    esHoja() {
        return !this.indice.arbol || this.indice.arbol.length === 0;
    }

    ngOnInit() {

    }

    ngOnChanges(changes: any) {

    }

    buscarHijos() {
        this.servicioFormTerapeutico.get({ tree: 1, idpadre: this.indice._id }).subscribe((data: any) => {
            this.hijos = data;
        });
    }

    verDetalle(indice) {
        this.medicamentoSelect = indice;
        this.enviarDetalle.emit(this.medicamentoSelect);

    }

    agregarMedicamento(indice) {
        this.enviarDatosMedicamento.emit(this);
    }

    borrar(indice) {
        this.plex.confirm(' Ud. está por eliminar el medicamento "' + indice.concepto.term + '", esta seguro?').then((resultado) => {
            let rta = resultado;
            if (rta) {
                indice.borrado = true;
                this.servicioFormTerapeutico.put(indice).subscribe((data: any) => {
                    this.plex.toast('success', 'El medicamento se borro correctamente', 'Información', 2000);
                    this.hijosOutPut.emit(data);
                });
            }
        });
    }

    pushMedicamento(medicamentoEntrante) {
        // this.hijos[0].arbol = [...this.hijos[0].arbol];
        // console.log(medicamentoEntrante)
        console.log(this.hijos);


    }




}
