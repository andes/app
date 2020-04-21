import { Component, OnInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { Slug } from 'ng2-slugify';
import { saveAs } from 'file-saver';
import { CamasService } from '../services/camas.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { DocumentosService } from '../../../../services/documentos.service';
import { InternacionService } from '../services/internacion.service';

@Component({
    templateUrl: 'censoMensual.html',
    styleUrls: ['censoMensual.scss']
})

export class CensoMensualComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    public parametros;
    public organizacion;
    public fechaDesde: any;
    public fechaHasta: any;
    public unidadOrganizativa;
    public resumenCensoTotal = [];
    public listaUnidadesOrganizativas = [];
    public promedioDiasEstadaV;
    public diasFuncionamientoV;
    public promedioDisponibleV;
    public pacienteDiaV;
    public mortalidadHospitalariaV;
    public promedioPermanenciaV;
    public giroV;
    public totalResumenCenso = {
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
        disponibles0: 0,
        diasEstada: 0,
        count: 0
    };

    private slug = new Slug('default');

    public paramsCensoDiario: any;

    constructor(private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public camasService: CamasService,
        private organizacionService: OrganizacionService,
        private servicioDocumentos: DocumentosService,
        private sanitizer: DomSanitizer,
        private servicioInternacion: InternacionService) { }

    ngOnInit() {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.listaUnidadesOrganizativas = this.organizacion.unidadesOrganizativas ? this.organizacion.unidadesOrganizativas : [];
        });
        this.fechaDesde = moment(new Date()).subtract(1, 'M').toDate();
        this.fechaHasta = new Date();
        this.resumenCensoTotal = null;
    }

    reseteaBusqueda() {
        this.resumenCensoTotal = null;
        this.totalResumenCenso = {
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
            disponibles0: 0,
            diasEstada: 0,
            count: 0
        };
    }


    generarCenso() {
        if (this.fechaDesde && this.fechaHasta && this.unidadOrganizativa) {
            if (this.fechaDesde <= this.fechaHasta) {
                this.parametros = {
                    fechaDesde: this.fechaDesde,
                    fechaHasta: this.fechaHasta,
                    unidad: this.unidadOrganizativa.conceptId,
                    organizacion: this.organizacion.id
                };
                this.servicioInternacion.getCensoMensual(this.parametros).subscribe((respuesta: any) => {
                    this.resumenCensoTotal = respuesta ? respuesta : [];
                    if (this.resumenCensoTotal) {
                        this.totalCenso();

                    }
                });
            } else {
                this.plex.info('danger', 'La fecha desde no puede ser mayor a la fecha hasta', 'Error');
            }

        }

        this.reseteaBusqueda();

    }


    totalCenso() {
        this.resumenCensoTotal.forEach(element => {
            this.totalResumenCenso.existencia0 += element.censo.existencia0;
            this.totalResumenCenso.ingresos += element.censo.ingresos;
            this.totalResumenCenso.pasesDe += element.censo.pasesDe;
            this.totalResumenCenso.egresosAlta += element.censo.egresosAlta;
            this.totalResumenCenso.egresosDefuncion += element.censo.egresosDefuncion;
            this.totalResumenCenso.pasesA += element.censo.pasesA;
            this.totalResumenCenso.existencia24 += element.censo.existencia24;
            this.totalResumenCenso.ingresoEgresoDia += element.censo.ingresoEgresoDia;
            this.totalResumenCenso.pacientesDia += element.censo.pacientesDia;
            this.totalResumenCenso.disponibles24 += element.censo.disponibles24;
            this.totalResumenCenso.diasEstada += element.censo.diasEstada;
            this.totalResumenCenso.count++;

        });
    }

    descargarCensoMensual() {
        let datosCensoTotal = {
            diasF: this.diasFuncionamientoV,
            promDis: this.promedioDisponibleV,
            pacDia: this.pacienteDiaV,
            mortHosp: this.mortalidadHospitalariaV,
            promPer: this.promedioPermanenciaV,
            giroCama: this.giroV,
            promDiasEstada: this.promedioDiasEstadaV
        };
        let params = {
            usuario: this.auth.usuario.nombreCompleto,
            listadoCenso: this.resumenCensoTotal,
            resumenCenso: this.totalResumenCenso,
            datosCenso: datosCensoTotal,
            organizacion: this.organizacion,
            fechaDesde: moment(this.fechaDesde).startOf('day'),
            fechaHasta: moment(this.fechaHasta).endOf('day'),
            unidad: this.unidadOrganizativa
        };

        this.servicioDocumentos.descargarCensoMensual(params).subscribe(data => {
            if (data) {
                // Generar descarga como PDF
                this.descargarArchivo(data, { type: 'application/pdf' });
            } else {
                // Fallback a impresión normal desde el navegador
                window.print();
            }
        });
    }

    private descargarArchivo(data: any, headers: any): void {
        let blob = new Blob([data], headers);
        let nombreArchivo = this.slug.slugify('CENSOMENSUAL' + '-' + moment().format('DD-MM-YYYY-hmmss')) + '.pdf';
        saveAs(blob, nombreArchivo);
    }

    /**
     * Vuelve a la página anterior (mapa de camas)
     */
    mapaDeCamas() {
        this.router.navigate(['/internacion/camas']);
    }

    diasFuncionamiento() {
        this.diasFuncionamientoV = this.totalResumenCenso.count.toFixed(2);
        return this.diasFuncionamientoV;
    }

    promedioDisponible() {
        if (this.totalResumenCenso.count !== 0) {
            this.promedioDisponibleV = this.totalResumenCenso.disponibles24 / this.totalResumenCenso.count;
            return this.promedioDisponibleV;
        } else {
            return 0;
        }
    }

    pacienteDia() {
        if (this.totalResumenCenso.count !== 0) {
            this.pacienteDiaV = Math.round(this.totalResumenCenso.pacientesDia / this.totalResumenCenso.count).toFixed(2);
            return this.pacienteDiaV;
        } else {
            return 0;
        }
    }

    mortalidadHospitalaria() {

        let total = this.totalResumenCenso.pasesA + this.totalResumenCenso.egresosAlta
            + this.totalResumenCenso.egresosDefuncion;
        this.mortalidadHospitalariaV = total === 0 ? 0 : (this.totalResumenCenso.egresosDefuncion / (total)).toFixed(2);
        return this.mortalidadHospitalariaV;
    }

    promedioPermanencia() {
        let total = this.totalResumenCenso.pasesA + this.totalResumenCenso.egresosAlta
            + this.totalResumenCenso.egresosDefuncion;
        this.promedioPermanenciaV = total === 0 ? 0 : (this.totalResumenCenso.pacientesDia / (total)).toFixed(2);
        return this.promedioPermanenciaV;
    }

    giro() {
        let total = this.totalResumenCenso.pasesA + this.totalResumenCenso.egresosAlta
            + this.totalResumenCenso.egresosDefuncion;
        let promedio = this.promedioDisponible();
        this.giroV = promedio === 0 ? 0 : (total / promedio).toFixed(2);
        return this.giroV;
    }

    promedioDiasEstada() {
        let totalEgreso = this.totalResumenCenso.egresosAlta + this.totalResumenCenso.egresosDefuncion;
        this.promedioDiasEstadaV = totalEgreso === 0 ? 0 : this.totalResumenCenso.diasEstada / totalEgreso;
        return this.promedioDiasEstadaV;
    }



}
