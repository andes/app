import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ModalMotivoAccesoHudsComponent } from './modal-motivo-acceso-huds.component';
import { Auth } from '@andes/auth';
import { HUDSService } from '../../services/huds.service';
import { tap, switchMap, map } from 'rxjs/operators';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';


@Injectable({ providedIn: 'root' })
export class ModalMotivoAccesoHudsService {
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        private auth: Auth,
        private hudsService: HUDSService,
    ) {

    }

    private askForReason(): Observable<string> {
        return new Observable((observer) => {

            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ModalMotivoAccesoHudsComponent);
            const componentRef = componentFactory.create(this.injector);
            const modalComponent = componentRef.instance;
            modalComponent.show = true;

            const sub = modalComponent.motivoAccesoHuds.subscribe((motivo: string) => {
                observer.next(motivo);

                // Limpiamos componentes y memoría
                observer.complete();
                sub.unsubscribe();
                this.appRef.detachView(componentRef.hostView);
                componentRef.destroy();

            });

            // agregamos la vista al dom
            this.appRef.attachView(componentRef.hostView);
            const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
            document.body.appendChild(domElem);
        });
    }

    private hudsToken(paciente, motivo: string, turno?: string, prestacion?: string) {
        return this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, paciente, motivo, this.auth.profesional, turno, prestacion).pipe(
            tap((hudsToken) => {
                window.sessionStorage.setItem('huds-token', hudsToken.token);
            }),
            map(hudsToken => {
                return { paciente, token: hudsToken.token, motivo };
            })
        );
    }

    getAccessoHUDS(paciente: IPaciente) {
        return this.askForReason().pipe(
            switchMap(motivo => {
                if (!motivo) {
                    return throwError({ error: 'NO SE SELECCIONO MOTIVO' });
                }
                return this.hudsToken(paciente, motivo);
            })
        );
    }

}
