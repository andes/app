import { Component, OnInit } from '@angular/core';
import { FormResourcesService } from '../../services/resources.service';
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
        { id: 'boolean', nombre: 'Booleano' },
        { id: 'phone', nombre: 'Teléfono'}
    ];
    public disable = false;
    public recursos = [];
    public secciones = [];
    public hasOcurrences = false;
    public form: Form = {
        name: '',
        type: '',
        active: true,
        fields: []
    };

    constructor(
        private plex: Plex,
        private formsService: FormsService,
        private location: Location,
        private route: ActivatedRoute,
        private formResourceService: FormResourcesService
    ) { }

    ngOnInit() {
        this.formResourceService.search({}).subscribe(resultado => {
            resultado.forEach(r => {
                r.type === 'section' ? this.secciones.push(r) : this.recursos.push(r);
            });
            const form = this.route.snapshot.data.event;
            if (form) {
                this.form = form;
                this.form.fields.forEach(field => {
                        field.type = this.tiposList.find(t => t.id === field.type) as any;
                        if ((field.type as any).id === 'select') {
                            field.resources = this.recursos.find(t => t.key === field.resources) as any;
                        }
                    });
            }
        });
    }

    identify(item) {
        return item.name;
     }

    loadSecciones(event) {
       event.callback(this.secciones);
    }

    onAddField() {
        this.form.fields.push({
            key: '',
            label: '',
            type: '',
            description: '',
            required: false,
            subfilter: false,
            extras: '',
            sections: [],
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
                        i.type = field.type.id;
                        if (i.type === 'select') {
                            i.resources = field.resources.key;
                        } else {
                            i.resources = null;
                        }
                        return i;
                        })
            };
            this.formsService.save(dataSaved).subscribe(() => {
                this.location.back();
            });
        }
    }
}
