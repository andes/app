import { Input, Component, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { RUPComponent } from 'src/app/modules/rup/components/core/rup.component';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';

@Component({
    selector: 'detalle-pedido',
    templateUrl: './detallePedido.html'
})

export class DetallePedidoComponent implements OnDestroy {
    @ViewChild('prescripcion') prescripcion: RUPComponent;
    turno;
    prestacion;
    itemsHistorial = [];
    registroPrincipal = null;
    elementoRUPPrincipal = null;
    private destroy$ = new Subject<void>();

    @Input('prestacion')
    set _prestacion(value) {
        this.prestacion = value;
        this.cargarDetalle();
    }

    constructor(
        private elementosRUPService: ElementosRUPService,
        private cd: ChangeDetectorRef
    ) { }


    cargarDetalle() {
        if (!this.prestacion) { return; }

        // Esperar a que el servicio esté listo y luego usarlo (una sola vez)
        this.elementosRUPService.ready.pipe(
            filter(v => !!v),
            take(1),
            takeUntil(this.destroy$)
        ).subscribe({
            next: () => {
                try {
                    this.registroPrincipal = this.prestacion.solicitud?.registros?.[0] || null;
                    if (!this.registroPrincipal) {
                        console.warn('DetallePedido: no hay registroPrincipal en la prestacion', this.prestacion);
                        this.elementoRUPPrincipal = null;
                        this.cd.detectChanges();
                        return;
                    }
                    this.elementoRUPPrincipal = this.elementosRUPService.buscarElemento(this.registroPrincipal.concepto, true);
                    // Forzar detección para que Angular renderice el <rup>
                    this.cd.detectChanges();
                } catch (err) {
                    console.error('DetallePedido: error al cargar elementoRUPPrincipal', err);
                }
            },
            error: (err) => console.error('DetallePedido: error en ready', err)
        });

    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}