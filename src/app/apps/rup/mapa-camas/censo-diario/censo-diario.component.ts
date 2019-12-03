import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { MapaCamasService } from '../mapa-camas.service';

@Component({
    selector: 'app-censo-diario',
    templateUrl: './censo-diario.component.html',
})

export class CensoDiarioComponent implements OnInit {
    fecha = moment().toDate();

    organizacion;
    unidadesOranizativas = [];
    selectedUnidadOranizativa;

    censo;
    censoPacientes = [];

    constructor(
        public auth: Auth,
        private router: Router,
        private mapaCamasService: MapaCamasService,
        private organizacionService: OrganizacionService
    ) { }

    ngOnInit() {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            let index;
            organizacion.unidadesOrganizativas.map(u => {
                index = this.unidadesOranizativas.findIndex(uo => uo.id === u.conceptId);
                if (index < 0) {
                    this.unidadesOranizativas.push({ 'id': u.id, 'nombre': u.term });
                }
            });
        });
    }

    generarCensoDiario() {
        this.mapaCamasService.censoDiario(moment(this.fecha).toDate(), this.selectedUnidadOranizativa.id)
            .subscribe((censoDiario: any) => {
                this.censo = censoDiario.censo;
                Object.keys(censoDiario.pacientes).map(p => {
                    this.censoPacientes.push(censoDiario.pacientes[p]);
                });
                console.log(this.censoPacientes);
            });
    }

    resetCenso() {
        this.censo = null;
        this.censoPacientes = [];
    }
}
