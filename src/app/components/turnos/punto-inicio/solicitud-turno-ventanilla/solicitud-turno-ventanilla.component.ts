import { Component, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';

@Component({
    selector: 'solicitud-turno-ventanilla',
    templateUrl: 'solicitud-turno-ventanilla.html'
})

export class SolicitudTurnoVentanillaComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    private _paciente: any;

    @Input('paciente')
    set paciente(value: any) {
        this._paciente = value;
    }
    get paciente(): any {
        return this._paciente;
    }

    @Input() tipoSolicitud: string;
    @Output() cerrarSolicitudVentanilla = new EventEmitter<boolean>();

    public permisos = [];
    public autorizado = false;
    public puedeAutocitar = false;
    prestacionDestino: any;
    prestacionOrigen: any;
    arrayReglasDestino = [];


    constructor(
        private auth: Auth,
        private router: Router) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        // Está autorizado para ver esta pantalla?
        if (!this.autorizado) {
            this.redirect('inicio');
        }
    }

    cancelar() {
        this.cerrarSolicitudVentanilla.emit(true);
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    returnForm() {
        this.cerrarSolicitudVentanilla.emit(true);
    }
}
