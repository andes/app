import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, OnChanges } from '@angular/core';


@Component({
    selector: 'form-terapeutico-detalle',
    templateUrl: 'form-terapeutico-detalle.html',
    styleUrls: ['form-terapeutico-detalle.scss']
})

export class FormTerapeuticoDetallePage implements OnInit, OnChanges {
    mostrarMenu = false;


    @Input() medicamento: any;


    ngOnInit() {
     }

     ngOnChanges(changes: any) {
        this.medicamento;
    }

}
