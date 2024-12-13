import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormPresetResourcesService } from 'src/app/modules/forms-builder/services/preset.resources.service';
import { Plex } from '@andes/plex';
import { threadId } from 'worker_threads';

@Component({
    selector: 'form-config',
    templateUrl: './form-config.component.html',
    styleUrls: ['./form-config.scss']
})
export class FormConfigComponent implements OnInit {

    @ViewChild('formulario', { static: false }) formControl: NgForm;

    public isFormSnomedizable = false;
    public form: any = {
        name: '',
        description: '',
        snomedCode: '',
        sections: []
    };
    public sidebar = false;
    public sidebarTable = false;
    public fieldToConfig = null;
    public tableToConfig = null;
    public fieldIndex: number | null = null;
    public sectionIndex: number | null = null;
    public seccionesSelect = [
        { id: 'seccion', nombre: 'Seccion custom' },
        { id: 'usuario', nombre: 'Usuario' },
        { id: 'mpi', nombre: 'MPI' },
        { id: 'tabla', nombre: 'Tabla' }
    ];
    public itemsDropdown = [
        {
            label: 'Seccion vacia',
            handler: () => { this.onAddSection(); }
        },
        {
            label: 'Tabla',
            handler: () => { this.onAddTableSection(); }
        }
    ];
    constructor(
        private auth: Auth,
        private router: Router,
        private formDefaultResourceService: FormPresetResourcesService,
        private plex: Plex,
    ) { }

    ngOnInit() {
        if (!this.auth.check('formBuilder:update')) {
            this.router.navigate(['inicio']);
        }

        this.loadDefaultResources();
    }

    private loadDefaultResources() {
        this.formDefaultResourceService.search({}).subscribe((data: any) => {
            data.map(d => (
                this.itemsDropdown.push({
                    label: d.id,
                    handler: () => { this.loadPresetSection(d); }
                })));
            this.itemsDropdown = [...this.itemsDropdown];
        });
    }

    onAddSection() {
        this.form.sections.push({
            name: '',
            type: 'section',
            key: '',
            fields: []
        });
        this.form.sections = [...this.form.sections];
        setTimeout(() => {
            const element = document.querySelector(`#wrapper-${this.form.sections.length - 1}`);
            if (element) {
                element.scrollIntoView({ block: 'end', behavior: 'smooth' });
            }
        }, 100);
    }

    onRemoveSection(sectionIndex) {
        this.form.sections.splice(sectionIndex, 1);
        this.form.sections = [... this.form.sections];
    }

    onAddTableSection() {
        this.form.sections.push({
            name: '',
            type: 'table',
            key: '',
            nroCols: null,
            cols: []
        });
        this.form.sections = [...this.form.sections];
    }

    onEditTable(sectionIndex) {
        this.sectionIndex = sectionIndex;
        if (this.form.sections[this.sectionIndex].nroCols > 0) {
            this.tableToConfig = this.form.sections[sectionIndex];
            this.sidebarTable = true;
        } else {
            this.plex.toast('danger', 'No se puede configurar la tabla. Agregue Numero de columnas', 'Atención');
        }
    }

    onSaveTable(st) {
        this.form.sections[this.sectionIndex] = st;
        this.closeFieldConfig();
    }

    onAddField(sectionIndex) {
        this.closeFieldConfig;
        setTimeout(() => {
            this.sectionIndex = sectionIndex;
            this.sidebar = true;
        }, 300);
    }

    onSaveField(field) {
        if (this.fieldIndex !== null) {
            this.form.sections[this.sectionIndex].fields[this.fieldIndex] = { ...field };
            this.fieldIndex = null;
        } else {
            this.form.sections[this.sectionIndex].fields.push(field);
            this.form.sections[this.sectionIndex].fields = [... this.form.sections[this.sectionIndex].fields];
        }
        this.closeFieldConfig();
    }

    onRemoveField(sectionIndex, fieldIndex) {
        this.form.sections[sectionIndex].fields.splice(fieldIndex, 1);
        this.form.sections = [...this.form.sections];
    }

    closeFieldConfig() {
        this.sectionIndex = null;
        this.fieldToConfig = null;
        this.sidebarTable = null;
        this.tableToConfig = null;
        this.sidebar = false;
    }

    onEditField(sectionIndex, fieldIndex) {
        this.closeFieldConfig();
        setTimeout(() => {
            this.sectionIndex = sectionIndex;
            this.fieldIndex = fieldIndex;
            this.fieldToConfig = { ...this.form.sections[sectionIndex].fields[fieldIndex] };
            this.sidebar = true;
        }, 300);
    }

    dropSection(event: CdkDragDrop<any[]>) {
        moveItemInArray(this.form.sections, event.previousIndex, event.currentIndex);
    }

    dropField(event: CdkDragDrop<any[]>, sectionIndex: number) {
        const previousSection = this.form.sections[event.previousContainer.id];
        const currentSection = this.form.sections[sectionIndex];

        if (event.previousContainer === event.container) {
            moveItemInArray(currentSection.fields, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                previousSection.fields,
                currentSection.fields,
                event.previousIndex,
                event.currentIndex
            );
        }
    }

    loadPresetSection(presetSection) {
        const section = presetSection;
        section.type = 'preset-section';
        section.fields = presetSection.fields.map(field => (
            {
                name: field.label,
                key: field.key,
                type: { id: field.type },
                required: field.required,
                description: field.description,
                resources: field.resources
            }
        ));
        this.form.sections.push(section);
        this.form.sections = [...this.form.sections];
    }
    generarStringUnico(): string {
        const numero = Math.floor(10 + Math.random() * 90);
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        const charsLength = chars.length;
        let characters = '';
        for ( let i = 0 ; i < 2 ; i++ ) {
            characters += chars.charAt(Math.floor(Math.random() * charsLength));
        }
        return `${characters}${numero}`;
    };
    saveNameSection(sectionIndex) {
        const unique = this.generarStringUnico();
        const key = this.form.sections[sectionIndex].name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-')
            .toLowerCase().concat(unique);
        this.form.sections[sectionIndex].key = key;
        console.log(this.form);
    }

    // loadResource(field) {
    // }
}
