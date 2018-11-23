import { Input, Output, Component, OnInit, EventEmitter } from '@angular/core';

@Component({
    selector: 'protocolo-encabezado-vista',
    templateUrl: './protocolo-encabezado-vista.html',
    styleUrls: ['../../../../assets/laboratorio.scss']
})

export class ProtocoloEncabezadoVistaComponent implements OnInit {
    modelo: any;
    solicitudProtocolo: any;
    mostrarMasOpciones: boolean;
    @Input() edicionDatosCabecera: boolean;
    @Input() modo: string;
    @Input('protocolo')
    set protocolo(value: any) {
        if (value) {
            this.cargarProtocolo(value);
        }
    }

    @Output() siguienteEmit = new EventEmitter<any>();
    @Output() anteriorEmit = new EventEmitter<any>();
    @Output() edicionDatosCabeceraEmitter = new EventEmitter<any>();

    constructor() { }

    ngOnInit() {
    }

    cargarProtocolo(value: any) {
        this.modelo = value;
        this.solicitudProtocolo = this.modelo.solicitud.registros[0].valor;
    }

    siguiente() {
        this.siguienteEmit.emit();
    }

    anterior() {
        this.anteriorEmit.emit();
    }

    editarDatosCabecera() {
        this.edicionDatosCabeceraEmitter.emit(true);
    }
}
