import * as babel from '@babel/core';
import * as babelTypes from '@babel/types';
import generate from '@babel/generator';
import * as astTypes from '@nasl/types/nasl.ui.ast';

export function evalOptions(object: babelTypes.ObjectExpression) {
    const code = generate(object).code;
    const result = eval(`(${code})`);
    if (result.if)
        result.if = result.if.toString();
    if (result.disabledIf)
        result.disabledIf = result.disabledIf.toString();
    if (result.onToggle) {
        result.onToggle.forEach((item: { update: any, if?: string }) => {
            if (item.if)
                item.if = item.if.toString();
        });
    }
    return result;
}

export function transform(tsCode: string): astTypes.ViewComponentDeclaration[] {
    const root = babel.parseSync(tsCode, {
        filename: 'result.ts',
        presets: [
            require('@babel/preset-typescript'),
        ],
        plugins: [
            [require('@babel/plugin-proposal-decorators'), { legacy: true }],
            // 'babel-plugin-parameter-decorator'
        ]
    }) as babelTypes.File;

    const programBody = root.program.body;
    let blockOrDecl: babelTypes.TSModuleDeclaration | babelTypes.TSModuleBlock = programBody.find((stat) => stat.type === 'TSModuleDeclaration') as babelTypes.TSModuleDeclaration;
    while (blockOrDecl && blockOrDecl.type === 'TSModuleDeclaration') {
        blockOrDecl = blockOrDecl.body;
    }
    if (!blockOrDecl)
        return [];

    const mainBody = (blockOrDecl as babelTypes.TSModuleBlock).body;
    /**
     * 组件名：[组件 class, 组件选项 class]
     */
    const classMap: Map<string, [babelTypes.ClassDeclaration, babelTypes.ClassDeclaration]> = new Map();
    mainBody.forEach((statement) => {
        let classDecl: babelTypes.ClassDeclaration;
        if (statement.type === 'ExportNamedDeclaration') {
            classDecl = statement.declaration as babelTypes.ClassDeclaration;
        } else if (statement.type === 'ClassDeclaration') {
            classDecl = statement as babelTypes.ClassDeclaration;
        } else {
            return;
        }
        if (classDecl.id.name.endsWith('Options')) {
            const className = classDecl.id.name.replace(/Options$/, '');
            let classItem = classMap.get(className);
            if (!classItem) {
                classItem = [null, classDecl];
                classMap.set(className, classItem);
            } else {
                classItem[1] = classDecl;
            }
        } else {
            const className = classDecl.id.name;
            if ((classDecl.superClass as babelTypes.Identifier).name === 'ViewComponent') {
                let classItem = classMap.get(className);
                if (!classItem) {
                    classItem = [classDecl, null];
                    classMap.set(className, classItem);
                } else {
                    classItem[0] = classDecl;
                }
            }
        }
    });

    // forEach classMap
    const result: astTypes.ViewComponentDeclaration[] = [];
    let index = 0;
    classMap.forEach((classItem, className) => {
        const [classDecl, optionsDecl] = classItem;
        if (!classDecl)
            return;

        const component: astTypes.ViewComponentDeclaration = {
            concept: 'ViewComponentDeclaration',
            group: '',
            // VanRouterView
            name: className, 
            // van-router-view
            kebabName: className.replace(/([A-Z])/g, (m, $1) => '-' + $1.toLowerCase()).replace(/^-/, ''),
            title: '',
            description: '',
            icon: '',
            tsTypeParams: undefined,
            props: [],
            readableProps: [],
            events: [],
            methods: [],
            slots: [],
            children: [],
            blocks: [],
            themeVariables: [],
        };

        classDecl.decorators.forEach((decorator) => {
            if (decorator.expression.type === 'CallExpression' && (decorator.expression.callee as babelTypes.Identifier).name === 'Component') {
                decorator.expression.arguments.forEach((arg) => {
                    if (arg.type === 'ObjectExpression')
                        Object.assign(component, evalOptions(arg));
                });
            }
        });

        {
            const classTypeParams = generate(babelTypes.tsInterfaceDeclaration(
                babelTypes.identifier('Wrapper'),
                classDecl.typeParameters as babelTypes.TSTypeParameterDeclaration,
                [],
                babelTypes.tsInterfaceBody([]),
            )).code.replace(/^interface Wrapper<?/, '').replace(/>? {}$/, '');
            const optionsTypeParams = generate(babelTypes.tsInterfaceDeclaration(
                babelTypes.identifier('Wrapper'),
                optionsDecl.typeParameters as babelTypes.TSTypeParameterDeclaration,
                [],
                babelTypes.tsInterfaceBody([]),
            )).code.replace(/^interface Wrapper<?/, '').replace(/>? {}$/, '');
            if (classTypeParams !== optionsTypeParams)
                throw new Error(`组件的${className}泛型类型参数不匹配！`);

            component.tsTypeParams = classTypeParams;
        }

        optionsDecl.body.body.forEach((member) => {
            if (member.type === 'ClassProperty') {
                member.decorators.forEach((decorator) => {
                    if (decorator.expression.type === 'CallExpression') {
                        const calleeName = (decorator.expression.callee as babelTypes.Identifier).name;
                        if (calleeName === 'Prop') {
                            const prop: astTypes.PropDeclaration = {
                                concept: 'PropDeclaration',
                                group: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'group') as astTypes.PropDeclaration['group'] || '主要属性',
                                sync: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'sync') as astTypes.PropDeclaration['sync'],
                                bindHide: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'bindHide') as astTypes.PropDeclaration['bindHide'],
                                bindOpen: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'bindOpen') as astTypes.PropDeclaration['bindOpen'],
                                tabKind: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'tabKind') as astTypes.PropDeclaration['tabKind'] || 'property',
                                setter: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'setter') as astTypes.PropDeclaration['setter'],
                                name: (member.key as babelTypes.Identifier).name,
                                title: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'title') as astTypes.PropDeclaration['title'],
                                tsType: generate((member.typeAnnotation as babelTypes.TSTypeAnnotation).typeAnnotation).code,
                            };
                            // @TODO: default
                            // @TODO: private
                            decorator.expression.arguments.forEach((arg) => {
                                if (arg.type === 'ObjectExpression')
                                    Object.assign(prop, evalOptions(arg));
                            });

                            // 枚举类型生成选项
                            if (['EnumSelectSetter', 'CapsulesSetter'].includes(prop?.setter?.concept)) {
                                const types = prop?.tsType.split('|').map((type) => type.replace(/(\'|\")/g, '').trim());
                                // @ts-ignore
                                prop?.setter?.options = prop?.setter?.options?.map((option: any, idx) => {
                                    return {
                                        ...option,
                                        value: types[idx],
                                    }
                                })
                            }

                            component.props.push(prop);
                        } else if (calleeName === 'Event') {
                            const event: astTypes.EventDeclaration = {
                                concept: 'EventDeclaration',
                                name: (member.key as babelTypes.Identifier).name.replace(/^on(\w)/, (m, $1) => $1.toLowerCase()),
                                title: '',
                                tsType: generate((member.typeAnnotation as babelTypes.TSTypeAnnotation).typeAnnotation).code,
                            };
                            decorator.expression.arguments.forEach((arg) => {
                                if (arg.type === 'ObjectExpression')
                                    Object.assign(event, evalOptions(arg));
                            });
                            component.events.push(event);
                        } else if (calleeName === 'Slot') {
                            const slot: astTypes.SlotDeclaration = {
                                concept: 'SlotDeclaration',
                                snippets: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'snippets') as astTypes.SlotDeclaration['snippets'],
                                name: (member.key as babelTypes.Identifier).name.replace(/^slot(\w)/, (m, $1) => $1.toLowerCase()),
                                title: '',
                                tsType: generate((member.typeAnnotation as babelTypes.TSTypeAnnotation).typeAnnotation).code,
                            };
                            decorator.expression.arguments.forEach((arg) => {
                                if (arg.type === 'ObjectExpression')
                                    Object.assign(slot, evalOptions(arg));
                            });
                            component.slots.push(slot);
                        }
                    }
                });
            }
        });

        classDecl.body.body.forEach((member) => {
            if (member.type === 'ClassProperty') {
                member.decorators?.forEach((decorator) => {
                    if (decorator.expression.type === 'CallExpression') {
                        const calleeName = (decorator.expression.callee as babelTypes.Identifier).name;
                        if (calleeName === 'Prop') {
                            const prop: astTypes.PropDeclaration = {
                                concept: 'PropDeclaration',
                                group: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'group') as astTypes.PropDeclaration['group'] || '主要属性',
                                sync: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'sync') as astTypes.PropDeclaration['sync'],
                                bindHide: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'bindHide') as astTypes.PropDeclaration['bindHide'],
                                bindOpen: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'bindOpen') as astTypes.PropDeclaration['bindOpen'],
                                tabKind: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'tabKind') as astTypes.PropDeclaration['tabKind'] || 'property',
                                setter: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'setter') as astTypes.PropDeclaration['setter'],
                                name: (member.key as babelTypes.Identifier).name,
                                title: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'title') as astTypes.PropDeclaration['title'],
                                tsType: generate((member.typeAnnotation as babelTypes.TSTypeAnnotation).typeAnnotation).code,
                            };
                            // @TODO: default
                            // @TODO: private
                            decorator.expression.arguments.forEach((arg) => {
                                if (arg.type === 'ObjectExpression')
                                    Object.assign(prop, evalOptions(arg));
                            });
                            component.readableProps.push(prop);
                        }
                    }
                });
            } else if (member.type === 'ClassMethod') {
                member.decorators?.forEach((decorator) => {
                    if (decorator.expression.type === 'CallExpression') {
                        const calleeName = (decorator.expression.callee as babelTypes.Identifier).name;
                        if (calleeName === 'Method') {
                            const method: astTypes.LogicDeclaration = {
                                concept: 'LogicDeclaration',
                                description: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'description') as astTypes.LogicDeclaration['description'],
                                params: [],
                                returns: [],
                                name: (member.key as babelTypes.Identifier).name,
                                title: getValueFromObjectExpressionByKey(decorator.expression.arguments[0] as babelTypes.ObjectExpression, 'title') as astTypes.LogicDeclaration['title'],
                                // type: generate((member. as babelTypes.TSTypeAnnotation).typeAnnotation).code,
                            };
                            // @TODO: private
                            decorator.expression.arguments.forEach((arg) => {
                                if (arg.type === 'ObjectExpression')
                                    Object.assign(method, evalOptions(arg));
                            });
                            component.methods.push(method);
                        }
                    }
                });
            }
        });

        if (index === 0) {
            result.push(component);
        } else {
            const parent = result[0];
            parent.children.push(component);
        }

        index++;
    });
    return result;
}

function getValueFromObjectExpressionByKey(object: babelTypes.ObjectExpression, key: string): unknown {
    const property = object.properties.find((prop) => prop.type === 'ObjectProperty' && (prop.key as babelTypes.Identifier).name === key) as babelTypes.ObjectProperty;
    if (!property)
        return undefined;
    return generate(property.value).code;
}