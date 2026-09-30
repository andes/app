import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { PlexTextToolBar } from '@andes/plex';


@Component({
    selector: 'rup-historial',
    styleUrls: ['./historial.scss'],
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

    decodeHtml(html: string) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }
    ngOnInit() {

        const conceptId = this.registro?.concepto?.conceptId;

        this.isLoading = true;

        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                // No soy yo mismo
                if (this.registro !== data && this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });

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
