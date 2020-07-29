import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ISnomedConcept } from '../../../interfaces/snomed-concept.interface';

@Component({
    selector: 'rup-observaciones-modal',
    template: `
        <plex-modal size="lg" [startOpen]="true" (closed)="onClose()" [allowClose]="true">
            <plex-modal-title type="info"> {{ concepto.term }} </plex-modal-title>
            <main>
                <plex-text [label]="label" [html]="true" [(ngModel)]="texto" name="observaciones"
                        placeholder="Ingrese una observación"
                        [height]="'65vh'" class="w-100">
                </plex-text>
            </main>
        </plex-modal>
    `
})
export class RUPObservacionesModalComponent {
    public texto = '';
    @Input() set value(value) {
        this.texto = value;
    }

    @Input() label = '';

    @Input() concepto: ISnomedConcept;

    @Output() close = new EventEmitter<string>();

    onClose() {
        this.close.emit(this.texto);
    }
}
