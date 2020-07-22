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
                    this.unidadesOranizativas.push({
                        'id': u.conceptId,
                        'conceptId': u.conceptId,
                        'nombre': u.term,
                        'term': u.term
                    });
                }
            });
        });
    }

    generarCensoDiario() {
        this.censoPacientes = [];
        this.censo = {};

        this.mapaCamasService.censoDiario(moment(this.fecha).toDate(), this.selectedUnidadOranizativa.conceptId)
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
                    diasEstada: censoDiario.censo.diasEstada,
                    disponibles24: censoDiario.censo.disponibles,
                };

                Object.keys(censoDiario.pacientes).map(p => {
                    let delDiaAnterior = false;
                    let ingresoAServicio = false;
                    let censoPaciente = censoDiario.pacientes[p];
                    censoPaciente.actividad.forEach((actividad: any, index) => {
                        let movimiento = {
                            datos: censoPaciente.datos,
                            ingreso: actividad.ingreso,
                            paseDe: actividad.paseDe,
                            egreso: actividad.egreso,
                            paseA: actividad.paseA,
                            diasEstada: actividad.diasEstada
                        };
                        if (!movimiento.ingreso && !movimiento.paseDe && !movimiento.egreso && !movimiento.paseA) {
                            delDiaAnterior = true;
                            if (censoPaciente.actividad.length === 1) {
                                this.censoPacientes.push(movimiento);
                            }
                        } else {
                            if (movimiento.paseDe) {
                                ingresoAServicio = true;
                                this.censoPacientes.push(movimiento);
                            } else {
                                if (movimiento.paseA) {
                                    if (this.censoPacientes.length > 0 &&
                                        this.censoPacientes[this.censoPacientes.length - 1].datos.paciente.id === movimiento.datos.paciente.id) {
                                        this.censoPacientes[this.censoPacientes.length - 1].paseA = movimiento.paseA;
                                    } else {
                                        this.censoPacientes.push(movimiento);
                                    }
                                } else {
                                    this.censoPacientes.push(movimiento);
                                }
                            }

                        }
                    });
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
