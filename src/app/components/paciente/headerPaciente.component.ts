import { Plex } from '@andes/plex';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../interfaces/IPaciente';
import { Auth } from '@andes/auth';

@Component({
    selector: 'header-paciente',
    templateUrl: 'headerPaciente.html',
    styleUrls: ['headerPaciente.scss']
})
export class HeaderPacienteComponent {
    public hidePopup = false;
    @Input() paciente: IPaciente;
    @Input() cambiarPaciente: boolean;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    constructor() { };

    cambioDePaciente() {
        // Oculta el popup (genera una suerte de mouseout)
        this.hidePopup = true;
        setTimeout(() => this.hidePopup = false);

        // Emite el evento
        this.evtData.emit(true);
    }
}
