import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ChangeDetectorRef } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
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
                observer.complete();
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
                const newElement = {
                    usuario: this.auth.usuario.id,
                    paciente: paciente.id,
                    organizacion: this.auth.organizacion.id,
                    token: hudsToken.token,
                    motivo: motivo
                };
                const hudsTokenArray = JSON.parse(window.sessionStorage.getItem('huds-token') || '[]');
                const index = hudsTokenArray.findIndex((element: any) => element.usuario === newElement.usuario && element.paciente === newElement.paciente && element.organizacion === newElement.organizacion);
                if (index !== -1) {
                    hudsTokenArray[index] = newElement;
                } else {
                    hudsTokenArray.push(newElement);
                }
                window.sessionStorage.setItem('huds-token', JSON.stringify(hudsTokenArray));
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
    getAccessoHUDSArray(paciente: IPaciente): Observable<any> {
        const newElement = {
            usuario: this.auth.usuario.id,
            paciente: paciente.id,
            organizacion: this.auth.organizacion.id
        };
        const hudsTokenArray = JSON.parse(window.sessionStorage.getItem('huds-token') || '[]');
        const index = hudsTokenArray.findIndex((element: any) => element.usuario === newElement.usuario && element.paciente === newElement.paciente && element.organizacion === newElement.organizacion);

        if (index === -1) {
            return this.getAccessoHUDS(paciente);
        }

        const params = {
            token: hudsTokenArray[index].token
        };
        return this.hudsService.getTiempoRestante({ params }).pipe(
            map(data => {
                return data;
            }),
            switchMap(tiempoRestante => {
                if (tiempoRestante > 0) {
                    return of({ paciente, token: hudsTokenArray[index].token, motivo: hudsTokenArray[index].motivo });
                } else {
                    hudsTokenArray.splice(index, 1);
                    window.sessionStorage.setItem('huds-token', JSON.stringify(hudsTokenArray));
                    return this.getAccessoHUDS(paciente);
                }
            })
        );
    }
}
