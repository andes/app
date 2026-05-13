import { PlexSelectComponent } from '@andes/plex';
import { Directive, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SnomedService } from '../../services/snomed.service';

/**
 * Transforma un plex-select automaticamente en un buscador de SNOMED
 */

@Directive({
    selector: '[snomedSemantic]'
})

export class SelectSemanticDirective implements OnInit {

    @Input() snomedSemantic: string | string[] = '';
    @Input() preload = false;

    private lastCallSubscription: Subscription = null;

    constructor(
        private snomed: SnomedService,
        private plexSelect: PlexSelectComponent
    ) {
        this.plexSelect.idField = 'term';
        this.plexSelect.labelField = 'term';
    }

    ngOnInit() {

        if (this.preload) {
            // No hay preload
            // this.plexSelect.data = [];
            // this.snomed.get({ expression: this.snomedSemantic }).subscribe(result => {
            //     this.plexSelect.data = result;
            // });
        } else {
            this.plexSelect.getData.subscribe(($event) => {


                const inputText: string = $event.query;

                if (inputText && inputText.length > 2) {
                    if (this.lastCallSubscription) {
                        this.lastCallSubscription.unsubscribe();
                    }

                    this.lastCallSubscription = this.snomed.get({
                        semanticTag: this.snomedSemantic,
                        search: $event.query
                    }).subscribe(result => {
                        $event.callback(result);
                    });

                } else {
                    const value = (this.plexSelect as any).value;
                    $event.callback(value ? [value] : []);
                }

            });

        }
    }
}




