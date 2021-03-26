import { Component, ViewChild, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { InscripcionService } from '../services/inscripcion.service';
import { captcha } from '../../../../environments/apiKeyMaps';

@Component({
    selector: 'consulta-vacunacion',
    templateUrl: './consulta.component.html'
})
export class ConsultaComponent implements OnInit {
    public sexo;
    public documento = null;
    public resultado = null;
    public opcionesSexo = [
        { id: 'femenino', label: 'Femenino' },
        { id: 'masculino', label: 'Masculino' }
    ];
    recaptcha: any = null;
    public captchaEnabled = true;

    @ViewChild('formulario', { static: true }) formulario;

    constructor(
        private plex: Plex, private inscripcionVacunasService: InscripcionService
    ) {
        this.captchaEnabled = captcha.enabled;
    }

    ngOnInit() {
        setTimeout(() => {
            document.querySelector('input').focus();
        }, 0);
    }

    seleccionarSexo($event) {
        this.sexo = $event.value;
        this.limpiarRespuesta();
    }

    limpiarRespuesta() {
        this.resultado = null;
    }

    limpiarCaptcha() {
        this.recaptcha = null;
    }

    buscar() {
        if (this.recaptcha || !this.captchaEnabled) {
            this.inscripcionVacunasService
                .search({ documento: this.documento, sexo: this.sexo, recaptcha: this.recaptcha })
                .subscribe(resultado => {
                    this.resultado = resultado;
                });
            this.limpiarCaptcha();
        } else {
            this.plex.info('danger', 'Captcha no válido');
        }
    }

    nuevaBusqueda() {
        // Limpia búsqueda
        this.resultado = null;
        this.sexo = null;
        this.documento = null;
        setTimeout(() => {
            // Limpia form
            this.formulario.reset({});
            // Foco en input de búsqueda
            document.querySelector('input').focus();
        }, 0);
    }

    get cardType() {
        // Ver que devuelva cosas que plex-card soporte (esta versión de plex no soporta 'info', se usa null en cambio)
        return this.resultado.status === 'fail' ? 'warning' : null;
    }

}
