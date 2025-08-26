import { PlexSelectComponent } from '@andes/plex';
import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ServicioIntermedioService } from '../modules/rup/services/servicio-intermedio.service';

/**
 * Transforma un plex-select automaticamente en un buscador de Profesionales
 */

@Directive({
    selector: '[tmServicioIntermedio]'
})

export class ServicioIntermedioDirective implements OnInit, OnDestroy {

    @Input() preload = true;

    private subscription: Subscription = null;
    private lastCallSubscription: Subscription = null;

    constructor(
        private servicioIntermedioService: ServicioIntermedioService,
        private plexSelect: PlexSelectComponent
    ) {
        plexSelect.idField = 'id';
        plexSelect.labelField = 'nombre';
    }

    ngOnInit() {
        if (this.preload) {
            this.plexSelect.data = [];
            this.servicioIntermedioService.getAll().subscribe(result => {
                this.plexSelect.data = result;
            });
        } else {
            this.subscription = this.plexSelect.getData.subscribe(($event) => {
                const inputText: string = $event.query;
                if (inputText && inputText.length > 2) {
                    if (this.lastCallSubscription) {
                        this.lastCallSubscription.unsubscribe();
                    }
                    this.lastCallSubscription = this.servicioIntermedioService.search().subscribe(result => {
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
