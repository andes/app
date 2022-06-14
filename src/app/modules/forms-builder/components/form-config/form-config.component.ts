import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-form-config',
    templateUrl: './form-config.component.html'
})
export class FormConfigComponent implements OnInit {
    @Input() form: any;
    public idEvento;
    public idGrupoEvento;
    public items = [];
    public itemsSelect = [];
    public columns = [
        {
            key: 'campo',
            label: 'Campo'
        },
        {
            key: 'idEvento',
            label: 'Evento'
        }
    ];
    public nuevaConfig = {
        campo: '',
        valor: '',
        idEvento: ''
    };

    constructor() { }

    ngOnInit(): void {
        this.getFields();
    }

    getFields() {
        this.form.fields.forEach(field => {
            if (field.items.length) {
                this.items.push({ id: field.key, nombre: field.label, items: field.items });
            } else {
                this.items.push({ id: field.key, nombre: field.label });
            }
        });
        this.idEvento = this.form.config?.idEvento;
        this.idGrupoEvento = this.form.config?.idGrupoEvento;

    }

    addConfig() {
        this.form.config.configField.push({ key: this.nuevaConfig.campo, value: this.nuevaConfig.valor, event: this.nuevaConfig.idEvento });
        this.nuevaConfig = {
            campo: '',
            valor: '',
            idEvento: ''
        };
    }

    checkStatic(event) {
        if (event.value.items) {
            this.itemsSelect = event.value.items;
        } else {
            this.nuevaConfig.valor = '';
            this.itemsSelect = [];
        }
    }

    setIdEvento() {
        this.form.config.idEvento = this.idEvento;
    }

    setIdGrupoEvento() {
        this.form.config.idGrupoEvento = this.idGrupoEvento;
    }
}
