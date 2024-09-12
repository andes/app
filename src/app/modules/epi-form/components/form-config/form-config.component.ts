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
    public fieldIndex: number | null = null;
    public sectionIndex: number;
    public selectItem: String;
    public selectColumns = [
        {
            key: 'name',
            label: 'Nombre',
        },
        {
            key: 'actions',
            label: 'Acciones',
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

    onRemoveSection(sectionIndex) {
        this.form.sections.splice(sectionIndex, 1);
        this.form.sections = [... this.form.sections];
    }

    onAddField(sectionIndex) {
        this.sectionIndex = sectionIndex;
        this.fieldToConfig = {
            key: '',
            name: '',
            type: '',
            selectList: [],
        };
    }

    onRemoveField(sectionIndex, fieldIndex) {
        this.form.sections[sectionIndex].fields.splice(fieldIndex, 1);
        this.form.sections = [...this.form.sections];
    }

    closeFieldConfig() {
        this.fieldToConfig = null;
    }

    onSaveField(sectionIndex, field) {
        if (this.fieldIndex !== null) {
            this.form.sections[sectionIndex].fields[this.fieldIndex] = { ...field };
            this.fieldIndex = null;
        } else {
            this.form.sections[sectionIndex].fields.push(field);
            this.form.sections[sectionIndex].fields = [... this.form.sections[sectionIndex].fields];
        }
        this.closeFieldConfig();
    }

    onEditField(sectionIndex, fieldIndex) {
        this.sectionIndex = sectionIndex;
        this.fieldIndex = fieldIndex;
        this.fieldToConfig = { ...this.form.sections[sectionIndex].fields[fieldIndex] };
    }

    onSaveSelectItem() {
        this.fieldToConfig.selectList.push({ id: this.selectItem.toLowerCase(), nombre: this.selectItem });
        this.fieldToConfig.selectList = [...this.fieldToConfig.selectList];
        this.selectItem = '';
    }

    onRemoveSelectItem(selectIndex) {
        this.fieldToConfig.selectList.splice(selectIndex, 1);
        this.fieldToConfig.selectList = [...this.fieldToConfig.selectList];
    }
}
