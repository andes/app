import { Component, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../../../services/organizacion.service';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { DocumentosService } from '../../../../../../services/documentos.service';
import { Location } from '@angular/common';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-censo-mensual',
    templateUrl: './censo-mensual.component.html',
})

export class CensosMensualesComponent implements OnInit {

    fechaDesde = moment().subtract(1, 'months').toDate();
    fechaHasta = moment().toDate();

    organizacion;
    unidadesOranizativas = [];
    selectedUnidadOranizativa;
    public requestInProgress: boolean;
    public inicio = true;
    public esVacio = false;

    censo = [];
    datosCensoTotal = {
        diasF: '0',
        promDis: '0',
        pacDia: '0',
        mortHosp: '0',
        promPer: '0',
        giroCama: '0',
        promDiasEstada: '0',
        porcentajeCamasOcupadas: '0'
    };
    totales = {
        existencia0: 0,
        ingresos: 0,
        pasesDe: 0,
        egresosAlta: 0,
        egresosDefuncion: 0,
        pasesA: 0,
        existencia24: 0,
        ingresoEgresoDia: 0,
        pacientesDia: 0,
        disponibles24: 0,
        diasEstada: 0
    };

    constructor(
        public auth: Auth,
        private mapaCamasService: MapaCamasService,
        private organizacionService: OrganizacionService,
        private servicioDocumentos: DocumentosService,
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
                    this.unidadesOranizativas.push(u);
                }
            });
        });
    }

    generarCensoMensual() {
        this.totales = {
            existencia0: 0,
            ingresos: 0,
            pasesDe: 0,
            egresosAlta: 0,
            egresosDefuncion: 0,
            pasesA: 0,
            existencia24: 0,
            ingresoEgresoDia: 0,
            pacientesDia: 0,
            disponibles24: 0,
            diasEstada: 0
        };
        this.datosCensoTotal = {
            diasF: '0',
            promDis: '0',
            pacDia: '0',
            mortHosp: '0',
            promPer: '0',
            giroCama: '0',
            promDiasEstada: '0',
            porcentajeCamasOcupadas: '0'
        };
        this.censo = [];
        this.mapaCamasService.censoMensual(moment(this.fechaDesde).toDate(), moment(this.fechaHasta).toDate(), this.selectedUnidadOranizativa.conceptId)
            .subscribe((censoMensual: any) => {
                censoMensual.map(c => {
                    this.totales['existencia0'] += c.censo.existenciaALas0;
                    this.totales['ingresos'] += c.censo.ingresos;
                    this.totales['pasesDe'] += c.censo.pasesDe;
                    this.totales['egresosAlta'] += c.censo.altas;
                    this.totales['egresosDefuncion'] += c.censo.defunciones;
                    this.totales['pasesA'] += c.censo.pasesA;
                    this.totales['existencia24'] += c.censo.existenciaALas24;
                    this.totales['ingresoEgresoDia'] += c.censo.ingresosYEgresos;
                    this.totales['pacientesDia'] += c.censo.pacientesDia;
                    this.totales['disponibles24'] += c.censo.disponibles;
                    this.totales['diasEstada'] += c.censo.diasEstada;

                    this.censo.push({
                        censo: {
                            existencia0: c.censo.existenciaALas0,
                            ingresos: c.censo.ingresos,
                            pasesDe: c.censo.pasesDe,
                            egresosAlta: c.censo.altas,
                            egresosDefuncion: c.censo.defunciones,
                            pasesA: c.censo.pasesA,
                            existencia24: c.censo.existenciaALas24,
                            ingresoEgresoDia: c.censo.ingresosYEgresos,
                            pacientesDia: c.censo.pacientesDia,
                            disponibles24: c.censo.disponibles,
                            diasEstada: c.censo.diasEstada
                        },
                        fecha: c.fecha
                    });
                });
                this.calcularDatosCensoTotal();
                this.inicio = false;
                if (this.censo.length === 0) {
                    this.esVacio = true;
                }
            });
    }

    descargarCensoMensual() {
        const params = {
            usuario: this.auth.usuario.nombreCompleto,
            listadoCenso: this.censo,
            resumenCenso: this.totales,
            datosCenso: this.datosCensoTotal,
            organizacion: this.organizacion,
            fechaDesde: moment(this.fechaDesde).startOf('day'),
            fechaHasta: moment(this.fechaHasta).endOf('day'),
            unidad: this.selectedUnidadOranizativa
        };

        this.requestInProgress = true;
        this.servicioDocumentos.descargarCensoMensual(params, 'CENSOMENSUAL').subscribe(
            () => this.requestInProgress = false,
            () => this.requestInProgress = false
        );
    }

    descargarCsv() {
        this.servicioDocumentos.descargarCensoCsv({
            tipo: 'mensual',
            fechaDesde: moment(this.fechaDesde).toDate(),
            fechaHasta: moment(this.fechaHasta).toDate(),
            unidadOrganizativa: this.selectedUnidadOranizativa.conceptId
        }, 'CENSOMENSUAL'
        ).subscribe(() => {
            this.plex.toast('success', 'Descarga exitosa');
        }, error => {
            this.plex.toast('danger', 'Descarga fallida');
        });
    }

    resetCenso() {
        this.censo = [];
        this.esVacio = false;
    }

    calcularDatosCensoTotal() {
        this.datosCensoTotal['diasF'] = this.censo.length.toFixed(2);

        const promDis: any = (this.censo.length > 0) ? (this.totales.disponibles24 / this.censo.length).toFixed(2) : '0';
        this.datosCensoTotal['promDis'] = promDis;

        const pacienteDia = (this.censo.length > 0) ? Math.round(this.totales.pacientesDia / this.censo.length).toFixed(2) : '0';
        this.datosCensoTotal['pacDia'] = pacienteDia;

        const totalEgresos = this.totales.pasesA + this.totales.egresosAlta + this.totales.egresosDefuncion;
        const mortalidadHospitalaria = (totalEgresos > 0) ? (this.totales.egresosDefuncion / totalEgresos).toFixed(2) : '0';
        this.datosCensoTotal['mortHosp'] = mortalidadHospitalaria;

        const promedioPermanencia = (totalEgresos > 0) ? (this.totales.pacientesDia / totalEgresos).toFixed(2) : '0';
        this.datosCensoTotal['promPer'] = promedioPermanencia;

        const giroCama = (promDis > 0) ? (totalEgresos / promDis).toFixed(2) : '0';
        this.datosCensoTotal['giroCama'] = giroCama;

        const totalEgreso = this.totales.egresosAlta + this.totales.egresosDefuncion;
        this.datosCensoTotal['promDiasEstada'] = (totalEgreso === 0) ? '0' : (this.totales.diasEstada / totalEgreso).toFixed(2);

        this.datosCensoTotal['porcentajeCamasOcupadas'] = (this.censo.length && this.totales.pacientesDia > 0) ? ((this.totales.pacientesDia / this.totales.disponibles24) * 100).toFixed(2) : '0';
    }

    volver() {
        this.location.back();
    }
}
