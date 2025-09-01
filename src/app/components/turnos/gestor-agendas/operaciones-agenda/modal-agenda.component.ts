import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { PlexModalComponent } from '@andes/plex';

@Component({
    selector: 'modal-agenda',
    template: `
        <plex-modal size="md" #modal [startOpen]="true" [allowEscClose]="false" [allowBackdropClose]="false">
        <plex-icon name="alert-circle" type="warning"></plex-icon>
        <plex-modal-title *ngIf="dato.clonarOguardar === 'clonar'" type="warning">¡La agenda no se pudo clonar!</plex-modal-title>
        <plex-modal-title *ngIf="dato.clonarOguardar === 'guardar'" type="warning">¡La agenda no se pudo guardar!</plex-modal-title>
        <plex-modal-subtitle *ngIf="dato.tipoError === 'profesional'" center class="font-subtitle text-muted text-center">
            Uno o más profesionales están asignados a otra agenda en ese horario.
        </plex-modal-subtitle>
        <plex-modal-subtitle *ngIf="dato.tipoError === 'espacio-fisico'" center class="font-subtitle text-muted text-center">
            El espacio físico está asignado a otra agenda en ese horario.
        </plex-modal-subtitle>
    <main class="hide-scroll">
        <div class="w-100">
            <plex-title size="sm" titulo="Detalles"></plex-title>
            <plex-grid type="full" cols="2">
                <plex-label type="info" icon="medico" titulo="Profesional" subtitulo="{{dato.profesional}}">
                </plex-label>
                <plex-label type="info" icon="centro-salud" titulo="Centro de salud" subtitulo="{{dato.centroSalud}}">
                </plex-label>
                <plex-label type="info" icon="mano-corazon" titulo="Prestación" subtitulo="{{dato.prestacion}}">
                </plex-label>
                <plex-label type="info" icon="account" titulo="Creada por" subtitulo="{{dato.creadaPor}}">
                </plex-label>
            </plex-grid>
        </div>
    </main>
    <plex-button modal center type="success" (click)="cerrar()">
        ACEPTAR
    </plex-button>
</plex-modal>
    `,
    styleUrls: ['modal-agenda.scss'],
})

export class ModalAgendaComponent {
    @Input() dato: any;
    @Output() close = new EventEmitter<any>();
    @ViewChild('modal', { static: true }) modal: PlexModalComponent;

    cerrar() {
        this.modal.close();
        this.close.emit();
    }
}
