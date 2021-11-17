import { Component, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { map } from 'rxjs/operators';
import { FormBuilderItemComponent } from '../form-builder-item/form-builder-item.component';
import { FormBuilderService } from '../form-builder.service';
import { IFormTemplate } from '../interfaces';

@Component({
    selector: 'lib-form-builder',
    templateUrl: './form-builder.component.html',
    providers: [FormBuilderService]
})
export class FormBuilderComponent implements OnInit, OnChanges {

    @Input() initial: any;

    @Input() template: IFormTemplate;

    @Input() readonly = false;

    @Output() change = this.formService.model$.pipe(
        map(e => ({ ...e }))
    );

    @ViewChildren(FormBuilderItemComponent) items: QueryList<FormBuilderItemComponent>;

    constructor(
        public formService: FormBuilderService
    ) { }

    ngOnInit(): void {


    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['initial']) {
            const model = changes['initial'].currentValue;
            if (model) {
                this.formService.set(model);
            }
        }
    }


    validate() {
        const b = this.items.reduce((flag, current) => flag && current.isValid() , true);
    }

}
