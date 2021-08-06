import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DispositivoService } from 'src/app/services/dispositivo/dispositivo.service';
import { MapaCamasService } from '../../services/mapa-camas.service';

@Component({
    selector: 'app-seleccion-dispositivo',
    templateUrl: 'seleccion-dispositivo.html'
})
export class SeleccionDispositivoComponent implements OnInit {

    public respirador;
    public fechaDesde;
    public fechaIngreso;
    public dispositivo;
    public hoy = moment().toDate();
    public tipoDispositivos = [];

    @Output() selected = new EventEmitter<any>();

    constructor(
        private dispositivosService: DispositivoService,
        private mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() {
        this.dispositivosService.search({ activo: true }).subscribe(resultado => {
            this.tipoDispositivos = resultado;
        });
        this.mapaCamasService.resumenInternacion$.subscribe(resumen => {
            this.fechaIngreso = moment(resumen?.fechaIngreso).startOf('day').toDate();
        });
        this.mapaCamasService.camaSelectedSegunView$.subscribe(cama => {
            let ultimoRespirador = cama.respiradores?.length ? cama.respiradores[cama.respiradores.length - 1] : null;
            if (ultimoRespirador && !ultimoRespirador.fechaHasta) {
                // Si existe uno y todavía esta en uso
                this.respirador = { ...ultimoRespirador };
            }
        });
    }

    startOfday(fecha) {
        return moment(fecha).startOf('day').toDate();
    }

    endOfDay(fecha) {
        return moment(fecha).endOf('day').toDate();
    }

    accion(save = true) {
        let data;
        if (save) {
            if (this.respirador) {
                // se esta retirando un respirador
                data = this.respirador;
            } else {
                // nuevo respirador en uso
                data = {
                    dispositivo: this.dispositivo,
                    fechaDesde: this.fechaDesde
                };
            }
        }
        this.selected.emit(data);
    }
}
