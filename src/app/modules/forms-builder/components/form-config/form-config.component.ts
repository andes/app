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
        },
        {
            key: 'acciones',
            label: 'Acciones'
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

    deleteConfig(config) {
        let index = -1;
        if (config.value) {
            index = this.form.config.configField.findIndex(field => field.value.id === config.value.id);
        } else {
            index = this.form.config.configField.findIndex(field => field.key.id === config.key.id);
        }
        if (index >= 0) {
            this.form.config.configField.splice(index, 1);
            this.form.config.configField = [...this.form.config.configField];
        }
    }

    checkStatic(event) {
        if (event.value?.items) {
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
