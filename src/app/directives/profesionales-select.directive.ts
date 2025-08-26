import { OnInit, Input, ViewContainerRef, Directive, OnDestroy } from '@angular/core';
import { PlexSelectComponent } from '@andes/plex';
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
        plexSelect.labelField = 'apellido + \' \' + nombre + \' - \' + documento + \' - \' + ultimaMatricula';
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
                        result.forEach(prof => {
                            // Buscamos la matrícula mas reciente
                            let fechaMasReciente = prof.formacionGrado[0]?.fechaDeInscripcion;
                            let index = 0;
                            for (let i = 1; i < prof.formacionGrado.length; i++) {
                                if (prof.formacionGrado[i].fechaDeInscripcion > fechaMasReciente) {
                                    fechaMasReciente = prof.formacionGrado[i].fechaDeInscripcion;
                                    index = i;
                                }
                            }
                            const ultimaMatricula = prof.formacionGrado[index]?.titulo;
                            prof['ultimaMatricula'] = ultimaMatricula ? ultimaMatricula : 'Sin matrícula';
                        });
                        $event.callback(result);
                    });
                } else if (inputText.length === 0 && !(this.plexSelect as any).value?.length) {
                    $event.callback([]);
                } else {
                    $event.callback((this.plexSelect as any).value);
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
