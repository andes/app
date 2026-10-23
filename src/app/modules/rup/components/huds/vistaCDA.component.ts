import { Auth } from '@andes/auth';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CDAService } from '../../services/CDA.service';

@Component({
    selector: 'vista-cda',
    templateUrl: 'vistaCDA.html',
    styleUrls: ['vistaCDA.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class VistaCDAComponent implements OnInit {

    @Input() registro;

    archivo;

    public codificacionCDA = null;
    public autorCDA = null;
    public organizacionCDA = null;
    public requestInProgress = false;
    public puedeDescargarCDA = false;

    constructor(private servicioCDA: CDAService, private auth: Auth) { }

    ngOnInit() {
        this.puedeDescargarCDA = this.auth.check('cda:post') || this.auth.check('huds:impresion') || this.auth.check('cda:get');

        const cdaId = this.registro?.data?.cda_id;
        if (!cdaId) {
            return;
        }

        this.servicioCDA.getJson(cdaId).subscribe({
            next: (cda) => {
                const document = cda?.ClinicalDocument;
                this.autorCDA = document?.author?.assignedAuthor?.assignedPerson ? document.author.assignedAuthor.assignedPerson.name : null;
                this.organizacionCDA = document?.author?.assignedAuthor?.representedOrganization ? document.author.assignedAuthor.representedOrganization : null;
                this.codificacionCDA = document?.component?.structuredBody ? document.component.structuredBody.component.section : null;
            },
            error: () => {
                this.codificacionCDA = null;
            }
        });
    }

    descargar(archivo) {
        if (!archivo) {
            return;
        }

        const token = window.sessionStorage.getItem('jwt');
        const url = environment.API + '/modules/cda/' + archivo + '?token=' + token;
        window.open(url);
    }

    descargarCDA(registro) {
        if (!registro?.data || this.requestInProgress) {
            return;
        }

        this.requestInProgress = true;

        const metadata = {
            id: registro.data.extras?.id || registro.data.id,
            prestacion: registro.data.prestacion,
            fecha: registro.data.fecha,
            idPaciente: registro.data.paciente,
            profesional: registro.data.profesional,
            organizacion: registro.data.organizacion,
            codificacion: this.codificacionCDA
        };
        const nombreArchivo = registro.data.prestacion?.snomed?.term || 'CDA';

        this.servicioCDA.descargarCDA(metadata, nombreArchivo).subscribe({
            next: () => this.requestInProgress = false,
            error: () => this.requestInProgress = false
        });
    }
}
