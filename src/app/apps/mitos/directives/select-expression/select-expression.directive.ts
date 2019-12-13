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
        private _viewContainerRef: ViewContainerRef
    ) {
        const plexSelect = this._viewContainerRef['_data'].componentView.component;
        plexSelect.idField = 'term';
        plexSelect.labelField = 'term';
    }

    ngOnInit() {
        const plexSelect = this._viewContainerRef['_data'].componentView.component;
        if (this.preload) {
            plexSelect.data = [];
            this.snomed.getQuery({ expression: this.snomedExpression }).subscribe(result => {
                plexSelect.data = result;
            });
        } else {
            plexSelect.getData.subscribe(($event) => {
                this.snomed.getQuery({ expression: this.snomedExpression, words: $event.query }).subscribe(result => {
                    $event.callback(result);
                });
            });
        }
    }
}




