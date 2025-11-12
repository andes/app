import moment from 'moment';
import { Component, OnInit } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { switchMap, switchMapTo } from 'rxjs/operators';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';

@Component({
    selector: 'app-internacion-lista-espera',
    templateUrl: './lista-espera.component.html'
})
export class InternacionListaEsperaComponent implements OnInit {
    listaEspera$: Observable<any[]>;
    camasDisponibles$: Observable<any[]>;
    public internacionSelected = null;
    public camaSelected = null;

    get showSidebar() {
        return !!this.internacionSelected;
    }

    constructor(
        private mapaCamaService: MapaCamasService,
        private route: ActivatedRoute,
        private mapaCamasHTTP: MapaCamasHTTP
    ) { }

    ngOnInit() {
        this.getLista();
    }

    getLista() {
        this.listaEspera$ = this.route.params.pipe(
            switchMap((params) => {
                const ambito = params['ambito'];
                const capa = params['capa'];
                return this.mapaCamaService.listaEspera(ambito, capa);
            })
        );
    }

    fechaIngreso(prestacion) {
        return prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso;
    }

    onDarCama(item) {
        this.internacionSelected = item;
        this.camasDisponibles$ = this.route.params.pipe(
            switchMap((params: any) => {
                return this.mapaCamaService.snapshot(new Date(), null, params.ambito, params.capa, 'disponible');
            })
        );
    }

    moverCama() {
        if (this.camaSelected) {
            const fecha = moment().toDate();
            this.camaSelected.estado = 'ocupada';
            this.camaSelected.idInternacion = this.internacionSelected._id;
            this.camaSelected.paciente = this.internacionSelected.paciente;
            this.camaSelected.esMovimiento = true;

            this.route.params.pipe(
                switchMap((params: any) => {
                    return this.mapaCamasHTTP.updateEstados(params.ambito, params.capa, fecha, this.camaSelected);
                })
            ).subscribe(() => {
                this.camaSelected = null;
                this.internacionSelected = null;
                this.getLista();
            });
        }
    }
}
