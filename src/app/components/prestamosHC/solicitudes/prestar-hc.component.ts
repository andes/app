import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PrestamosService } from '../../../services/prestamosHC/prestamos-hc.service';

@Component({
    selector: 'app-prestar-hc',
    templateUrl: './prestar-hc.component.html'
})

export class PrestarHcComponent implements OnInit {
    private _carpeta: any;
    prestamo: any;

    // @Output() listaCarpetaEmit: EventEmitter<any> = new EventEmitter<any>();

    @Input('prestar')
    set prestar(value: any) {
        this.prestamo = value;
        debugger;
        if (value && value.datosPrestamo && value.datosPrestamo.turno.profesionales) {
            
            if (value.datosPrestamo.turno.espacioFisico) {
                this.prestarHC.destino = value.datosPrestamo.turno.espacioFisico.nombre;
            }

            this.prestarHC.responsable = '';
            value.datosPrestamo.turno.profesionales.forEach(profesional => {
                this.prestarHC.responsable +=  profesional.apellido + ', ' + profesional.nombre + ' - ';    
            });
            this.prestarHC.responsable = this.prestarHC.responsable.substring(0, this.prestarHC.responsable.length - 3);
        }
    }

    get prestar(): any {
        return this._carpeta;
    }

    prestarHC: any = {
        destino: '',
        responsable: '',
        observacionesPrestamo: ''
    }

    ngOnInit() {

    }

    save(event) {
        event.idAgenda = this.prestamo.datosPrestamo.agendaId.id;
        event.idTurno = this.prestamo.datosPrestamo.turno.id;
        event.tipoPrestacion = this.prestamo.datosPrestamo.turno.tipoPrestaciones;
        event.profesional = this.prestamo.datosPrestamo.turno.profesionales;
        event.espacioFisico = this.prestamo.datosPrestamo.turno.espacioFisico;
        
        this.prestamosService.prestarCarpeta(event).subscribe(carpeta => {
            this._carpeta = carpeta;
            // this.listarComponent.getCarpetas('',{})
        });
    }

    cancel() {

    }

    constructor(public prestamosService: PrestamosService) {

    }
}
