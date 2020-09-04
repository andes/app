import { Component, Input, OnChanges } from '@angular/core';
import { ISnomedConcept } from '../interfaces/snomed-concept.interface';

@Component({
    selector: 'snomed-sinonimo',
    template: `
       <ng-container *ngIf="sinonimo">
            <p class="text-muted">{{fsn}}</p>
       </ng-container>
    `,
    styles: [
        `
        .snomed-link {
            color: #292b2c
        }
        `
    ]
})
export class SnomedSinonimoComponent implements OnChanges {
    @Input() concepto: ISnomedConcept;
    public sinonimo = false;
    public fsn;

    ngOnChanges() {
        const indice = this.concepto.fsn.indexOf('(');
        this.fsn = this.concepto.fsn.substring(0, indice);

        if (this.concepto.term.trim() !== this.fsn.trim()) {
            this.sinonimo = true;
        }
    }


}
