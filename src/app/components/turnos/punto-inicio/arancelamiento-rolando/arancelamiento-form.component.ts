import { Component, Input, OnInit, EventEmitter, Output, ViewEncapsulation, HostBinding, DebugElement } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { FacturacionAutomaticaService } from './../../../../services/facturacionAutomatica.service';
import { ObraSocialService } from './../../../../services/obraSocial.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { ProfesionalService } from '../../../../services/profesional.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IOrganizacion } from '../../../../interfaces/IOrganizacion';


@Component({
    selector: 'arancelamiento-form',
    templateUrl: 'arancelamiento-form.html',
    styleUrls: ['arancelamiento-form.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class ArancelamientoFormComponent implements OnInit {

    public organizacionDatos: IOrganizacion;
    turnoSeleccionado: any;
    efector = this.auth.organizacion.nombre;
    efectorCodigoSisa = this.organizacionService.getById(this.auth.organizacion.id);
    obraSocial: String;
    codigoOs: Number;
    numeroAfiliado: String;
    showForm = false;
    idOrganizacion = this.auth.organizacion.id;
    codigoNomenclador: string;

    fotoFirma: string;
    nombreFirma: string;
    aclaracion1Firma: string;
    aclaracion2Firma: string;
    aclaracion3Firma: string;
   // efectorcodigosisa = this.organizacionDatos.codigo.sisa;

    get muestraFirma() {
        return this.fotoFirma && this.fotoFirma.length > 0;
    }

    @Input('turno')
    set turno(value: any) {
        this.turnoSeleccionado = value;
    }
    get turno(): any {
        return this.turnoSeleccionado;
    }

    @Output() volverAPuntoInicio: EventEmitter<any> = new EventEmitter<any>();
    @HostBinding('class.plex-layout') layout = true;

    constructor(
        public auth: Auth,
        public servicioOS: ObraSocialService,
        public servicioFA: FacturacionAutomaticaService,
        public plex: Plex,
        public organizacionService: OrganizacionService,
        public profesionalService: ProfesionalService,
        public sanitizer: DomSanitizer) { }

    ngOnInit() {
        forkJoin([
            this.organizacionService.configuracion(this.auth.organizacion.id),
            this.profesionalService.getFirma({ id: this.turno.profesionales[0]._id }).pipe(catchError(() => of(null))),
            this.servicioFA.get({ idPrestacionTurneable: this.turnoSeleccionado.tipoPrestacion.conceptId })
        ]).subscribe((data) => {
            const [config, firma, resultadoFA] = data;

            if (config['arancelamiento.firma']) {
                this.fotoFirma = config['arancelamiento.firma'];
                this.nombreFirma = config['arancelamiento.nombre'];
                this.aclaracion1Firma = config['arancelamiento.aclaracion1'];
                this.aclaracion2Firma = config['arancelamiento.aclaracion2'];
                this.aclaracion3Firma = config['arancelamiento.aclaracion3'];

            }

            if (firma) {
                this.fotoFirma = `data:image/png;base64,${firma}`;
                this.nombreFirma = `${this.turno.profesionales[0].apellido} ${this.turno.profesionales[0].nombre}`;
                this.aclaracion1Firma = this.efector.substring(0, this.efector.indexOf('-'));
                this.aclaracion2Firma = '';
                this.aclaracion3Firma = '';
            }

            if (resultadoFA && resultadoFA.length > 0 && resultadoFA[0].recuperoFinanciero) {
                this.codigoNomenclador = resultadoFA[0].recuperoFinanciero.codigo;
            } else {
                this.codigoNomenclador = '';
            }

            if (this.turno.paciente.obraSocial) {
                this.obraSocial = this.turno.paciente.obraSocial.financiador;
                this.codigoOs = this.turno.paciente.obraSocial ? this.turno.paciente.obraSocial.codigoFinanciador : 0;
                this.numeroAfiliado = this.turno.paciente.obraSocial.numeroAfiliado ? this.turno.paciente.obraSocial.numeroAfiliado : '';
                this.showForm = true;
                setTimeout(() => {
                    this.imprimir();
                    this.volverAPuntoInicio.emit();
                }, 100);
            } else if (this.turnoSeleccionado.paciente.documento) {
                this.servicioOS.get({ dni: this.turnoSeleccionado.paciente.documento }).subscribe(resultado => {
                    if (resultado && resultado.length > 0) {
                        this.obraSocial = resultado[0].financiador;
                        this.codigoOs = resultado[0].codigoFinanciador;
                    } else {
                        this.obraSocial = null;
                        this.codigoOs = null;
                    }
                    this.showForm = true;
                    setTimeout(() => {
                        this.imprimir();
                        this.volverAPuntoInicio.emit();
                    }, 100);

                });
            }
        });
        // this.organizacionService.configuracion(this.auth.organizacion.id).subscribe((config) => {
        // });

        // this.profesionalService.getFirma({ id: this.turno.profesionales[0]._id }).subscribe((firma) => {
        // });

        // this.servicioFA.get({ conceptId: this.turnoSeleccionado.tipoPrestacion.conceptId }).subscribe(resultadoFA => {

        // });

    }

    getNroCarpeta() {
        if (this.turnoSeleccionado.paciente && this.turnoSeleccionado.paciente.carpetaEfectores && this.turnoSeleccionado.paciente.carpetaEfectores.length > 0) {
            let resultado: any = this.turnoSeleccionado.paciente.carpetaEfectores.filter((carpeta: any) => {
                return (carpeta.organizacion._id === this.idOrganizacion && carpeta.nroCarpeta !== null);
            });
            if (resultado && resultado.length) {
                return resultado[0].nroCarpeta;
            } else {
                return '';
            }

        } else {
            return null;
        }
    }

    cancelar() {
        this.volverAPuntoInicio.emit();
    }

    imprimir() {
        window.print();
    }
}
