import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../../services/mapa-camas.service';

@Component({
    selector: 'app-filtros-camas',
    templateUrl: './filtros-camas.component.html',
})

export class FiltrosCamasComponent implements OnInit {
    @Input() unidadesOrganizativas: any;
    @Input() sectores: any;
    @Input() tiposCama: any;
    @Output() filtrarTabla = new EventEmitter<any>();

    filtro: any = {};
    censables = [
        { id: 0, nombre: 'No censable' },
        { id: 1, nombre: 'Censable' }
    ];

    constructor(
        public auth: Auth,
        private router: Router,
        public mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() {

    }

    filtrar() {
        this.mapaCamasService.unidadOrganizativaSelected.next(this.filtro.unidadOrganizativa);
        this.mapaCamasService.sectorSelected.next(this.filtro.sector);
        this.mapaCamasService.tipoCamaSelected.next(this.filtro.tipoCama);
        this.mapaCamasService.esCensable.next(this.filtro.censable);
        this.mapaCamasService.pacienteText.next(this.filtro.paciente);
    }
}
