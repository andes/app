export interface Form {
    active: boolean;
    name: string;
    type: string;
    snomedCode: string;
    sections: Section[];
    description?: string;
}

export interface Section {
    type: string;
    name: string;
    key: string;
    fields: Field[];
}

export interface Field {
    name: string;
    key: string;
    type: {
        id: string;
        name: string;
    };
    description?: string;
    label?: string;
    options?: any[];
    required?: boolean;
    resources?: string;
    dependencies?: Dependency[];
    validations?: any[];
    min?: number;
    max?: number;
    datePeriod?: boolean;
    selectList?: SelectList[];
    multiple?: boolean;
}

export interface SelectList {
    name: string;
    id: string;
}

export interface Dependency {
    field: string;
    condition: Condition;
    action: 'show' | 'hide' | 'enable' | 'disable';
}

export interface Condition {
    type: 'equals' | 'greaterThan' | 'lessThan' | 'contains';
    value: any;
}
