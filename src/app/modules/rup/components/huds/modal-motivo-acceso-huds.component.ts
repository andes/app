import { Component, Output, ViewChild, Input, EventEmitter, OnInit } from '@angular/core';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { Auth } from '@andes/auth';
import { ProfesionalService } from 'src/app/services/profesional.service';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';

@Component({
    selector: 'modal-motivo-acceso-huds',
    templateUrl: 'modal-motivo-acceso-huds.html'
})

export class ModalMotivoAccesoHudsComponent implements OnInit {
    public profesional;
    public binaryString = null;
    public firmas = null;
    public urlFirma = null;
    public base64textString: String = '';
    public binaryStringAdmin = null;
    public urlFirmaAdmin = null;
    public base64textStringAdmin: String = '';
    public nombreAdministrativo = '';
    public firmaAdmin = null;
    @ViewChild('modal', { static: true }) modal: PlexModalComponent;
    foto: any;
    tieneFoto: boolean;
    constructor(
        public auth: Auth,
        public _profesionalService: ProfesionalService,
        public sanitizer: DomSanitizer,

    ) { };
    @Input()
    set show(value) {
        if (value) {
            this.modal.show();
            this.motivoSelected = null;
        }
    }
    @Output() motivoAccesoHuds = new EventEmitter<[String, String]>();
    public motivosAccesoHuds = [
        { id: 'auditoria', label: 'Procesos de Auditoría' },
        { id: 'urgencia', label: 'Intervención de Urgencia/Emergencia' },
        { id: 'administrativo', label: 'Procesos Administrativos' },
        { id: 'continuidad', label: 'Intervención en el proceso de cuidado del paciente' }
    ];
    public motivoSelected = null;
    public detalleMotivo = '';

    ngOnInit(): void {
        if (this.auth.profesional) {

            this._profesionalService.getFirma({ id: this.auth.profesional }).pipe(catchError(() => of(null))).subscribe(resp => {
                this.urlFirma = resp.length ? this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp) : null;
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
    }

    motivoSelect() {
        return this.motivoSelected === null;
    }

    notificarAccion(flag: boolean) {
        if (flag) {
            const item = this.motivosAccesoHuds.find((elem) => elem.id === this.motivoSelected);
            this.motivoAccesoHuds.emit([item.label, this.detalleMotivo]);
        } else {
            this.motivoAccesoHuds.emit(null);
        }
        // No se usa this.modal.close() porque interfiere con el cerrar con la tecla ESC
        this.modal.showed = false;
    }
}
