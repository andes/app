import { PlexSelectComponent } from '@andes/plex/src/lib/select/select.component';
import { OnInit, Input, ViewContainerRef, Directive } from '@angular/core';
import { SnomedService } from '../../services/snomed.service';

/**
 * Transforma un plex-select automaticamente en un buscador de SNOMED
 */

@Directive({
    selector: '[snomedExpression]'
})

export class SelectExpressionDirective implements OnInit {

    @Input() snomedExpression = '';
    @Input() preload = true;

    constructor(
        private snomed: SnomedService,
        private plexSelect: PlexSelectComponent
    ) {
        this.plexSelect.idField = 'term';
        this.plexSelect.labelField = 'term';
    }

    ngOnInit() {
        if (this.preload) {
            this.plexSelect.data = [];
            this.snomed.getQuery({ expression: this.snomedExpression }).subscribe(result => {
                this.plexSelect.data = result;
            });
        } else {
            this.plexSelect.getData.subscribe(($event) => {
                this.snomed.getQuery({ expression: this.snomedExpression, words: $event.query }).subscribe(result => {
                    $event.callback(result);
                });
            });
        }
    }
}




