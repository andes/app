import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Form, FormsService } from '../../services/form.service';
import { FormResourcesService } from '../../services/resources.service';
import { FormPresetResourcesService } from '../../services/preset.resources.service';
import { NgForm } from '@angular/forms';


@Component({
    selector: 'app-forms-crud',
    templateUrl: './forms-crud.component.html',
    styleUrls: ['./forms-crud.scss']
})
export class AppFormsCrudComponent implements OnInit {

    @ViewChild('formulario', { static: false }) formControl: NgForm;

    public tiposList = [
        { id: 'string', nombre: 'Texto' },
        { id: 'int', nombre: 'Numerico' },
        { id: 'select', nombre: 'Selección' },
        { id: 'selectStatic', nombre: 'Select-Static' },
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
    public seccionesInForm = [];
    public hasOcurrences = false;
    public isFormSnomedizable = false;
    public desabilitado = false;
    public fieldToConfig = null;
    public formToConfig = null;
    public form: any = {
        name: '',
        type: '',
        config: {
            idEvento: '',
            idGrupoEvento: '',
            configField: []
        },
        snomedCode: '',
        active: true,
        fields: []
    };
    private formToUpdate: Form;
    public fieldStatic = null;
    public dependencia = null;
    public dependencyData = [];
    itemsDropdown;

    constructor(
        private plex: Plex,
        private formsService: FormsService,
        private location: Location,
        private route: ActivatedRoute,
        private formResourceService: FormResourcesService,
        private formDefaultResourceService: FormPresetResourcesService,
        private auth: Auth,
        private router: Router
    ) { }

    ngOnInit() {
        const fieldsAssigns = [];
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
                this.form.config = formulario.config;
                this.form.type = formulario.type;
                this.form.snomedCode = formulario.snomedCode;
                this.form.active = formulario.active;
                const campos = [];
                formulario.sections.forEach(s => {
                    s.fields.forEach(f => {
                        this.setFieldType(f);
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

        this.loadDefaultResources();
    }

    private loadDefaultResources() {
        this.formDefaultResourceService.search({}).subscribe((data: any) => {
            this.itemsDropdown = data.map(d => ({
                label: d.id,
                handler: () => { this.loadPresetSection(d); }
            }));
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
        const itemRemove = this.form.fields[i];
        this.seccionesInForm.forEach((s, j) => {
            if (itemRemove.sections.find(i => i.id === s.seccion)) {
                s.cantidad--;
                if (!s.cantidad) {
                    this.seccionesInForm.splice(j, 1);
                }
            }
        });
        this.form.fields.splice(i, 1);
        this.form.fields = [...this.form.fields];

    }

    save($event) {

        if (!this.form.fields.length) {
            return this.plex.toast('danger', 'Al menos debes agregar un campo');
        }
        if ($event.formValid) {
            const aux = [];
            this.form.fields.forEach(f => {
                if (!f.key) {
                    f.key = f.label.slice(0, 16).replace(/ /g, '').toLowerCase();
                }
                const cloneField = Object.assign({}, f);
                delete cloneField.sections;
                const field: any = { ...cloneField };
                cloneField.type = field.type.id;
                if (cloneField.type === 'select') {
                    cloneField.resources = field.resources.id;
                }
                if (f.sections && f.sections.length > 0) {
                    f.sections.forEach(s => {
                        const r = aux.find(item => {
                            if (item.seccion.name === s?.name) {
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
                config: this.form.config,
                type: this.form.type,
                snomedCode: this.isFormSnomedizable ? this.form.snomedCode : null,
                sections: aux.map(i => {
                    const seccion = i.seccion;
                    seccion['fields'] = i.campos;
                    return seccion;
                })
            };
            if (this.formToUpdate) { // if update
                this.formToUpdate = {
                    ...this.formToUpdate,
                    active: this.form.active,
                    snomedCode: this.isFormSnomedizable ? this.form.snomedCode : null,
                    config: this.form.config,
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

    setConfiguracion(field) {
        this.fieldToConfig = field;
        if (!field.items) {
            field.items = [];
        }
        this.fieldStatic = field;
    }

    setDependencyData() {
        this.dependencyData = [];
        this.form.fields.forEach(field => {
            if (field.type.id === 'boolean' && field.key !== this.fieldToConfig.key) {
                this.dependencyData.push({ id: field.key, nombre: field.label });
            }
        });
    }

    close() {
        this.fieldToConfig = null;
        this.formToConfig = null;
    }

    setFieldType(f) {
        const typeField = f.type.id ? f.type.id : f.type;
        const resourceField = f.resources.id ? f.resources.id : f.resources;
        f.type = this.tiposList.find(t => t?.id.toString() === typeField.toString()) as any;
        if ((f.type as any)?.id === 'select') {
            f.resources = this.recursos.find(t => t?.id.toString() === resourceField.toString()) as any;
        }
    }

    loadPresetSection(section) {
        const fields = [...section.fields];
        if (this.seccionesInForm && this.seccionesInForm.find(s => s.seccion === section.id)) {
            return this.plex.toast('danger', 'La sección ya se ha agregado al formulario');
        }
        this.seccionesInForm.push(
            {
                seccion: section.id,
                cantidad: fields.length
            });
        const sec: any = this.secciones.find(s => s.id === section.id);
        sec.preset = section.preset;
        fields.forEach(f => {
            f.sections = [sec];
            this.setFieldType(f);
        });

        this.form.fields = [...this.form.fields, ...fields];
    }

    setSnvs() {
        this.formToConfig = this.form;
    }

    changeSnomedBool() {
        if (!this.isFormSnomedizable) {
            this.form.snomedCode = null;
            this.formControl.controls.snomed.markAsPristine();
        }
    }
}
