import { Component, Input, OnChanges } from '@angular/core';
import { ISnomedConcept } from '../interfaces/snomed-concept.interface';

@Component({
    selector: 'snomed-link',
    template: `
    <a target="_blank"
       class="snomed-link">
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
