import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, NgForm } from '@angular/forms';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as enumerados from 'src/app/utils/enumerados';
import { ScanParser } from 'projects/portal/src/app/providers/scan-parser';
import { PacientePortalService } from '../../services/paciente-portal.service';
import { captcha } from '../../../../../../src/environments/apiKeyMaps';

@Component({
    selector: 'pdp-registro-cuenta',
    templateUrl: './registro-cuenta.component.html',
    styleUrls: ['./registro-cuenta.component.scss']
})
export class RegistroCuentaComponent implements OnInit {

    @ViewChild('formulario', { static: true }) formulario: NgForm;
    public scanHabilitado = false;
    public textoDocumento;
    public textoTramite;
    public textoCelular;
    public textoEmail;
    public opcionesSexo = enumerados.getObjSexos();
    public formRegistro: any;
    public infoNrotramite = false;
    public recaptcha = null;
    public captchaEnabled = true;
    paciente: any = {};
    availableDevices: MediaDeviceInfo[];
    deviceCurrent: MediaDeviceInfo;
    deviceSelected: string;
    formatsEnabled: BarcodeFormat[] = [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.PDF_417
    ];
    qrResultString: string;
    hasDevices: boolean;
    hasPermission: boolean;

    torchEnabled = false;
    torchAvailable$ = new BehaviorSubject<boolean>(false);
    tryHarder = false;

    constructor(private plex: Plex, private formBuilder: FormBuilder, private router: Router, private scanParser: ScanParser, private pacienteService: PacientePortalService) {
        this.captchaEnabled = captcha.enabled;
    }

    ngOnInit(): void {
        const emailRegex = '^[a-z0-9._%+-]+@[a-z0-9.-]+[\.]{1}[a-z]{2,4}$';
        const patronDocumento = '^[1-9]{1}[0-9]{4,7}$';
        const patronContactoNumerico = '^[1-9]{3}[0-9]{6,7}$';
        this.formRegistro = this.formBuilder.group({
            documento: ['', Validators.compose([Validators.required, Validators.pattern(patronDocumento)])],
            celular: ['', Validators.compose([Validators.required, Validators.pattern(patronContactoNumerico)])],
            email: ['', Validators.compose([Validators.required, Validators.pattern(emailRegex)])],
            tramite: ['', Validators.compose([Validators.required])],
            sexo: ['', Validators.compose([Validators.required])],
            recaptcha: ['', this.captchaEnabled && Validators.compose([Validators.required])]
        });
        this.textoDocumento = 'Debe ingresar su número de documento, sin espacios ni puntos.';
        this.textoTramite = 'Debe ingresar los 11 dígitos de su número de trámite de documento.';
        this.textoCelular = 'Debe ingresar su número de celular, sin 0 y sin 15.';
        this.textoEmail = 'Debe ingresar un e-mail válido, ejemplo@ejemplo.com';
    }

    trimEmail(value) {
        this.formRegistro.patchValue({
            email: value.replace(/\s/g, '').toLowerCase()
        });
    }

    infoNT() {
        this.infoNrotramite = !this.infoNrotramite;
    }

    volverLogin() {
        this.router.navigate(['./login']);
    }

    registrarUsuario() {
        this.paciente.documento = this.formRegistro.controls.documento.value;
        this.paciente.sexo = this.formRegistro.controls.sexo.value.id;
        this.paciente.tramite = this.formRegistro.controls.tramite.value;
        this.paciente.telefono = this.formRegistro.controls.celular.value;
        this.paciente.email = this.formRegistro.controls.email.value;
        this.paciente.scan = this.scanHabilitado;
        this.paciente.recaptcha = this.formRegistro.controls.recaptcha.value;
        this.pacienteService.registro(this.paciente).pipe(
            catchError((err) => {
                this.plex.info('warning', err);
                this.recaptcha = '';
                return null;
            }),
        ).subscribe(() => {
            this.router.navigate(['reset-password'], {
                queryParams: {
                    registro: true,
                    email: this.paciente.email
                }
            });
        });
        this.cleanCaptcha();
    }

    cleanCaptcha() {
        this.formRegistro.controls.recaptcha.reset();
    }

    onCamerasFound(devices: MediaDeviceInfo[]): void {
        this.availableDevices = devices;
        this.hasDevices = Boolean(devices && devices.length);
        this.tryHarder = !this.tryHarder;
    }

    onCodeResult(resultString: string) {
        this.qrResultString = resultString;
        const datos = this.scanParser.scan(this.qrResultString);
        if (datos) {
            this.formRegistro.controls.sexo.setValue(datos.sexo.toLowerCase());
            this.formRegistro.controls.documento.setValue(datos.documento);
            this.formRegistro.controls.tramite.setValue(datos.tramite);
            this.formRegistro.get('recaptcha').setValidators(null);
            this.formRegistro.get('recaptcha').updateValueAndValidity();
        } else {
            this.plex.info('warning', 'Documento invalido');
        }
        this.scanHabilitado = false;
    }

    onHasPermission(has: boolean) {
        this.hasPermission = has;
        if (!this.hasPermission) {
            this.plex.info('warning', 'Tiene bloqueado el permiso de la cámara');
        }
    }

    onDeviceChange(device: MediaDeviceInfo) {
        const selectedStr = device?.deviceId || '';
        if (this.deviceSelected === selectedStr) {
            return;
        }
        this.deviceSelected = selectedStr;
        this.deviceCurrent = device || undefined;
    }

    onTorchCompatible(isCompatible: boolean): void {
        this.torchAvailable$.next(isCompatible || false);
    }

    toggleTorch(): void {
        this.torchEnabled = !this.torchEnabled;
    }

    clearResult(): void {
        this.formRegistro.controls.sexo.setValue('');
        this.formRegistro.controls.documento.setValue('');
        this.formRegistro.controls.tramite.setValue('');
        this.formRegistro.get('recaptcha').setValidators([Validators.required]);
        this.formRegistro.get('recaptcha').updateValueAndValidity();
        this.scanHabilitado = false;
        this.qrResultString = null;
        this.torchEnabled = false;
    }

    scan() {
        this.scanHabilitado = true;
    }

    resolved(captchaResponse: any[]) {
        this.recaptcha = captchaResponse;
    }
}
