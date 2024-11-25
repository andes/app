import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { forEach } from 'vis-util';


@Component({
    selector: 'table-config',
    templateUrl: './table-config.component.html'
})
export class TableConfigComponent implements OnInit {
    @Input() sectionTable: {
        name: string;
        type: string;
        key: string;
        nroCols: number;
        cols: Array<any>;
    };
    @Input() sectionIndex: number;
    @Output() saveTable: EventEmitter<any> = new EventEmitter<any>();
    @Output() closeTable: EventEmitter<void> = new EventEmitter<void>();

    public form: FormGroup;
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
    ];

    constructor(
        private fb: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            columnas: this.fb.array([])
        });
        if (this.sectionTable.cols.length > 0) {
            this.sectionTable.cols.forEach(col => {
                const columna = this.fb.group({
                    label: [col.label, Validators.required],
                    key: [col.key],
                    type: [col.type, Validators.required]
                });
                this.columnas.push(columna);
            });
        } else {
            for (let i = 0; i < this.sectionTable.nroCols; i++ ) {
                const columna = this.fb.group({
                    label: ['', Validators.required],
                    key: [''],
                    type: [null, Validators.required]
                });
                this.columnas.push(columna);
            }
        }

    }

    get columnas() {
        return this.form.controls['columnas'] as FormArray;
    }

    closeTableConfig() {
        this.closeTable.emit();
    }

    onSaveTable() {
        if (this.form.valid) {
            this.sectionTable.cols = this.columnas.getRawValue();
            this.saveTable.emit(this.sectionTable);
        }
    }

}
