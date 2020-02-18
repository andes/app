import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../../../services/organizacion.service';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { DocumentosService } from '../../../../../../services/documentos.service';
import { Slug } from 'ng2-slugify';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-censo-diario',
    templateUrl: './censo-diario.component.html',
})

export class CensosDiariosComponent implements OnInit {
    private slug = new Slug('default');
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
        private servicioDocumentos: DocumentosService,
        private organizacionService: OrganizacionService
    ) { }

    ngOnInit() {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            let index;
            organizacion.unidadesOrganizativas.map(u => {
                index = this.unidadesOranizativas.findIndex(uo => uo.id === u.conceptId);
                if (index < 0) {
                    this.unidadesOranizativas.push({ 'id': u.id, 'nombre': u.term, 'term': u.term });
                }
            });
        });
    }

    generarCensoDiario() {
        this.censoPacientes = [];
        this.censo = {};

        this.mapaCamasService.censoDiario(moment(this.fecha).toDate(), this.selectedUnidadOranizativa.id)
            .subscribe((censoDiario: any) => {
                this.censo = {
                    existencia0: censoDiario.censo.existenciaALas0,
                    ingresos: censoDiario.censo.ingresos,
                    pasesDe: censoDiario.censo.pasesDe,
                    egresosAlta: censoDiario.censo.altas,
                    egresosDefuncion: censoDiario.censo.defunciones,
                    pasesA: censoDiario.censo.pasesA,
                    existencia24: censoDiario.censo.existenciaALas24,
                    ingresoEgresoDia: censoDiario.censo.ingresosYEgresos,
                    pacientesDia: censoDiario.censo.pacientesDia,
                    disponibles24: censoDiario.censo.disponibles,
                };
                Object.keys(censoDiario.pacientes).map(p => {
                    this.censoPacientes.push(censoDiario.pacientes[p]);
                });
            });
    }

    descargarCenso() {
        let params = {
            listadoCenso: (this.censoPacientes.length < 0) ? null : this.censoPacientes,
            resumenCenso: this.censo,
            organizacion: this.organizacion,
            fecha: moment(this.fecha).endOf('day'),
            unidad: this.selectedUnidadOranizativa
        };

        this.servicioDocumentos.descargarCenso(params).subscribe(data => {
            if (data) {
                this.descargarArchivo(data, { type: 'application/pdf' });
            } else {
                window.print();
            }
        });
    }

    private descargarArchivo(data: any, headers: any): void {
        let blob = new Blob([data], headers);
        let nombreArchivo = this.slug.slugify('CENSODIARIO' + '-' + moment().format('DD-MM-YYYY-hmmss')) + '.pdf';
        saveAs(blob, nombreArchivo);
    }


    resetCenso() {
        this.censo = null;
        this.censoPacientes = [];
    }
}
