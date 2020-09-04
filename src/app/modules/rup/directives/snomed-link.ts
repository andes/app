import { Component, Input, OnInit } from '@angular/core';
import { ISnomedConcept } from '../interfaces/snomed-concept.interface';
import { ConceptosTurneablesService } from '../../../services/conceptos-turneables.service';

@Component({
    selector: 'snomed-link',
    template: `
    <a target="_blank"
       title="ver detalle"
       class="snomed-link"
       href="https://browser.ihtsdotools.org/?perspective=full&conceptId1={{concepto.conceptId}}&edition=MAIN/SNOMEDCT-ES/SNOMEDCT-AR/2020-05-31&release=&languages=es">
       {{concepto.term}}
        <ng-container *ngIf="sinonimo">
                 <br>
                 <p class="text-muted">{{fsn}}</p>
         </ng-container>
    </a>
    `,
    styles: [
        `
        .snomed-link {
            color: #292b2c
        }
        `
    ]
})
export class SnomedLinkComponent implements OnInit {
    @Input() concepto: ISnomedConcept;
    public sinonimo = false;
    public fsn;

    ngOnInit() {
        const indice = this.concepto.fsn.indexOf('(');
        this.fsn = this.concepto.fsn.substring(0, indice);

        if (this.concepto.term.trim() !== this.fsn.trim()) {
            this.sinonimo = true;
        }
    }

}
