/* eslint-disable no-console */
import { Component, OnInit, Input } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { of } from 'rxjs';
import { PlexTextToolBar } from '@andes/plex';


@Component({
    selector: 'rup-historial',
    templateUrl: './historial.html'
})
@RupElement('HistorialComponent')
export class HistorialComponent extends RUPComponent implements OnInit {

    // Se usa por un bug en el quill-editor al ser cargado dinamicamente.
    afterInit = false;
    fullscreen = false;

    public qlToolbar: PlexTextToolBar[] = [{
        name: 'fullscreen',
        handler: () => {
            this.fullscreen = true;
        }
    }];

    public historial: any[] = [];
    public isLoading = false;
    public verHistorial = false;
    public fechaDesde = null;

    ngOnInit() {

        const conceptId = this.registro?.concepto?.conceptId;

        this.isLoading = true;

        if (!this.soloValores) {
            if (this.params.pacienteInternado && this.params.requiereFechaInicio) {

                this.internacionResumenHTTP.search({ paciente: this.paciente.id }).subscribe(resumen => {

                    if (resumen.length && resumen[resumen.length - 1].fechaIngreso) {
                        this.fechaDesde = new Date(resumen[resumen.length - 1].fechaIngreso);
                        this.prestacionesService.getRegistrosHuds(this.paciente.id, conceptId, this.fechaDesde).subscribe(prestaciones => {
                            this.isLoading = false;
                            // Ver si tomamos el ultimo valor..
                            if (prestaciones.length) {
                                this.historial = prestaciones;
                            }

                        });
                    }
                });
            }
        }
    }

}
