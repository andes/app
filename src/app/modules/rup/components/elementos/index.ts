interface IRUpElement {
    name: string;
    component: any;
}

const rupElement: IRUpElement[] = [];

const get = (name) => {
    return rupElement.find(item => item.name === name);
};

const register = (name, component) => {
    rupElement.push({
        name, component
    });
};

const list = () => {
    return rupElement.map(i => i.component);
};

export const ElementosRUPRegister = { get, register, list };

export function RupElement(name) {
    return function decorator(target) {
        ElementosRUPRegister.register(name, target);
    };
}
