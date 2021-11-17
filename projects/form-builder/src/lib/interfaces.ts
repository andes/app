
export type IFormTemplate = IFormTemplateItem[];
export type IFormTemplateItem = IFormSeccion | IFormItem | IFormText | IFormInput | IFormDatetime | IFormSelect | IFormRadio | IFormBool;


export interface IFormSeccion {
    type: 'seccion';
    title: string;
    size: string;
    componentes: IFormTemplate;
    cond: any;
}

export interface IFormItem {
    key: string;
    type: 'select';
    cond: any;
}

export interface IFormText {
    type: 'texto' ;
    value: string;

    cond: any;
}

export interface IFormInput {
    key: string;
    type: 'input';
    label?: string;
    placeholder?: string;
    required?: boolean;

    cond: any;
}

export interface IFormDatetime {
    key: string;
    type: 'datetime';
    label?: string;
    placeholder?: string;
    required?: boolean;
    format: string;
    cond: any;
}


export interface IFormSelect {
    key: string;
    type: 'select';
    label?: string;
    placeholder?: string;
    required?: boolean;
    items?: any[];
    cond?: any;
    request?: any;
}

export interface IFormBool {
    key: string;
    type: 'bool';
    format: string;
    label?: string;
    cond?: any;
}

export interface IFormRadio {
    key: string;
    type: 'radio';
    label?: string;
    items: any[];
    multiple: boolean;
    orientacion?: 'vertical' | 'horizontal';
    cond?: any;

    labelField?: string;
    idField?: string;
}
