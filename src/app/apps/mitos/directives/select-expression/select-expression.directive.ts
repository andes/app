import { PlexSelectComponent } from '@andes/plex/src/lib/select/select.component';
import { cacheStorage } from '@andes/shared';
import { Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { SnomedService } from '../../services/snomed.service';

/**
 * Transforma un plex-select automaticamente en un buscador de SNOMED
 */

@Directive({
    selector: '[snomedExpression]'
})

export class SelectExpressionDirective implements OnInit, OnChanges {

    @Input() snomedExpression = '';
    @Input() preload = true;

    private lastCallSubscription: Subscription = null;

    constructor(
        private snomed: SnomedService,
        private plexSelect: PlexSelectComponent
    ) {
        this.plexSelect.idField = 'term';
        this.plexSelect.labelField = 'term';
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.preload && changes['snomedExpression']) {
            this.preloadData();
        }
    }

    ngOnInit() {
        if (this.preload) {
            this.plexSelect.data = [];
            this.preloadData();
        } else {
            this.plexSelect.getData.subscribe(($event) => {

                const inputText: string = $event.query;

                if (inputText && inputText.length > 2) {
                    if (this.lastCallSubscription) {
                        this.lastCallSubscription.unsubscribe();
                    }

                    this.lastCallSubscription = this.snomed.getQuery({ expression: this.snomedExpression, words: $event.query, type: 'inferred' }).subscribe(result => {
                        $event.callback(result);
                    });

                } else {
                    const value = (this.plexSelect as any).value;
                    $event.callback(value ? [value] : []);
                }

            });

        }
    }

    preloadData() {
        this.snomed.getQuery({ expression: this.snomedExpression, type: 'inferred' }).pipe(
            cacheStorage({ key: this.snomedExpression, ttl: 60 * 24 })
        ).subscribe(result => {
            this.plexSelect.data = result;
        });
    }
}




