import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormResourcesService } from '../../services/resources.service';

@Component({
    selector: 'field-config',
    templateUrl: './field-config.component.html'
})
export class FieldConfigComponent implements OnInit {
    @Input() field: any;
    @Input() sectionIndex: number;
    @Output() saveField: EventEmitter<any> = new EventEmitter<any>();
    @Output() closeField: EventEmitter<void> = new EventEmitter<void>();

    public form: FormGroup;
    public type: {
        id: '';
        name: '';
    };
    public hasDependency = false;
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

    constructor(
        private fb: FormBuilder,
        private formResourceService: FormResourcesService
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
            dependencies: this.fb.group({
                section: [null],
                field: [null],
                condition: [null],
                action: [null],
                value: ['']
            }),
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
                dependencies: this.field.dependency,
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
                this.form.get('key').
                    setValue(`${value
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^\w\s]/gi, '')
                        .replace(/\s+/g, '-')
                        .toLowerCase()}-${this.sectionIndex}`);
            } else {
                this.form.get('key').setValue('');
            }
        });

        this.formResourceService.search({}).subscribe(resultado => {
            resultado.forEach(r => {
                r.type === 'section' ? this.prebuiltSections.push(r) : this.resources.push(r);
            });
        });
    }

    get selectList() {
        return this.form.controls['selectList'] as FormArray;
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
    }
    deleteSelectItem(selectItemIndex: number) {
        this.selectList.removeAt(selectItemIndex);
    }

    closeFieldConfig() {
        this.closeField.emit();
    }
    onSaveField() {
        if (this.form.valid) {
            this.saveField.emit(this.form.value);
        }
    }
}
