import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RupElement } from '.';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-solicitudPrestacionDefault',
    templateUrl: 'solicitudPrestacionDefault.html'
})
@RupElement('SolicitudPrestacionDefaultComponent')
export class SolicitudPrestacionDefaultComponent extends RUPComponent implements OnInit {
    public reglasMatch = [];
    public reglaSelected = null;
    public formulario = null;
    public profesionales = '';
    public organizaciones: any[] = [];
    public conceptoAsociado = null;
    public asociados: any[] = [];

    @ViewChild('selector') selector: ElementRef;

    data = {};

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                solicitudPrestacion: {}
            };
            this.registro.valor.solicitudPrestacion['autocitado'] = false;
            this.registro.valor.solicitudPrestacion['prestacionSolicitada'] = this.registro.concepto;
        }
        this.servicioReglas.get({
            organizacionOrigen: this.auth.organizacion.id,
            prestacionOrigen: this.prestacion?.solicitud?.tipoPrestacion.conceptId,
            prestacionDestino: this.registro.concepto?.conceptId
        }).subscribe(reglas => {
            this.reglasMatch = reglas;
            this.organizaciones = reglas.map(elem => {
                return {
                    id: elem.destino.organizacion.id,
                    nombre: elem.destino.organizacion.nombre
                };
            });

            if (this.organizaciones.length === 1) {
                this.registro.valor.solicitudPrestacion.organizacionDestino = this.organizaciones[0];
                this.onOrganizacionChange();
            }
        });

        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                if (this.registro !== data && this.registro.valor !== data.valor) {
                    this.registro.valor.solicitudPrestacion.indicaciones = data.valor;
                    this.emitChange(false);
                }
            });

        }
        this.ejecucionService?.hasActualizacion().subscribe(async (estado) => {
            const registros = this.ejecucionService.getPrestacionRegistro();
            this.actualizarRelaciones(registros, estado);
        });

    }

    onOrganizacionChange() {
        const org = this.registro.valor.solicitudPrestacion.organizacionDestino;
        if (org) {
            this.reglaSelected = this.reglasMatch.find(r => r.destino.organizacion.id === org.id);

            if (this.reglaSelected) {
                this.reglaSelected.destino.informe = this.reglaSelected.destino.informe || 'none';

                if (this.reglaSelected.destino.informe === 'required') {
                    this.registro.valor.solicitudPrestacion.informe = true;
                }

                this.registro.valor.solicitudPrestacion.reglaID = this.reglaSelected.id;
                if (this.reglaSelected.destino.formulario) {
                    this.registro.valor.template = this.reglaSelected.destino.formulario;
                }
            }
        }
    }

    isEmpty() {
        const value = this.registro.valor.solicitudPrestacion;
        return !value.motivo && !value.indicaciones && !value.organizacionDestino;
    }

    actualizarRelaciones(registros, estado: string) {
        const conceptos = this.elementosRUPService.cacheDiagnosticosSolicitudes.map(concepto => concepto.conceptId);
        this.asociados = registros?.filter((registro) => conceptos.includes(registro.concepto.conceptId)) || [];
        this.conceptoAsociado = this.asociados.find(elem => elem.concepto.conceptId === this.registro.valor.solicitudPrestacion['conceptoAsociado']?.conceptId);

        if (estado === 'eliminar') {
            const existe = this.asociados?.find((elem) => elem.conceptId === this.conceptoAsociado.conceptId);

            if (!existe) {
                this.conceptoAsociado = null;
            }
        }
    }

    selectAsociado(event) {
        this.registro.valor.solicitudPrestacion['conceptoAsociado'] = this.conceptoAsociado?.concepto || null;
    }
}
