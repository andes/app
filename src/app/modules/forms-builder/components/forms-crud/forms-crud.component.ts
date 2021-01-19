import { Component, OnInit } from '@angular/core';
// import { ResourcesService } from '../../services/resources.service';
import { Form, FormsService } from '../../services/form.service';
import { Plex } from '@andes/plex';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-forms-crud',
    templateUrl: './forms-crud.component.html',
    styleUrls: ['./forms-crud.scss']
})
export class AppFormsCrudComponent implements OnInit {
    [x: string]: any;
    public tiposList = [
        { id: 'string', nombre: 'Texto' },
        { id: 'int', nombre: 'Numerico' },
        { id: 'select', nombre: 'Selección' },
        { id: 'date', nombre: 'Fecha' },
        { id: 'boolean', nombre: 'Booleano' }
    ];
    public recursos = [];
    public hasOcurrences = false;
    public form: Form = {
        name: '',
        type: '',
        active: true,
        fields: [
        {
            key: '',
            label: '',
            type: '',
            description: '',
            required: false,
            subfilter: true,
            extras: '',
            resources: '',
            preload: false
        }
    ]
    };

    constructor(
        private plex: Plex,
        private formsService: FormsService,
        private location: Location,
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        const form = this.route.snapshot.data.event;
        if (form) {
            this.form = form;
            this.form.fields.forEach(f => {
                f.type = this.tiposList.find(t => t.id === f.type) as any;
                if ((f.type as any).id === 'select') {
                    f.resources = this.recursos.find(t => t.key === f.resources) as any;
                }
            });
        }
    }

    onAdd() {
        this.form.fields.push({
            key: '',
            label: '',
            type: '',
            description: '',
            required: false,
            subfilter: true,
            extras: '',
            resources: '',
            preload: false
        });
        this.form.fields = [...this.form.fields];

        setTimeout(() => {
            const element = document.querySelector(`#wrapper-${this.form.fields.length - 1}`);
            if (element) {
                element.scrollIntoView({ block: 'end', behavior: 'smooth' });
            }
        }, 100);
    }

    onRemove(i) {
        this.form.fields.splice(i, 1);
        this.form.fields = [...this.form.fields];
    }

    save($event) {
        if (!this.form.fields.length) {
            return this.plex.toast('danger', 'Al menos debes agregar un campo');
        }

        if ($event.formValid) {
            const dataSaved = {
                ...this.form,
                fields: this.form.fields.map(i => {
                    const field: any = { ...i };
                    field.type = field.type.id;
                    if (field.type === 'select') {
                        field.resources = field.resources.key;
                    } else {
                        field.resources = null;
                    }
                    return field;
                })
            };
            this.formsService.save(dataSaved).subscribe(() => {
                this.location.back();
            });
        }
    }
}
