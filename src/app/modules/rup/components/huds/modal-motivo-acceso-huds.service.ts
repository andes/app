import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ModalMotivoAccesoHudsComponent } from './modal-motivo-acceso-huds.component';
import { Auth } from '@andes/auth';
import { HUDSService } from '../../services/huds.service';
import { tap, switchMap, map } from 'rxjs/operators';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { IMotivoAcceso } from '../../interfaces/IMotivoAcceso';


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

    private askForReason(): Observable<IMotivoAcceso> {
        return new Observable((observer) => {
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ModalMotivoAccesoHudsComponent);
            const componentRef = componentFactory.create(this.injector);
            const modalComponent = componentRef.instance;
            modalComponent.show = true;

            const sub = modalComponent.motivoAccesoHuds.subscribe((motivo: IMotivoAcceso) => {
                observer.next(motivo);
                observer.complete();
            });

            // agregamos la vista al dom
            this.appRef.attachView(componentRef.hostView);
            const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
            document.body.appendChild(domElem);

            return () => {
                sub.unsubscribe();
                this.appRef.detachView(componentRef.hostView);
                componentRef.destroy();
            };
        });
    }

    private hudsToken(paciente, motivo: string, turno?: string, prestacion?: string, detalle?: string) {
        const paramsToken = {
            usuario: this.auth.usuario,
            organizacion: this.auth.organizacion,
            paciente: paciente,
            motivo: motivo,
            profesional: this.auth.profesional,
            idTurno: turno,
            idPrestacion: prestacion,
            detalleMotivo: detalle
        };
        return this.hudsService.generateHudsToken(paramsToken).pipe(
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
            switchMap(motivoAcceso => {
                let textoMotivo = '';
                let descripcionAcceso;
                if (!motivoAcceso) {
                    return throwError({ error: 'NO SE SELECCIONO MOTIVO' });
                }
                if (typeof motivoAcceso === 'object') {
                    textoMotivo = motivoAcceso.motivo ? motivoAcceso.motivo : '';
                    descripcionAcceso = motivoAcceso.textoObservacion ? motivoAcceso.textoObservacion : null;
                }
                return this.hudsToken(paciente, textoMotivo, null, null, descripcionAcceso);
            })
        );
    }

}
