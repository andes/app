import { OnInit, Input, ViewContainerRef, Directive, OnDestroy } from '@angular/core';
import { PlexSelectComponent } from '@andes/plex/src/lib/select/select.component';
import { Subscription } from 'rxjs';
import { ProfesionalService } from '../services/profesional.service';

/**
 * Transforma un plex-select automaticamente en un buscador de Profesionales
 */

@Directive({
    selector: '[tmProfesionales]'
})

export class SelectProfesionalesDirective implements OnInit, OnDestroy {

    @Input() preload = false;

    private subscription: Subscription = null;
    private lastCallSubscription: Subscription = null;

    constructor(
        private profesionalesService: ProfesionalService,
        private plexSelect: PlexSelectComponent
    ) {
        plexSelect.idField = 'id';
        plexSelect.labelField = 'apellido + \' \' + nombre';
    }

    ngOnInit() {
        if (this.preload) {
            this.plexSelect.data = [];
            this.profesionalesService.get({}).subscribe(result => {
                this.plexSelect.data = result;
            });
        } else {
            this.subscription = this.plexSelect.getData.subscribe(($event) => {
                const inputText: string = $event.query;
                if (inputText && inputText.length > 2) {
                    if (this.lastCallSubscription) {
                        this.lastCallSubscription.unsubscribe();
                    }
                    this.lastCallSubscription = this.profesionalesService.get({ nombreCompleto: inputText, habilitado: true }).subscribe(result => {
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
