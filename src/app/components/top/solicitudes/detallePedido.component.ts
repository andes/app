import { Input, Component, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { of, Subject } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';
import { RUPComponent } from 'src/app/modules/rup/components/core/rup.component';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';

@Component({
    selector: 'detalle-pedido',
    templateUrl: './detallePedido.html',
    styleUrls: ['./detallePedido.scss']
})

export class DetallePedidoComponent implements OnDestroy {
    @ViewChild('prescripcion') prescripcion: RUPComponent;
    turno;
    itemsHistorial = [];
    registroPrincipal = null;
    elementoRUPPrincipal = null;
    private destroy$ = new Subject<void>();
    private detalle$ = new Subject<void>();
    private _prestacion;

    @Input()
    set prestacion(value) {
        this._prestacion = value;
        this.cargarDetalle();
    }
    get prestacion() {
        return this._prestacion;
    }

    constructor(
        private elementosRUPService: ElementosRUPService,
        private prestacionesService: PrestacionesService,
        private cd: ChangeDetectorRef
    ) { }


    cargarDetalle() {
        this.detalle$.next();

        if (!this.prestacion) {
            this.desmontarRup();
            return;
        }

        this.desmontarRup();

        this.elementosRUPService.ready.pipe(
            filter(v => !!v),
            take(1),
            takeUntil(this.destroy$),
            takeUntil(this.detalle$)
        ).subscribe({
            next: () => {
                const registro = this.prestacion.solicitud?.registros?.[0] || null;
                if (!registro) {
                    console.warn('DetallePedido: no hay registroPrincipal en la prestacion', this.prestacion);
                    return;
                }
                this.aplicarRegistro(registro);

                const idSolicitud = this.prestacion.id || this.prestacion._id;
                const idOrigen = this.prestacion.solicitud?.prestacionOrigen;
                if (idSolicitud && idOrigen) {
                    this.prestacionesService.getDetalleSolicitud(idSolicitud, { showError: false }).pipe(
                        take(1),
                        takeUntil(this.destroy$),
                        takeUntil(this.detalle$)
                    ).subscribe({
                        next: (solicitudActualizada) => {
                            const registroActualizado = solicitudActualizada?.solicitud?.registros?.[0];
                            if (!registroActualizado || registroActualizado === this.registroPrincipal) {
                                return;
                            }
                            this.desmontarRup();
                            of(registroActualizado).pipe(
                                delay(1),
                                takeUntil(this.destroy$),
                                takeUntil(this.detalle$)
                            ).subscribe(registro => this.aplicarRegistro(registro));
                        },
                        error: () => { }
                    });
                }
            }
        });
    }

    private desmontarRup() {
        this.elementoRUPPrincipal = null;
        this.registroPrincipal = null;
        this.cd.detectChanges();
    }

    private aplicarRegistro(registro) {
        this.registroPrincipal = registro;
        this.elementoRUPPrincipal = this.elementosRUPService.buscarElemento(registro.concepto, true);
        this.cd.detectChanges();
    }

    ngOnDestroy() {
        this.detalle$.next();
        this.detalle$.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
