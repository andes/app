import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { ICiudadano } from '../interfaces/ICiudadano';
import { Observable } from 'rxjs';
import * as enumerados from '../../../utils/enumerados';
import { LocalidadService } from 'src/app/services/localidad.service';
import { cache } from '@andes/shared';
import { ProfesionService } from 'src/app/services/profesion.service';

@Component({
    selector: 'inscripcion',
    templateUrl: './inscripcion.component.html'
})
export class InscripcionComponent implements OnInit {

    public resultado = null;
    recaptcha: any = null;
    public localidades$: Observable<any>;
    public profesiones$: Observable<any>;

    public sexos: any[];
    public opcionesGrupos = [
        { id: 'mayores60', nombre: 'Mayores de 60' },
        { id: 'personal-salud', nombre: 'Personal de Salud' }
    ];
    public relacionLaboral = [
        { id: 'planta', label: 'Personal de planta' },
        { id: 'eventual', label: 'Personal con contrato eventual' },
        { id: 'terciarizado', label: 'Personal de empresas que brindan servicios terciarizados en ese establecimiento' },
        { id: 'locacion', label: 'Personal contratado por locación de servicios (monotributista, factura AFIP)' },
        { id: 'locacion', label: 'Personal autónomo que factura honorarios a través de colegios o instituciones similares' },
        { id: 'otros', label: 'Otros' },
    ];
    public ciudadano: ICiudadano = {
        id: null,
        fechaRegistro: null,
        documento: '',
        nombre: '',
        apellido: '',
        nroTramite: '',
        grupo: null,
        sexo: undefined,
        fechaNacimiento: null,
        localidad: '',
        telefono: '',
        email: '',
        estado: '',
        alergia: false,
        condicion: false,
        enfermedad: false,
        convaleciente: false,
        aislamiento: false,
        vacuna: false,
        plasma: false,
        mamar: false,
        embarazada: false,
        establecimiento: '',
        localidadEstablecimiento: '',
        relacion: '',
    };

    public relacion = null;

    constructor(
        private plex: Plex,
        private localidadService: LocalidadService,
        private profesionesService: ProfesionService
    ) {
        this.plex.updateTitle('VACUNACIÓN');
        this.localidades$ = this.localidadService.get({codigo: 15}).pipe(
            cache()
        );
        this.profesiones$ = this.profesionesService.get().pipe(
            cache()
        );
    }

    ngOnInit() {
        this.sexos = enumerados.getObjSexos();
    }

    limpiarRespuesta() {
        this.resultado = null;
    }

    resolved(captchaResponse: any[]) {
        this.recaptcha = captchaResponse;
    }

    cancelar() {
    }

    seleccionaGrupo() {
    }

    guardar() {
        // this.ciudadano.grupo = this.ciudadano.grupo.id;
    }

}

