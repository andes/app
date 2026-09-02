import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormResourcesService } from '../../services/resources.service';
import { DynamicResourcesService } from '../../services/dynamic-resource.service';
import { Field, Form, Section } from '../../andes-form.interfaces';

@Component({
    selector: 'field-config',
    templateUrl: './field-config.component.html'
})
export class FieldConfigComponent implements OnInit {
    @Input() field: Field;
    @Input() sectionIndex: number;
    @Input() fullForm: Form;
    @Output() saveField: EventEmitter<any> = new EventEmitter<any>();
    @Output() closeField: EventEmitter<void> = new EventEmitter<void>();

    public form: FormGroup;
    public type: {
        id: string;
        name: string;
    };
    public action = [
        { id: 'show', nombre: 'Mostrar' },
        { id: 'hide', nombre: 'Ocultar' },
        { id: 'enable', nombre: 'Habilitar' },
        { id: 'disable', nombre: 'Deshabilitar' }
    ];
    public typeDependency = [
        { id: 'filter', nombre: 'Filtrado' },
        { id: 'comparison', nombre: 'Comparación' }
    ];
    public typeComparison = [
        { id: 'equals', nombre: 'Igual a' },
        { id: 'graterThan', nombre: 'Mayor que' },
        { id: 'lessThan', nombre: 'Menor que' },
        { id: 'contains', nombre: 'Contiene' }
    ];
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
    public resources = [];
    public prebuiltSections = [];
    public dynamicResources = [];
    // public dependency = [];
    public hasDependency = false;
    constructor(
        private fb: FormBuilder,
        private formResourceService: FormResourcesService,
        private dynamicResourcesService: DynamicResourcesService,
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', Validators.required],
            key: ['', Validators.required],
            type: [null, Validators.required],
            required: [false],
            datePeriod: [false],
            description: [''],
            hasDependency: [false],
            dependencies: this.fb.array([]),
            resources: [null],
            min: [null],
            max: [null],
            selectList: this.fb.array([]),
        });

        if (this.field) {
            this.form.patchValue({
                name: this.field.name,
                key: this.field.key,
                type: this.field.type,
                required: this.field.required,
                datePeriod: this.field.datePeriod,
                description: this.field.description,
                hasDependency: this.hasDependency,
                dependencies: this.field.dependencies,
                resources: this.field.resources,
                min: this.field.min,
                max: this.field.max,
            });
            this.type = this.field.type;
            this.field.selectList.forEach(item => {
                const selectItem = this.fb.group({
                    name: [item.name, Validators.required],
                    id: [item.id]
                });
                this.selectList.push(selectItem);
            });
        }

        this.form.get('type')?.valueChanges.subscribe(value => {
            this.type = value;
            this.selectList.clear();
        });

        this.form.get('hasDependency')?.valueChanges.subscribe(value => {
            this.hasDependency = value;
        });

        this.form.get('name')?.valueChanges.subscribe(value => {
            if (value) {
                const uniqueString = this.generarStringUnico();
                this.form.get('key').
                    setValue(`${value
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^\w\s]/gi, '')
                        .replace(/\s+/g, '-')
                        .toLowerCase()}-${uniqueString}`);
            } else {
                this.form.get('key').setValue('');
            }
        });

        this.formResourceService.search({}).subscribe(resultado => {
            resultado.forEach(r => {
                r.type === 'section' ? this.prebuiltSections.push(r) : this.resources.push(r);
            });
        });
        console.log(this.fullForm);
    };

    get selectList() {
        return this.form.controls['selectList'] as FormArray;
    };
    get dependencies() {
        return this.form.controls['dependencies'] as FormArray;
    }

    addSelectItem() {
        const selectItem = this.fb.group({
            name: ['', Validators.required],
            id: ['']
        });
        selectItem.get('name')?.valueChanges.subscribe(value => {
            selectItem.get('id')?.setValue(value);
        });
        this.selectList.push(selectItem);
    };
    deleteSelectItem(selectItemIndex: number) {
        this.selectList.removeAt(selectItemIndex);
    };

    closeFieldConfig() {
        this.closeField.emit();
    };
    onSaveField() {
        if (this.form.valid) {
            this.saveField.emit(this.form.value);
        }
    };

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

    onAddDependency() {
        const dependency = this.fb.group({
            type: [null, Validators.required],
            condition: [null, Validators.required],
            section: [null, Validators.required],
            field: [null, Validators.required],
            action: [null],
            value: [null]
        });
        this.dependencies.push(dependency);
    };

    getPaths(obj, prefix = ''): Array<string> {
        let paths = [];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const fullPath = prefix ? `${prefix}.${key}` : key;

                if (Array.isArray(obj[key])) {
                    obj[key].forEach((_, index) => {
                        paths.push(`${fullPath}[${index}]`);
                        if (typeof obj[key][index] === 'object' && obj[key][index] !== null) {
                            paths = paths.concat(this.getPaths(obj[key][index], `${fullPath}[${index}]`));
                        }
                    });
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    paths = paths.concat(this.getPaths(obj[key], fullPath));
                } else {
                    paths.push(fullPath);
                }
            }
        }
        return paths;
    };
    getOneObjectOfResource(url): any {
        const listResource = this.dynamicResourcesService.get(url, { limit: 10 });
        return listResource[0];
    };
    getSectionList(event): any {
        console.log('get data section')
        const listSections = [];
        this.fullForm.sections.map(s => {
            const section = {
                id: s.key,
                nombre: s.name
            };
            listSections.push(section);
        });
        event.callback(listSections);
    };
    getFieldList(dependency, event): any {
        console.log(dependency);
        const fieldList = [];
        const section = dependency.get('section')?.value;
        console.log(section);
        const sectionForm = this.fullForm.sections.find((s) => s.key === section.id);
        console.log(sectionForm);
        sectionForm.fields?.map(f => {
            const field = {
                id: f.key,
                nombre: f.name
            };
            fieldList.push(field);
        });
        event.callback(fieldList);
    };
    getDataForValueSelect(): any {
        const selectList = [];
        const url = this.form.get('resources')?.value.url;
        console.log(url);
        const example = this.getOneObjectOfResource(url);
        console.log(example);
        console.log(this.getPaths(example));
        this.getPaths(example).map(p => {
            const select = {
                id: p,
                nombre: p,
            };
            selectList.push(select);
        });
        return selectList;
    }
}
