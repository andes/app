import { Component, Output, ViewChild, Input, EventEmitter, OnInit } from '@angular/core';
import { PlexModalComponent } from '@andes/plex';
import { Auth } from '@andes/auth';
import { ProfesionalService } from 'src/app/services/profesional.service';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';
import { MotivosHudsService } from 'src/app/services/motivosHuds.service';
import { IMotivoAcceso } from '../../interfaces/IMotivoAcceso';
@Component({
    selector: 'modal-motivo-acceso-huds',
    templateUrl: 'modal-motivo-acceso-huds.html'
})

export class ModalMotivoAccesoHudsComponent implements OnInit {
    public profesional;
    public binaryString = null;
    public firmas = null;
    public urlFirma = null;
    public base64textString = '';
    public binaryStringAdmin = null;
    public urlFirmaAdmin = null;
    public base64textStringAdmin = '';
    public nombreAdministrativo = '';
    public firmaAdmin = null;
    @ViewChild('modal', { static: true }) modal: PlexModalComponent;
    foto: any;
    tieneFoto: boolean;
    constructor(
        public auth: Auth,
        public _profesionalService: ProfesionalService,
        public motivosHudsService: MotivosHudsService,
        public sanitizer: DomSanitizer,
    ) { }
    @Input()
    set show(value) {
        if (value) {
            this.modal.show();
            this.motivoSelected = null;
        }
    }
    @Output() motivoAccesoHuds = new EventEmitter<IMotivoAcceso>();

    public motivoSelected = null;
    public descripcionAcceso = '';
    public motivo: IMotivoAcceso;
    public motivosAccesoHuds = [];

    ngOnInit(): void {
        if (this.auth.profesional) {
            this._profesionalService.getFirma({ id: this.auth.profesional }).pipe(catchError(() => of(null))).subscribe(resp => {
                this.urlFirma = resp?.length ? this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp) : null;
            });
            this._profesionalService.getFirma({ firmaAdmin: this.auth.profesional }).pipe(catchError(() => of(null))).subscribe(resp => {
                if (resp?.firma) {
                    this.urlFirmaAdmin = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp.firma);
                    this.firmaAdmin = resp.firma;
                    this.nombreAdministrativo = resp.administracion;
                } else {
                    this.urlFirmaAdmin = null;
                    this.firmaAdmin = null;
                    this.nombreAdministrativo = '';
                }
            });
        }
        this.motivosHudsService.getMotivosModal().subscribe(
            motivos => {
                motivos.map(motivo => this.motivosAccesoHuds.push({ id: motivo.key, label: motivo.label }));
            }
        );
    }

    motivoSelect() {
        return this.motivoSelected === null;
    }

    notificarAccion(flag: boolean) {
        if (flag) {
            const item = this.motivosAccesoHuds.find((elem) => elem.id === this.motivoSelected);
            this.motivo = {
                motivo: item.id,
                textoObservacion: this.descripcionAcceso,
            };
            this.motivoAccesoHuds.emit(this.motivo);
        } else {
            this.motivoAccesoHuds.emit(null);
        }
        // No se usa this.modal.close() porque interfiere con el cerrar con la tecla ESC
        this.modal.showed = false;
    }
}
