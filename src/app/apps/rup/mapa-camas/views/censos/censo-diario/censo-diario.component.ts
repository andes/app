import { Component, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../../../services/organizacion.service';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { DocumentosService } from '../../../../../../services/documentos.service';
import { Location } from '@angular/common';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-censo-diario',
    templateUrl: './censo-diario.component.html',
})

export class CensosDiariosComponent implements OnInit {
    fecha = moment().toDate();

    organizacion;
    unidadesOranizativas = [];
    selectedUnidadOranizativa;
    public requestInProgress: boolean;

    censo;
    censoPacientes = [];

    constructor(
        public auth: Auth,
        private mapaCamasService: MapaCamasService,
        private servicioDocumentos: DocumentosService,
        private organizacionService: OrganizacionService,
        private location: Location,
        private plex: Plex
    ) { }

    ngOnInit() {
        this.getOrganizacion();
    }

    getOrganizacion() {
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
                    const censoPaciente = censoDiario.pacientes[p];
                    censoPaciente.actividad.forEach((actividad: any, index) => {
                        const movimiento = {
                            datos: censoPaciente.datos,
                            ingreso: actividad.ingreso,
                            fechaIngreso: actividad.fechaIngreso,
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

    descargarCsv() {
        this.servicioDocumentos.descargarCensoCsv({
            tipo: 'diario',
            fecha: this.fecha,
            unidadOrganizativa: this.selectedUnidadOranizativa.conceptId
        },
        'CENSODIARIO'
        ).subscribe(() => {
            this.plex.toast('success', 'Descarga exitosa');
        }, error => {
            this.plex.toast('danger', 'Descarga fallida');
        });
    }

    descargarCenso() {
        const params = {
            listadoCenso: (this.censoPacientes.length < 0) ? null : this.censoPacientes,
            resumenCenso: this.censo,
            organizacion: this.organizacion,
            fecha: moment(this.fecha).endOf('day'),
            unidad: this.selectedUnidadOranizativa
        };
        this.requestInProgress = true;
        this.servicioDocumentos.descargarCenso(params, 'CENSODIARIO').subscribe(
            () => this.requestInProgress = false,
            () => this.requestInProgress = false
        );
    }

    resetCenso() {
        this.censo = null;
        this.censoPacientes = [];
    }

    volver() {
        this.location.back();
    }
}
