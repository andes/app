import { Component, Input, OnInit, EventEmitter, Output, ViewEncapsulation, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { EdadPipe } from './../../../pipes/edad.pipe';
import { Auth } from '@andes/auth';
import { ObraSocialService } from './../../../services/obraSocial.service';

@Component({
    selector: 'arancelamiento-form',
    templateUrl: 'arancelamiento-form.html',
    styleUrls: ['arancelamiento-form.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})


export class ArancelamientoFormComponent implements OnInit {

    turnoSeleccionado: any;
    efector = this.auth.organizacion.nombre;
    obraSocial: string;
    codigoOs: string;
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
        this.servicioOS.get(this.turnoSeleccionado.paciente.documento).subscribe(resultado => {
            this.obraSocial = resultado.nombre;
            this.codigoOs = resultado.codigo;
            this.showForm = true;
        });
    }

    getNroCarpeta() {
        if (this.turnoSeleccionado.paciente && this.turnoSeleccionado.paciente.carpetaEfectores && this.turnoSeleccionado.paciente.carpetaEfectores.length > 0) {
            let resultado: any = this.turnoSeleccionado.paciente.carpetaEfectores.filter((carpeta: any) => {
                return (carpeta.organizacion._id === this.idOrganizacion && carpeta.nroCarpeta !== null);
            });
            return resultado[0].nroCarpeta;
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
