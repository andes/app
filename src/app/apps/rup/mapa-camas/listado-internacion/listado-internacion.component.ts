import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { snomedIngreso, snomedEgreso } from '../constantes-internacion';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import * as enumerados from '../../../../utils/enumerados';
import { MapaCamasService } from '../mapa-camas.service';
import { DocumentosService } from '../../../../services/documentos.service';
import { saveAs } from 'file-saver';
import { Slug } from 'ng2-slugify';

@Component({
    selector: 'app-internacion-listado',
    templateUrl: './listado-internacion.component.html',
})

export class InternacionListadoComponent implements OnInit {
    private slug = new Slug('default'); // para documento csv


    // VARIABLES
    public ambito = 'internacion';
    public capa = 'estadistica';
    public mostrar = 'datosInternacion';
    public listaInternacion;
    public listaInternacionAux;
    public estadosInternacion;
    public permisoDescarga = false;
    public selectedInternacion;
    public cambiarUO = false;
    public camasDisponibles;
    public cama;

    public filtros = {
        documento: null,
        apellido: null,
        fechaIngresoDesde: moment().subtract(1, 'months').toDate(),
        fechaIngresoHasta: moment().toDate(),
        estados: null,
        organizacion: this.auth.organizacion.id,
        conceptId: PrestacionesService.InternacionPrestacion.conceptId,
        ordenFecha: true
    };

    constructor(
        private auth: Auth,
        private plex: Plex,
        private location: Location,
        private prestacionService: PrestacionesService,
        private mapaCamasService: MapaCamasService,
        private servicioDocumentos: DocumentosService
    ) { }

    ngOnInit() {
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Internacion'
        }, {
            name: 'Listado de Internacion'
        }]);
        this.estadosInternacion = enumerados.getObjEstadoInternacion();
        this.getPrestaciones();
        this.mapaCamasService.setCapa('estadistica');
        this.permisoDescarga = this.auth.check('internacion:descargarListado');
    }

    getPrestaciones() {
        if (this.filtros.estados) {
            this.filtros['estadoString'] = this.filtros.estados.id;
        } else {
            this.filtros['estadoString'] = '';
        }
        this.prestacionService.get(this.filtros).subscribe(prestaciones => {
            this.listaInternacion = prestaciones;
            this.listaInternacionAux = prestaciones;
            this.filtrar();
        });
    }

    filtrar() {
        this.listaInternacion = this.listaInternacionAux;

        if (this.filtros.documento) {
            this.listaInternacion = this.listaInternacion.filter(internacion => internacion.paciente.documento.includes(this.filtros.documento));
        }

        if (this.filtros.apellido) {
            this.listaInternacion = this.listaInternacion.filter(internacion => internacion.paciente.apellido.toLowerCase().includes(this.filtros.apellido.toLowerCase()));
        }

        if (this.filtros.estados) {
            this.listaInternacion = this.listaInternacion.filter(internacion => internacion.estados[internacion.estados.length - 1].tipo.toLowerCase().includes(this.filtros.estados.nombre.toLowerCase()));
        }
    }


    devuelveFecha(internacion, tipo) {
        let informe = this.verRegistro(internacion, tipo);
        if (tipo === 'ingreso') {
            return informe.informeIngreso.fechaIngreso;
        } else {
            return informe ? informe.InformeEgreso.fechaEgreso : null;

        }
    }

    verRegistro(prestacion, tipoRegistro) {
        let registro = null;
        if (tipoRegistro === 'ingreso') {
            registro = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === snomedIngreso.conceptId);
        }
        if (tipoRegistro === 'egreso') {
            registro = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === snomedEgreso.conceptId);
        }

        if (registro) {
            return registro.valor;
        }
        return null;
    }

    seleccionarInternacion(internacion) {
        if (this.selectedInternacion && this.selectedInternacion._id === internacion._id) {
            this.selectedInternacion = null;
        } else {
            this.selectedInternacion = Object.assign({}, internacion);
        }
    }

    reporteInternaciones() {
        this.servicioDocumentos.descargarReporteInternaciones({ filtros: this.filtros, organizacion: this.auth.organizacion.id }).subscribe(data => {
            let blob = new Blob([data], { type: data.type });
            saveAs(blob, this.slug.slugify('Internaciones' + ' ' + moment().format('DD-MM-YYYY-hmmss')) + '.xlsx');
        });
    }

    cancelar() {
        this.selectedInternacion = null;
    }

    volver() {
        this.location.back();
    }

    cambiarCama() {
        this.mostrar = 'desocuparCama';
    }

    volverADetalle() {
        this.mostrar = 'datosInternacion';
    }

    accionDesocupar(accion) {
        this.mostrar = 'cambiarCama';
        this.cambiarUO = accion.cambiarUO;
        this.camasDisponibles = accion.camasDisponibles;
        this.cama = accion.cama;
    }
}
