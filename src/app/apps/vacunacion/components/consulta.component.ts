import { Component } from '@angular/core';
import { Plex } from '@andes/plex';
import { InscripcionService } from '../services/inscripcion.service';
import { captcha } from '../../../../environments/apiKeyMaps';

@Component({
    selector: 'consulta-vacunacion',
    templateUrl: './consulta.component.html'
})
export class ConsultaComponent {
    public sexo = 'femenino';
    public documento = null;
    public resultado = null;
    public opcionesSexo = [
        { id: 'femenino', label: 'Femenino' },
        { id: 'masculino', label: 'Masculino' }
    ];
    recaptcha: any = null;
    public captchaEnabled = true;

    constructor(
        private plex: Plex, private inscripcionVacunasService: InscripcionService
    ) {
        this.captchaEnabled = captcha.enabled;
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
            this.inscripcionVacunasService.search({ documento: this.documento, sexo: this.sexo, recaptcha: this.recaptcha }).subscribe(resultado => {
                this.resultado = resultado;
            });
            this.limpiarCaptcha();
        } else {
            this.plex.info('danger', 'Captcha no válido');
        }
    }

}
