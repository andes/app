import { Component, Input } from '@angular/core';


@Component({
    selector: 'form-terapeutico-detalle',
    templateUrl: 'form-terapeutico-detalle.html',
    styleUrls: ['form-terapeutico-detalle.scss']
})

export class FormTerapeuticoDetallePageComponent {
    mostrarMenu = false;


    @Input() medicamento: any;

}
