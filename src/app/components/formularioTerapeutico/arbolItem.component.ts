import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { FormTerapeuticoService } from '../../services/formTerapeutico/formTerapeutico.service';

@Component({
    selector: 'arbolItem',
    templateUrl: 'arbolItem.html',
})

export class ArbolItemComponent implements OnInit, OnChanges {
    public hijos: any[];
    @Output() enviarDetalle = new EventEmitter();
    @Output() enviarDatosMedicamento = new EventEmitter();
    @Output() hijosOutPut = new EventEmitter();
    @Output() borradoOutPut = new EventEmitter();
    @Input() indice: any;
    @Input() newMedicamento: any;
    @Input() deep: number;
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
            const rta = resultado;
            if (rta) {
                indice.borrado = true;
                this.servicioFormTerapeutico.put(indice).subscribe((data: any) => {
                    this.plex.toast('success', 'El medicamento se borro correctamente', 'Información', 2000);
                    this.hijosOutPut.emit(data);
                });
            }
        });
    }








}
