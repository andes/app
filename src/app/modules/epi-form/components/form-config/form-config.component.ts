import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'form-config',
    templateUrl: './form-config.component.html',
    styleUrls: ['./form-config.scss']
})
export class FormConfigComponent implements OnInit {

    @ViewChild('formulario', { static: false }) formControl: NgForm;
    // selectColsVisibles = {
    //     'name': true,
    //     'actions': true,
    // };
    public tiposList = [
        { id: 'string', nombre: 'Texto' },
        { id: 'int', nombre: 'Numérico' },
        { id: 'select', nombre: 'Selección' },
        { id: 'selectStatic', nombre: 'Selección estática' },
        { id: 'date', nombre: 'Fecha' },
        { id: 'boolean', nombre: 'Verdadero o Falso' },
        { id: 'phone', nombre: 'Teléfono' },
        { id: 'dependencia', nombre: 'Dependencia' },
        { id: 'snomed', nombre: 'Snomed' },
        { id: 'table', nombre: 'Tabla' }
    ];
    public resources = [
        { id: 'provincias', nombre: 'Provincias' },
        { id: 'localidades', nombre: 'Localidades' },
        { id: 'personal', nombre: 'Personal' },
        { id: 'efectores', nombre: 'Efectores' },
        { id: 'enfermedades', nombre: 'Enfermedades' },
        { id: 'paises', nombre: 'Países' }
    ];
    public isFormSnomedizable = false;
    public form: any = {
        name: '',
        description: '',
        snomedCode: '',
        sections: []
    };
    public fieldToConfig = null;
    public indexSection: Number;
    public selectItem: String;
    public selectColumns = [
        {
            key: 'name',
            label: 'Nombre'
        },
        {
            key: 'actions',
            label: 'Acciones'
        }
    ];
    constructor(
        private auth: Auth,
        private router: Router
    ) {}
    ngOnInit() {
        if (!this.auth.check('formBuilder:update')) {
            this.router.navigate(['inicio']);
        }
    }

    onAddSection() {
        this.form.sections.push({
            name: '',
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
    onRemoveSection(i) {
        this.form.sections.splice(i, 1);
        this.form.sections = [... this.form.sections];
    }

    onAddField(i) {
        this.indexSection = i;
        this.fieldToConfig = {
            key: '',
            name: '',
            type: ''
        };
    }

    onRemoveField(sectionIndex, fieldIndex) {
        this.form.sections[sectionIndex].fields.splice(fieldIndex, 1);
        this.form.sections = [...this.form.sections];
    }

    closeFieldConfig() {
        this.fieldToConfig = null;
    }

    onSaveField(i, field) {
        this.form.sections[i].fields.push(field);
        this.form.sections[i].fields = [... this.form.sections[i].fields];
        this.closeFieldConfig();
    }
}
