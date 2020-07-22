import { OnInit, Input, ViewContainerRef, Directive, OnDestroy } from '@angular/core';
import { PlexSelectComponent } from '@andes/plex/src/lib/select/select.component';
import { Subscription } from 'rxjs';
import { ObraSocialService } from '../services/obraSocial.service';

/**
 * Transforma un plex-select automaticamente en un buscador de Financiadores
 */

@Directive({
    selector: '[tmFinanciador]'
})

export class SelectFinanciadorDirective implements OnInit, OnDestroy {

    @Input() preload = false;

    private subscription: Subscription = null;
    private lastCallSubscription: Subscription = null;

    constructor(
        private obraSocialService: ObraSocialService,
        private _viewContainerRef: ViewContainerRef
    ) {
        const plexSelect: PlexSelectComponent = this._viewContainerRef['_data'].componentView.component;
        plexSelect.idField = 'id';
        plexSelect.labelField = 'nombre';
    }

    ngOnInit() {
        const plexSelect: PlexSelectComponent = this._viewContainerRef['_data'].componentView.component;
        if (this.preload) {
            plexSelect.data = [];
            this.obraSocialService.getListado({}).subscribe(result => {
                plexSelect.data = result;
            });
        } else {
            this.subscription = plexSelect.getData.subscribe(($event) => {
                const inputText: string = $event.query;
                if (inputText && inputText.length > 2) {
                    if (this.lastCallSubscription) {
                        this.lastCallSubscription.unsubscribe();
                    }
                    this.lastCallSubscription = this.obraSocialService.getListado({ nombre: inputText }).subscribe(result => {
                        $event.callback(result);
                    });
                } else {
                    const value = (plexSelect as any).value;
                    $event.callback(value);
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
