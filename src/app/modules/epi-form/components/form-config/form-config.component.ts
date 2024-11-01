import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
    selector: 'form-config',
    templateUrl: './form-config.component.html',
    styleUrls: ['./form-config.scss']
})
export class FormConfigComponent implements OnInit {

    @ViewChild('formulario', { static: false }) formControl: NgForm;

    public isFormSnomedizable = false;
    public form: any = {
        name: '',
        description: '',
        snomedCode: '',
        sections: []
    };
    public sidebar = false;
    public fieldToConfig = null;
    public fieldIndex: number | null = null;
    public sectionIndex: number | null = null;
    constructor(
        private auth: Auth,
        private router: Router,
    ) {}

    ngOnInit() {
        if (!this.auth.check('formBuilder:update')) {
            this.router.navigate(['inicio']);
        }
    }


    onAddSection() {
        this.form.sections.push({
            name: '',
            type: '',
            key: '',
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
        this.closeFieldConfig;
        setTimeout(() => {
            this.sectionIndex = sectionIndex;
            this.sidebar = true;
        }, 300);
    }

    onSaveField(field) {
        if (this.fieldIndex !== null) {
            this.form.sections[this.sectionIndex].fields[this.fieldIndex] = { ...field };
            this.fieldIndex = null;
        } else {
            this.form.sections[this.sectionIndex].fields.push(field);
            this.form.sections[this.sectionIndex].fields = [... this.form.sections[this.sectionIndex].fields];
        }
        this.closeFieldConfig();
    }

    onRemoveField(sectionIndex, fieldIndex) {
        this.form.sections[sectionIndex].fields.splice(fieldIndex, 1);
        this.form.sections = [...this.form.sections];
    }

    closeFieldConfig() {
        this.sectionIndex = null;
        this.fieldToConfig = null;
        this.sidebar = false;
    }

    onEditField(sectionIndex, fieldIndex) {
        this.closeFieldConfig();
        setTimeout(() => {
            this.sectionIndex = sectionIndex;
            this.fieldIndex = fieldIndex;
            this.fieldToConfig = { ...this.form.sections[sectionIndex].fields[fieldIndex] };
            this.sidebar = true;
        }, 300);
    }

    dropSection(event: CdkDragDrop<any[]>) {
        moveItemInArray(this.form.sections, event.previousIndex, event.currentIndex);
    }

    dropField(event: CdkDragDrop<any[]>, sectionIndex: number) {
        const previousSection = this.form.sections[event.previousContainer.id];
        const currentSection = this.form.sections[sectionIndex];

        if (event.previousContainer === event.container) {
            moveItemInArray(currentSection.fields, event.previousIndex, event.currentIndex);
        } else {
            console.log(event);
            transferArrayItem(
                previousSection.fields,
                currentSection.fields,
                event.previousIndex,
                event.currentIndex
            );
        }
        // if (event.previousContainer === event.container) {
        //     // Mover dentro de la misma sección
        //     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        // } else {
        //     // Mover a otra sección
        //     transferArrayItem(
        //         event.previousContainer.data,
        //         this.form.sections[sectionIndex].fields,
        //         event.previousIndex,
        //         event.currentIndex
        //     );
        // }
    }
}
