import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getSistemaFTP, IMedicamentoFTP, ISistemaFTP } from './formularioTerapeutico.constantes';


@Component({
    selector: 'form-terapeutico-detalle',
    templateUrl: 'form-terapeutico-detalle.html',
    styleUrls: ['form-terapeutico-detalle.scss']
})

export class FormTerapeuticoDetallePageComponent {

    @Input() medicamento: IMedicamentoFTP;

    @Output() cerrar = new EventEmitter<void>();
    @Output() editar = new EventEmitter<IMedicamentoFTP>();
    @Output() eliminar = new EventEmitter<IMedicamentoFTP>();

    get sistema(): ISistemaFTP {
        return getSistemaFTP(this.medicamento?.sistema?.id);
    }

    get especialidades(): string {
        return this.medicamento?.especialidades?.join(', ');
    }

}
