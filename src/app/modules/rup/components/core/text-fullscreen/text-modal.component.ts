import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'rup-text-modal',
    template: `
        <plex-modal  [startOpen]="true" (closed)="onClose()" [allowClose]="true">
            <plex-modal-title type="info"> {{ title }} </plex-modal-title>
            <main>
                <plex-text label="Observaciones" [html]="true" [(ngModel)]="texto" name="observaciones"
                        placeholder="Ingrese una observación"
                        [height]="500"></plex-text>
            </main>
        </plex-modal>

    `
})
export class RUPTextModalComponent {
    @Input() title = '';

    @Input() texto = '';

    @Output() close = new EventEmitter<string>();

    public onClose() {
        this.close.emit(this.texto);
    }
}
