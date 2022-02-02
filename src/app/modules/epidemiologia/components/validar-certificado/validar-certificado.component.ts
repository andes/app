import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { getObjSexos } from '../../../../utils/enumerados';
import { ValidarCertificadoService } from '../../services/validar-certificado.service';


@Component({
    selector: 'app-validar-certificado',
    templateUrl: './validar-certificado.component.html'
})

export class ValidarCertificadoComponent implements OnInit {

    public sexos = [];
    public paciente: any = {
        documento: '',
        sexo: '',
        recaptcha: ''
    };
    public fechaValidacion = null;
    public recaptcha = null;
    constructor(
        private validarCertificadoService: ValidarCertificadoService,
        private plex: Plex
    ) { }

    ngOnInit(): void {
        this.sexos = getObjSexos();
    }

    resolved(captchaResponse) {
        this.recaptcha = captchaResponse;
        this.paciente.recaptcha = this.recaptcha;
    }

    validarCertificado() {
        const params = {
            fechaValidacion: this.fechaValidacion,
            documento: this.paciente.documento,
            sexo: this.paciente.sexo.id
        };
        this.validarCertificadoService.get(params).subscribe(res => {
            if (res) {
                this.plex.info('success', '', '<div class="small">El certificado es valido<div>');
            }
        }, () => {
            this.plex.info('warning', 'Verifique los datos ingresados', '<div class="small">El certificado es inválido</div>');
        });
        this.paciente.recaptcha = '';
    }
}
