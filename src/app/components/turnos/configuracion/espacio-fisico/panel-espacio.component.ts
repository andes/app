import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { Plex } from 'andes-plex/src/lib/core/service';
import { Component, OnInit, Input } from '@angular/core';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';

@Component({
    selector: 'app-panel-espacio',
    templateUrl: 'panel-espacio.html'
})

export class PanelEspacioComponent implements OnInit {
    private _agenda: any;
    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
    }
    get agenda(): any {
        return this._agenda;
    }
    private espacios: IEspacioFisico[];
    constructor(private serviceAgenda: AgendaService, private serviceEspacio: EspacioFisicoService, public plex: Plex) { }

    ngOnInit() {
        this.loadEspacios();
    }

    loadEspacios() {
        this.serviceEspacio.get({}).subscribe(espacios => { this.espacios = espacios; console.log('espacios ', this.espacios); });
    }
}
