import { Plex } from '@andes/plex';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form, FormsService } from '../../services/form.service';
import { FormResourcesService } from '../../services/resources.service';
import { Auth } from '@andes/auth';


@Component({
    selector: 'app-forms-crud',
    templateUrl: './forms-crud.component.html',
    styleUrls: ['./forms-crud.scss']
})
export class AppFormsCrudComponent implements OnInit {
    public tiposList = [
        { id: 'string', nombre: 'Texto' },
        { id: 'int', nombre: 'Numerico' },
        { id: 'select', nombre: 'Selección' },
        { id: 'date', nombre: 'Fecha' },
        { id: 'boolean', nombre: 'Booleano' },
        { id: 'phone', nombre: 'Teléfono' },
        { id: 'dependencia', nombre: 'Dependencia' },
        { id: 'snomed', nombre: 'Snomed' },
        { id: 'table', nombre: 'Tabla' }
    ];
    public disable = false;
    public recursos = [];
    public secciones = [];
    public hasOcurrences = false;
    public isFormSnomedizable = false;
    public desabilitado = false;
    public form: any = {
        name: '',
        type: '',
        snomedCode: '',
        active: true,
        fields: []
    };
    private formToUpdate: Form;

    constructor(
        private plex: Plex,
        private formsService: FormsService,
        private location: Location,
        private route: ActivatedRoute,
        private formResourceService: FormResourcesService,
        private auth: Auth,
        private router: Router
    ) { }

    ngOnInit() {
        let fieldsAssigns = [];
        this.formResourceService.search({}).subscribe(resultado => {
            resultado.forEach(r => {
                r.type === 'section' ? this.secciones.push(r) : this.recursos.push(r);
            });
            const formulario = this.route.snapshot.data.event;
            this.formToUpdate = formulario; // Hacemos esta parte para saber si hacemos update o create.
            if (formulario) {
                if (!this.auth.check('formBuilder:update')) {
                    this.router.navigate(['inicio']);
                }
                this.desabilitado = true;
                this.isFormSnomedizable = (formulario.snomedCode) ? true : false;
                this.form.name = formulario.name;
                this.form.type = formulario.type;
                this.form.snomedCode = formulario.snomedCode;
                this.form.active = formulario.active;
                let campos = [];
                formulario.sections.forEach(s => {
                    s.fields.forEach(f => {
                        f.type = this.tiposList.find(t => t.id === f.type) as any;
                        if ((f.type as any).id === 'select') {
                            f.resources = this.recursos.find(t => t.id === f.resources) as any;
                        }
                        if (!this.fieldAssigned(fieldsAssigns, f, s)) {
                            f.sections = [];
                            f.sections.push(this.secciones.find(sec => sec.name === s.name) as any);
                            fieldsAssigns.push(f);
                            campos.push(f);
                        }
                    });
                });
                this.form.fields = campos;
            } else {
                if (!this.auth.check('formBuilder:create')) {
                    this.router.navigate(['inicio']);
                }
            }
        });
    }

    fieldAssigned(array, field, newSection) {
        let resultado = false;
        array.find(f => {
            if (f.key === field.key) {
                f.sections.push(newSection);
                resultado = true;
            }
        });
        return resultado;
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
            preload: false,
            dependencia: ''
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
            let aux = [];
            this.form.fields.forEach(f => {
                let cloneField = Object.assign({}, f);
                delete cloneField.sections;
                const field: any = { ...cloneField };
                cloneField.type = field.type.id;
                if (cloneField.type === 'select') {
                    cloneField.resources = field.resources.id;
                }
                if (f.sections && f.sections.length > 0) {
                    f.sections.forEach(s => {
                        let r = aux.find(item => {
                            if (item.seccion.name === s.name) {
                                item.campos.push(cloneField);
                                return true;
                            }
                        });
                        if (!r) {
                            return aux.push({ seccion: s, campos: [cloneField] });
                        }
                    });
                }
            });
            const dataSaved: Form = {
                active: this.form.active,
                name: this.form.name,
                type: this.form.type,
                snomedCode: this.isFormSnomedizable ? this.form.snomedCode : null,
                sections: aux.map(i => {
                    let seccion;
                    seccion = i.seccion;
                    seccion['fields'] = i.campos;
                    return seccion;
                })
            };
            if (this.formToUpdate) { // if update
                this.formToUpdate = {
                    ...this.formToUpdate,
                    active: this.form.active,
                    snomedCode: this.isFormSnomedizable ? this.form.snomedCode : null,
                    sections: dataSaved.sections
                };
                this.formsService.save(this.formToUpdate).subscribe(() => {
                    this.location.back();
                });
            } else { // create
                this.formsService.save(dataSaved).subscribe(() => {
                    this.location.back();
                });
            }
        }
    }
}
