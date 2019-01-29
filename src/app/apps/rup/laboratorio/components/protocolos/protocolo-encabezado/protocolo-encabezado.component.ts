import { LaboratorioContextoCacheService } from './../../../services/protocoloCache.service';
import { Input, Output, Component, OnInit, EventEmitter } from '@angular/core';

@Component({
    selector: 'protocolo-encabezado',
    templateUrl: './protocolo-encabezado.html',
    styleUrls: ['../../../assets/laboratorio.scss']
})

export class ProtocoloEncabezadoComponent implements OnInit {

    modelo: any;
    solicitudProtocolo: any;
    contextoCache;

    @Input() seleccionPaciente: Boolean;
    @Input('protocolo')
    set protocolo(value: any) {
        if (value) {
            this.cargarProtocolo(value);
        }
    }

    @Output() siguienteEmit = new EventEmitter<any>();
    @Output() anteriorEmit = new EventEmitter<any>();
    @Output() edicionDatosCabeceraEmitter = new EventEmitter<any>();
    @Output() cambiarPacienteEmitter = new EventEmitter<any>();

    constructor( public laboratorioContextoCacheService: LaboratorioContextoCacheService ) { }

    ngOnInit() {
        this.contextoCache = this.laboratorioContextoCacheService.getContextoCache();
    }

    cambiarPaciente() {
        this.cambiarPacienteEmitter.emit();
    }

    editarDatosCabecera() {
        this.contextoCache.edicionDatosCabecera = true;
        this.edicionDatosCabeceraEmitter.emit(true);
    }

    cargarProtocolo(value: any) {
        this.modelo = value;
    }

    siguiente() {
        this.siguienteEmit.emit();
    }

    anterior() {
        this.anteriorEmit.emit();
    }
}
