import { OnInit, Input, ViewContainerRef, Directive, OnDestroy } from '@angular/core';
import { OrganizacionService } from '../services/organizacion.service';
import { PlexSelectComponent } from '@andes/plex/src/lib/select/select.component';
import { Subscription } from 'rxjs';

/**
 * Transforma un plex-select automaticamente en un buscador de Organizaciones
 */

@Directive({
    selector: '[tmOrganizaciones]'
})

export class SelectOrganizacionDirective implements OnInit, OnDestroy {

    @Input() preload = false;

    private subscription: Subscription = null;
    private lastCallSubscription: Subscription = null;

    constructor(
        private organizacionService: OrganizacionService,
        private plexSelect: PlexSelectComponent
    ) {
        plexSelect.idField = 'id';
        plexSelect.labelField = 'nombre';
    }

    ngOnInit() {
        if (this.preload) {
            this.plexSelect.data = [];
            this.organizacionService.get({ fields: 'nombre' }).subscribe(result => {
                this.plexSelect.data = result;
            });
        } else {
            this.subscription = this.plexSelect.getData.subscribe(($event) => {
                const inputText: string = $event.query;
                if (inputText && inputText.length > 2) {
                    if (this.lastCallSubscription) {
                        this.lastCallSubscription.unsubscribe();
                    }
                    this.lastCallSubscription = this.organizacionService.get({ nombre: inputText, fields: 'nombre' }).subscribe(result => {
                        $event.callback(result);
                    });
                } else {
                    $event.callback([]);
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
