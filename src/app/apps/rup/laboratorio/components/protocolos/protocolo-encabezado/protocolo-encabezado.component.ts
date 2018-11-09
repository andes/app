import { Input, Output, Component, OnInit, EventEmitter } from '@angular/core';
import { IPrestacion } from '../../../../../../modules/rup/interfaces/prestacion.interface';

@Component({
    selector: 'protocolo-encabezado',
    templateUrl: './protocolo-encabezado.html',
    styleUrls: ['../../../assets/laboratorio.scss']
})

export class ProtocoloEncabezadoComponent implements OnInit {

    modelo: any;
    solicitudProtocolo: any;
    @Input() modo: String;
    @Input() edicionDatosCabecera: Boolean;
    @Input('protocolo')
    set protocolo(value: any) {
        if (value) {
            this.cargarProtocolo(value);
        }
    }
    @Output() siguienteEmit = new EventEmitter<any>();
    @Output() anteriorEmit = new EventEmitter<any>();

    cargarProtocolo(value: any) {
        console.log('cargarProtocolo');
        this.modelo = value;
        this.solicitudProtocolo = this.modelo.solicitud.registros[0].valor;
    }

    setProtocoloSelected(protocolo: IPrestacion) {
        console.log('setProtocoloSelected');
        this.modelo = protocolo;
        this.solicitudProtocolo = this.modelo.solicitud.registros[0].valor;
    }

    siguiente() {
        this.siguienteEmit.emit();
    }

    anterior() {
        this.anteriorEmit.emit();
    }

    editarDatosCabecera() {

    }

    constructor() { }

    ngOnInit() {
        // this.setProtocoloSelected(this.modelo);
    }

}
