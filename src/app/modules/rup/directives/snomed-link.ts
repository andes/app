import { Component, Input, OnChanges } from '@angular/core';
import { ISnomedConcept } from '../interfaces/snomed-concept.interface';

@Component({
    selector: 'snomed-link',
    template: `
    <a target="_blank"
       title="ver detalle"
       class="snomed-link"
       href="https://browser.ihtsdotools.org/?perspective=full&conceptId1={{concepto.conceptId}}&edition=MAIN/SNOMEDCT-ES/SNOMEDCT-AR/2020-05-31&release=&languages=es">
       {{concepto.term}}
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
export class SnomedLinkComponent {
    @Input() concepto: ISnomedConcept;

}
