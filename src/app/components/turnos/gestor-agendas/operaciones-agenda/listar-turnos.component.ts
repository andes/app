import { Component, Input, EventEmitter, Output, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { DocumentosService } from '../../../../services/documentos.service';
import { idCMI } from '../../constantes';
@Component({
    selector: 'listar-turnos',
    templateUrl: 'listar-turnos.html',
    styleUrls: ['listar-turnos.print.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})

export class ListarTurnosComponent implements OnInit {

    private _agendas;
    public desplegarOS = false;
    @Input() // recibe un array de agendas
    set agendas(value: any) {
        this._agendas = value;
        const turnos = [];
    }
    get agendas(): any {
        return this._agendas;
    }

    @Output() volverAlGestor = new EventEmitter<boolean>();
    @HostBinding('class.plex-layout') layout = true;

    autorizado = false;
    showListarTurnos = true;
    // turnosAsignados = [];
    public idOrganizacion = this.auth.organizacion.id;

    constructor(public plex: Plex, private documentosService: DocumentosService, private auth: Auth) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:agenda:puedeImprimir:').length > 0;
        this.desplegarOS = this.auth.organizacion.id === idCMI;
    }

    // Abre diálogo de impresión del navegador
    printAgenda(agendas) {
        const agendaId = agendas[0].id;
        this.documentosService.descargarAgenda({ agendaId }, 'agenda').subscribe();
    }

    // Vuelve al gestor
    cancelar() {
        this.volverAlGestor.emit(true);
        this.showListarTurnos = false;
    }

}
