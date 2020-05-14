import { OnInit, Input, ViewContainerRef, Directive, OnDestroy } from '@angular/core';
import { PlexSelectComponent } from '@andes/plex/src/lib/select/select.component';
import { Subscription } from 'rxjs';
import { ConceptosTurneablesService } from '../services/conceptos-turneables.service';

/**
 * Transforma un plex-select automaticamente en un buscador de Profesionales
 */

@Directive({
    selector: '[tmPrestaciones]'
})

export class SelectPrestacionesDirective implements OnInit, OnDestroy {

    @Input() tmPrestaciones;
    @Input() preload = false;

    private subscription: Subscription = null;
    private lastCallSubscription: Subscription = null;

    constructor(
        private conceptosTurneables: ConceptosTurneablesService,
        private _viewContainerRef: ViewContainerRef
    ) {
        const plexSelect: PlexSelectComponent = this._viewContainerRef['_data'].componentView.component;
        plexSelect.idField = 'id';
        plexSelect.labelField = 'term';
    }

    ngOnInit() {
        const plexSelect: PlexSelectComponent = this._viewContainerRef['_data'].componentView.component;
        if (this.preload) {
            plexSelect.data = [];
            const permisos = this.tmPrestaciones;
            this.conceptosTurneables.getByPermisos(permisos).subscribe(result => {
                plexSelect.data = result;
            });
        } else {
            this.subscription = plexSelect.getData.subscribe(($event) => {
                const inputText: string = $event.query;
                const permisos = this.tmPrestaciones;

                if (inputText && inputText.length > 2) {
                    if (this.lastCallSubscription) {
                        this.lastCallSubscription.unsubscribe();
                    }

                    this.lastCallSubscription = this.conceptosTurneables.search({ permisos, term: `^${inputText}` }).subscribe(result => {
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
