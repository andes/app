import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
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
    ) { }

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

    private askForNewToken(paciente, motivo: string, turno?: string, prestacion?: string, detalle?: string) {
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
                    motivo
                };

                let hudsTokenArray: any = window.sessionStorage.getItem('huds-token') || '[]';

                // TODO! Cuando se extienda el uso del token de esta manera en el resto de la app, READAPTAR ESTE BLOQUE DE CODIGO!!
                if (hudsTokenArray[0] === '[') {
                    hudsTokenArray = JSON.parse(hudsTokenArray);
                    hudsTokenArray.push(newElement);
                } else {
                    hudsTokenArray = [newElement];
                }
                window.sessionStorage.setItem('huds-token', JSON.stringify(hudsTokenArray));
            }),
            map(hudsToken => {
                return { paciente, token: hudsToken.token, motivo };
            })
        );
    }

    /** Obtiene listado de motivos de la BD y muestra modal para seleccionar motivo de acceso a HUDS */
    showMotivos(paciente: IPaciente) {
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
                return this.askForNewToken(paciente, textoMotivo, null, null, descripcionAcceso);
            })
        );
    }

    /** Recupera de la memoria de sesión un token de acceso a HUDS o solicita uno nuevo */
    getAccessoHUDS(paciente: IPaciente): Observable<any> {
        const newElement = {
            usuario: this.auth.usuario.id,
            paciente: paciente.id,
            organizacion: this.auth.organizacion.id
        };

        let hudsTokenArray: any = window.sessionStorage.getItem('huds-token') || '[]';
        let index = -1;

        // TODO! Cuando se extienda el uso del token de esta manera en el resto de la app, BORRAR ESTE IF y dejar solo su contenido!!
        if (hudsTokenArray[0] === '[') {
            hudsTokenArray = JSON.parse(hudsTokenArray);
            index = hudsTokenArray.findIndex((element: typeof newElement) => element.usuario === newElement.usuario && element.paciente === newElement.paciente && element.organizacion === newElement.organizacion);
        }

        if (index === -1) {
            return this.showMotivos(paciente);
        }

        const params = {
            token: hudsTokenArray[index].token
        };
        return this.hudsService.getTiempoRestante({ params }).pipe(
            switchMap(tiempoRestante => {
                if (tiempoRestante > 0) {
                    return of(hudsTokenArray[index]);
                    // return of({ paciente, token: hudsTokenArray[index].token, motivo: hudsTokenArray[index].motivo });
                } else {
                    hudsTokenArray.splice(index, 1);
                    window.sessionStorage.setItem('huds-token', JSON.stringify(hudsTokenArray));
                    return this.showMotivos(paciente);
                }
            })
        );
    }
}
