import { PlexSelectComponent } from '@andes/plex/src/lib/select/select.component';
import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
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
    @Input() ambito;

    private subscription: Subscription = null;
    private lastCallSubscription: Subscription = null;

    constructor(
        private conceptosTurneables: ConceptosTurneablesService,
        private plexSelect: PlexSelectComponent
    ) {
        this.plexSelect.idField = 'id';
        this.plexSelect.labelField = 'term';
    }

    ngOnInit() {
        if (this.preload) {
            this.plexSelect.data = [];
            const permisos = this.tmPrestaciones;
            const ambito = this.ambito;
            this.conceptosTurneables.getByPermisos(permisos, ambito).subscribe(result => {
                this.plexSelect.data = result;
            });
        } else {
            this.subscription = this.plexSelect.getData.subscribe(($event) => {
                const inputText: string = $event.query;
                const permisos = this.tmPrestaciones || undefined;
                const ambito = this.ambito;

                if (inputText && inputText.length > 2) {
                    if (this.lastCallSubscription) {
                        this.lastCallSubscription.unsubscribe();
                    }
                    this.lastCallSubscription = this.conceptosTurneables.search({ permisos, ambito, term: `^${inputText}` }).subscribe(result => {
                        $event.callback(result);
                    });

                } else {
                    const value = (this.plexSelect as any).value;
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
