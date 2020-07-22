import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-procedimientoDeEnfermeria',
    templateUrl: 'procedimientoDeEnfermeria.html'
})
@RupElement('ProcedimientoDeEnfermeriaComponent')
export class ProcedimientoDeEnfermeriaComponent extends RUPComponent implements OnInit {

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                prestacionesRealizadas: {
                    banioAntitermico: false,
                    sondaNasogastrica: false,
                    viaPeriferica: false,
                    aspiracionSecreciones: false,
                    basiloscopia: false,
                    confeccionCarnet: false,
                    saludEscolar: false,
                    CLCF: false,
                    tomaMuestra: false,
                    dinamicaUterina: false,
                    electrocardiograma: false,
                    entregaLeche: false,
                    enemaEvacuante: false,
                    extraccionSuturas: false,
                    gestionInsumos: false,
                    impregnacion: false,
                    instilacionOcular: false,
                    lavajeGastrico: false,
                    monitoreoCardiaco: false,
                    nebulizaciones: false,
                    rcp: false,
                    recap: false,
                    rehidratacion: false,
                    vendaje: false,
                    virologo: false,
                    sondaVesical: false,
                    curacionSimple: false,
                    curacionCompleja: false,
                    curacionQuemadura: false
                },
                tiemposEmpleados: {
                    asistenciaPracticas: 0,
                    atencionDomiciliaria: 0,
                    charlaEducativa: 0,
                    derivaciones: 0,
                    atencionPrehospitalaria: 0,
                    contencionEmocional: 0
                }
            };
        }
    }
}
