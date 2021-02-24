import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { ICiudadano } from '../interfaces/ICiudadano';
import { Observable } from 'rxjs';

@Component({
    selector: 'inscripcion',
    templateUrl: './inscripcion.component.html'
})
export class InscripcionComponent {

    public resultado = null;
    public opcionesSexo = [
        { id: 'femenino', label: 'Femenino' },
        { id: 'masculino', label: 'Masculino' }
    ];
    recaptcha: any = null;
    public localidades$: Observable<any>;
    public localidades = [{ _id: 1, nombre: 'San Martin de los Andes' }, { _id: 2, nombre: 'Villa La Angostura' }]
    public ciudadano: ICiudadano = {
        id: null,
        fechaRegistro: null,
        documento: '',
        nombre: '',
        apellido: '',
        nroTramite: '',
        sexo: undefined,
        fechaNacimiento: null,
        cuil: null,
        localidad: '',
        telefono: '',
        estado: ''
    }

    constructor(
        private plex: Plex,
    ) {
        this.plex.updateTitle('VACUNACIÓN');
        //this.localidades$ = this.locationService.getLocalidades({ nombreProvincia: 'Neuquén' }).pipe(
        //    cache());
    }

    seleccionarSexo($event) {
        this.ciudadano.sexo = $event.value;
        this.limpiarRespuesta();
    }

    limpiarRespuesta() {
        this.resultado = null;
    }

    resolved(captchaResponse: any[]) {
        this.recaptcha = captchaResponse;
    }

    cancelar() { }

}
