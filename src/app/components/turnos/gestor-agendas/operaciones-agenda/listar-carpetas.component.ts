import { Component, Input, EventEmitter, Output, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { PacienteService } from './../../../../services/paciente.service';
import * as moment from 'moment';

@Component({
    selector: 'listar-carpetas',
    templateUrl: 'listar-carpetas.html',
    styleUrls: ['listar-carpetas.print.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})

export class ListarCarpetasComponent implements OnInit {

    private _agendasSeleccionadas;
    @Input('agendasSeleccionadas')
    set agendasSeleccionadas(value: any) {
        this._agendasSeleccionadas = value;
    }
    get agendasSeleccionadas(): any {
        return this._agendasSeleccionadas;
    }

    @Output() volverAlGestor = new EventEmitter<boolean>();
    @HostBinding('class.plex-layout') layout = true;

    autorizado = false;
    showCarpetas = true;
    turnosAsignados = [];
    titulo = '';

    constructor(public plex: Plex, public servicePaciente: PacienteService, public auth: Auth) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:agenda:puedeImprimir:').length > 0;
    }

    // Abre diálogo de impresión del navegador
    imprimir() {
        window.print();
    }

    // Vuelve al gestor
    cancelar() {
        this.volverAlGestor.emit(true);
        this.showCarpetas = false;
    }

}
