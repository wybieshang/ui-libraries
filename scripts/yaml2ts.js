const YAML = require('yaml');
const XlsxPopulate = require('xlsx-populate');
const fs = require('fs-extra');
const path = require('path');
const json5 = require('json5');
const { components, components0 } = require('./common/loadComponents');

/**
 * 中划线格式 转 驼峰格式  kebab-case -> PascalCase
 * @param name 原名称
 * @return 转换后的名称
 */
const kebab2Pascal = (name) => name.replace(/(?:^|-)([a-zA-Z0-9])/g, (m, $1) => $1.toUpperCase());
const kebab2Camel = (name) => name.replace(/(?:-)([a-zA-Z0-9])/g, (m, $1) => $1.toUpperCase());
const firstUpperCase = (name) => name.replace(/^[a-z]/, (m) => m.toUpperCase());
const notNil = (value) => value !== null && value !== undefined;
const indent = (n) => '    '.repeat(n);

XlsxPopulate.fromBlankAsync().then((workbook) => {
    // labels
    components.forEach((component) => {
        const output = `/// <reference types="nasl" />

namespace nasl.ui {
${component.subs.map((sub) => {
    const className = kebab2Pascal(sub.name);
    const typeParamsStr = sub.tsTypeParams ? `<${sub.tsTypeParams}>` : '';
    const typeArgumentsStr = typeParamsStr.replace(/\s+extends\s+.+?(?=,|>)/g, '');

    return `${indent(1)}@Component({
        title: '${sub.title}',${sub.icon ? `
        icon: '${sub.icon}',` : ''}${sub.description ? `
        description: '${sub.description}',` : ''}
    })
    ${sub.advanced ? '' : 'export '}class ${className}${typeParamsStr} extends VueComponent {${''}${!sub.methods ? '' : `

` + sub.methods.map((method) => {
        return `${indent(2)}@Method({
            title: '${method.title}',${method.description ? `
            description: '${method.description}',` : ''}
        })
        ${method.advanced ? 'private ' : ''}${method.name}(${!(method.params && method.params.length) ? '' : method.params.map((param) => {
            let paramType = param.type
                .replace(/\bstring\b/g, 'nasl.core.String')
                .replace(/\bnumber\b/g, 'nasl.core.Decimal')
                .replace(/\bboolean\b/g, 'nasl.core.Boolean')
                .replace(/\bany\b/g, 'nasl.core.Any')
                .replace(/\s*,\s*/g, ' | ');
            if (param.options) {
                paramType = param.options.map((option) => `'${option.value}'`).join(' | ');
            }

            return `
            @Param({
                title: '${param.title}',${param.description ? `
                description: '${param.description}',` : ''}${param.options ? `
                setter: {
                    type: 'enumSelect',
                    titles: [${param.options.map((option) => (option.title || option.name).includes?.(`'`) ? `"${option.title || option.name}"` : json5.stringify(option.title || option.name)).join(', ')}],
                },` : ''}
            })
            ${param.name}${param.required === false && !notNil(param.default) ? '?' : ''}: ${paramType}${notNil(param.default) ? ` = ${json5.stringify(param.default)}` : ''},`;
        }).join('') + '\n        '}): void {}`;
    }).join('\n\n')}
        constructor(options?: Partial<${className}Options${typeArgumentsStr}>) { super(); }
    }

    ${sub.advanced ? '' : 'export '}class ${className}Options${typeParamsStr} {
${!sub.attrs ? '' : sub.attrs.map((attr) => {
    const syncMode = ({ '11': 'both', '10': 'onlyModel', '01': 'onlySync', '00': '' })[Number(!!attr.model) + '' + Number(!!attr.sync)];
    let attrType = attr.type
        .replace(/\bstring\b/g, 'nasl.core.String')
        .replace(/\bnumber\b/g, 'nasl.core.Decimal')
        .replace(/\bboolean\b/g, 'nasl.core.Boolean')
        .replace(/\bany\b/g, 'nasl.core.Any')
        // .replace(/'/g, '\\\'');
    if (/\{\[/.test(attrType))
        attrType = attrType.replace(/\s*,\s*/g, ' | ');
    if (attr.options) {
        attrType = attr.options.map((option) => `'${option.value}'`).join(' | ');
        attr.options.forEach((option) => {
            if (!option.value)
                console.log(component.yamlPath, option);
        });
    }
    let ifcondition = '';
    if (attr.dependency) {
        ifcondition = attr.dependency.map((dep) => {
            return Object.keys(dep).map((key) => {
                let first = key[0];
                if (first === '!' || first === '+') {
                    key = key.slice(1);
                    return `_.${kebab2Camel(key)} !== ${json5.stringify(dep[key])}`;
                } else {
                    return `_.${kebab2Camel(key)} === ${json5.stringify(dep[key])}`;
                }
            }).join(' && ');
        }).join(' || ');
    } else if (attr.depProp) {
        ifcondition = attr.depProp.map((dep) => {
            return `_.${kebab2Camel(dep.name)} === ${json5.stringify(dep.value)}`;
        }).join(' || ');
    }
    let onToggle = '';
    if (attr.toggleclear) {
        onToggle = `\n                { update: { ${attr.toggleclear.map((key) => `${key}: null`).join(', ')} } }`;
    } else if (attr.toggleupdate) {
        attr.toggleupdate.forEach((item) => {
            onToggle += `\n                { update: ${json5.stringify(item.updateData)}, if: _ => _ === ${json5.stringify(item.value)} },`;
        });
    }

    return `${indent(2)}@Prop${attr.display || ifcondition || onToggle ? `<${className}Options${typeArgumentsStr}, ${attr.advanced || attr.hidden ? 'any' : `'${kebab2Camel(attr.name)}'`}>` : ''}({${attr.group ? `
            group: '${attr.group}',` : ''}
            title: '${attr.title}',${attr.description ? `
            description: '${attr.description}',` : ''}${syncMode ? `
            syncMode: '${syncMode}',` : ''}${attr.tooltipLink ? `
            tooltipLink: '${attr.tooltipLink}',` : ''}${attr.docDescription ? `
            docDescription: '${attr.docDescription}',` : ''}${notNil(attr.bindHide) ? `
            bindHide: ${attr.bindHide},` : ''}${notNil(attr.bindOpen) ? `
            bindOpen: ${attr.bindOpen},` : ''}${notNil(attr['designer-value']) ? `
            designerValue: ${attr['designer-value']},` : ''}${attr.setter ? `
            setter: {
                type: '${attr.setter}',
            },` : ''}${attr.options && !attr.display ? `
            setter: {
                type: 'enumSelect',
                titles: [${attr.options.map((option) => (option.title || option.name).includes?.(`'`) ? `"${option.title || option.name}"` : json5.stringify(option.title || option.name)).join(', ')}],
            },` : ''}${attr.display === 'capsules' ? `
            setter: {
                type: 'capsules',
                titles: [${attr.options.map((option) => (option.title || option.name).includes?.(`'`) ? `"${option.title || option.name}"` : json5.stringify(option.title || option.name)).join(', ')}],
                icons: [${attr.options.map((option) =>json5.stringify(option.icon)).join(', ')}],
                tooltips: [${attr.options.map((option) =>json5.stringify(option.tooltip)).join(', ')}],
            },` : ''}${attr.display === 'number' ? `
            setter: {
                type: 'numberInput',${attr.place ? `
                placeholder: '${attr.place}',` : ''}${attr.min ? `
                min: ${attr.min},` : ''}${attr.max ? `
                max: ${attr.max},` : ''}${attr.precision ? `
                precision: ${attr.precision},` : ''}
            },` : ''}${attr.display === 'property-select' ? `
            setter: {
                type: 'propertySelect',
            },` : ''}${!attr.display && attr.place ? `
            setter: {
                type: 'input',
                placeholder: '${attr.place}',
            },` : ''}${ifcondition && !attr.dependencyDisplay ? `
            if: _ => ${ifcondition},` : ''}${ifcondition && attr.dependencyDisplay ? `
            disabledIf: _ => ${ifcondition},` : ''}${onToggle ? `
            onToggle: [${onToggle}
            ],` : ''}
        })
        ${attr.advanced || attr.hidden ? 'private ' : ''}${kebab2Camel(attr.name)}: ${attrType}${notNil(attr.default) ? ` = ${json5.stringify(attr.default)}` : ''};`
    }).join('\n\n')}${!sub.events ? '' : `

` + sub.events.map((event) => {
        return `${indent(2)}@Event({
            title: '${event.title}',${event.description ? `
            description: '${event.description}',` : ''}
        })
        ${event.advanced ? 'private ' : ''}on${kebab2Pascal(event.name)}(${!(event.params && event.params.length) ? '' : event.params
            .slice(0, 1).filter((param) => !param.name.includes('.')).map((param) => {
            let paramName = param.name;
            if (paramName === '$event')
                paramName = 'event';

            let paramType = !param.type ? 'BaseEvent' : param.type;
            if (param.schema?.$ref)
                paramType = param.schema.$ref.split('/').pop();
            paramType
                .replace(/\bstring\b/g, 'nasl.core.String')
                .replace(/\bnumber\b/g, 'nasl.core.Decimal')
                .replace(/\bboolean\b/g, 'nasl.core.Boolean')
                .replace(/\bany\b/g, 'nasl.core.Any')
                .replace(/\s*,\s*/g, ' | ');
            if (paramType.endsWith('Event'))
                paramType = `nasl.ui.${paramType}`;
            if (param.options) {
                paramType = param.options.map((option) => `'${option.value}'`).join(' | ');
            }

            return `${paramName}${param.required === false ? '?' : ''}: ${paramType}`;
            }).join(', ')}): void {}`
        }).join('\n\n')}${!sub.slots ? '' : `

` + sub.slots.map((slot) => {
        let paramName = slot.slotProps?.name;
        let paramTypeArg = slot.slotProps?.typeAnnotation?.typeArguments?.[0].typeName;
        let paramType = slot.slotProps?.typeAnnotation?.typeName + (paramTypeArg ? `<${paramTypeArg}>` : '');

        return `${indent(2)}@Slot({
            title: '${slot.title}',${slot.description ? `
            description: '${slot.description}',` : ''}${slot['empty-background'] ? `
            emptyBackground: ${json5.stringify(slot['empty-background'])},` : ''}${!slot.support ? '' : `
            snippets: ${json5.stringify(slot.support.map((item) => ({
                title: item.title,
                code: item.snippet,
            })), null, 4).replace(/\n/g, `\n${indent(3)}`)},`}
        })
        ${slot.advanced ? 'private ' : ''}slot${kebab2Pascal(slot.name)}: (${!slot.slotProps ? '' : `${paramName}: ${paramType}`}) => Array<${slot.support ? slot.support.map((item) => kebab2Pascal(item.name) + (item.tsTypeArgument ? `<${item.tsTypeArgument}>` : '')).join(' | ') : 'VueComponent'}>;`
        }).join('\n\n')}
    }`;
}).join('\n\n')}
}
`

        const tsPath = component.yamlPath.replace(/\.yaml$/, '.ts');
        const dtsPath = component.yamlPath.replace(/\.yaml$/, '.d.ts');
        fs.removeSync(dtsPath);
        fs.writeFileSync(tsPath, output);
    });
});
