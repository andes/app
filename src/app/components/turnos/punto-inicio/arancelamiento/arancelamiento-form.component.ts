import { Component, Input, OnInit, EventEmitter, Output, ViewEncapsulation, HostBinding, DebugElement } from '@angular/core';
import { Plex } from '@andes/plex';
import { EdadPipe } from './../../../../pipes/edad.pipe';
import { Auth } from '@andes/auth';
import { ObraSocialService } from './../../../../services/obraSocial.service';

@Component({
    selector: 'arancelamiento-form',
    templateUrl: 'arancelamiento-form.html',
    styleUrls: ['arancelamiento-form.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})


export class ArancelamientoFormComponent implements OnInit {

    turnoSeleccionado: any;
    efector = this.auth.organizacion.nombre;
    obraSocial: String;
    codigoOs: Number;
    showForm = false;
    idOrganizacion = this.auth.organizacion.id;

    @Input('turno')
    set turno(value: any) {
        this.turnoSeleccionado = value;
    }
    get turno(): any {
        return this.turnoSeleccionado;
    }

    @Output() volverAPuntoInicio: EventEmitter<any> = new EventEmitter<any>();
    @HostBinding('class.plex-layout') layout = true;

    constructor(public auth: Auth, public servicioOS: ObraSocialService, public plex: Plex) { }

    ngOnInit() {
        this.servicioOS.get({ dni: this.turnoSeleccionado.paciente.documento }).subscribe(resultado => {
            if (resultado && resultado.length) {
                this.obraSocial = resultado[0].financiador;
                this.codigoOs = resultado[0].codigoFinanciador;
            } else {
                this.obraSocial = '';
                this.codigoOs = 0;
            }

            this.showForm = true;
            setTimeout(() => {
                this.imprimir();
                this.volverAPuntoInicio.emit();
            }, 100);
        });
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
