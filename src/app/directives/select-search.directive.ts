import { Input, ViewContainerRef, Directive, OnDestroy, AfterContentInit } from '@angular/core';
import { PlexSelectComponent } from '@andes/plex/src/lib/select/select.component';
import { Subscription } from 'rxjs';
import { SelectSearchService } from '../services/select-search.service';

/**
 * Transforma un plex-select automaticamente en un buscador de dinamico
 */

@Directive({
    selector: '[ssSearch]'
})

export class SelectSearchDirective implements OnDestroy, AfterContentInit {

    @Input() ssSearch;
    @Input() preload;

    private subscription: Subscription = null;
    private lastCallSubscription: Subscription = null;

    constructor(
        private selectSearch: SelectSearchService,
        private plexSelect: PlexSelectComponent
    ) {

        plexSelect.idField = 'id';
        plexSelect.labelField = 'nombre';
    }

    ngAfterContentInit() {
        if (this.preload) {
            console.log('ssserac', this.ssSearch);
            this.plexSelect.data = [];
            this.selectSearch.get(this.ssSearch, null).subscribe(result => {
                this.plexSelect.data = result;
            });
        } else {
            this.subscription = this.plexSelect.getData.subscribe(($event) => {
                const inputText: string = $event.query;
                if (inputText && inputText.length > 1) {
                    if (this.lastCallSubscription) {
                        this.lastCallSubscription.unsubscribe();
                    }
                    this.lastCallSubscription = this.selectSearch.get(this.ssSearch, inputText).subscribe(result => {
                        $event.callback(result);
                    });
                } else {
                    const selectedValue = (this.plexSelect as any).value;
                    console.log('event ', selectedValue);

                    if (selectedValue) {
                        $event.callback([selectedValue]);
                    } else {
                        $event.callback([]);
                    }
                }
            });
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}