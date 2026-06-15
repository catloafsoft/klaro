import React from "react";
import { List, ListHeader, ListItem, ListColumn } from "./list";
import { DropdownMenu, MenuItem } from "./dropdown";
import * as Controls from './controls';
import Spec from './spec';

const controlMap = Controls as Record<string, React.ComponentType<any>>;

const ServiceItem = ({t, service, onClick, updateConfig}: any) => <ListItem onClick={()=>onClick(service)} isCard key={service._id}>
    <ListColumn size="md">
        <p className="cm-name">{service.name}</p>
    </ListColumn>
    <ListColumn size="icon">
        <DropdownMenu>
            <MenuItem onClick={() => updateConfig(['services', service._id], null)}>
                {t(['services', 'delete'])}
            </MenuItem>
        </DropdownMenu>
    </ListColumn>
</ListItem>

const ServiceList = ({ t, config, onClick, updateConfig }: any) => {
    const services = config.services.map((service: any) => <ServiceItem key={service._id} updateConfig={updateConfig} onClick={onClick} t={t} service={service} />)
    return <React.Fragment>
        { services.length > 0 &&
        <List className="cm-service-list">
            <ListHeader>
                <ListColumn size="md">
                    {t(['services', 'name'])}
                </ListColumn>
                <ListColumn size="icon">
                    {t(['menu'])}
                </ListColumn>
            </ListHeader>
            {services}
        </List> ||
        <p className="cm-no-services">{t(['services','noServices'])}</p>
        }
    </React.Fragment>
};

const ServiceDetails = ({t, setState, service, updateServiceName, disabled, updateConfig}: any) => {
    if (service === undefined)
        return <div />
    return <div className="cm-service-details">
        <ServiceConfig setState={setState} service={service} updateServiceName={updateServiceName} disabled={disabled} t={t} updateConfig={updateConfig} />
    </div>
}

const ServiceConfig = ({ service, setState, updateServiceName, disabled, updateConfig, t }: any) => {
    const formControls = Spec.serviceConfig.map((serviceField) => {
        const ClassName = controlMap[serviceField.control];
        if (ClassName === undefined)
            return null;
        const updateServiceConfig = (k: string[], v: any) => {
            updateConfig(['services', service._id, ...k], v)
            if (k[0] === 'name')
                updateServiceName(v)
        }
        return (
            <ClassName
                disabled={disabled}
                key={serviceField.name}
                prefix={['services']}
                updateConfig={updateServiceConfig}
                config={service}
                t={t}
                field={serviceField}
                {...((serviceField as any).controlProps || {})}
            />
        );
    });

    const unsetService = () => {
        setState({service: undefined})
    }

    return (
        <React.Fragment>
            <fieldset className="cm-service-fields" disabled={disabled}>
                <h2><button type="button" className="cm-link" onClick={unsetService}>{t(['services','title'])} &rsaquo;</button> {service.name}</h2>
                {formControls}
            </fieldset>
        </React.Fragment>
    );
};

export const Services = ({ t, state, services, setState, config, disabled, updateConfig }: any) => {
    state = state || {service: undefined};
    const { service } = state
    let component
    const updateServiceName = (name: string) => setState({service: name})

    let newServices: any[] = []


    if (services !== undefined)
        newServices = services.filter((service: any) => config.services.find((configService: any) => configService.name === service.name || configService.id === service.id) === undefined)

    if (service !== undefined){
        component = <ServiceDetails setState={setState} updateServiceName={updateServiceName} disabled={disabled} t={t} updateConfig={updateConfig} service={config.services.find((ap: any) => ap.name === service)} />
    } else {
        component = <React.Fragment>
            <ServiceList
                t={t}
                config={config}
                onClick={(service: any) => setState({service: service.name})}
                updateConfig={updateConfig}
            />
            <div className="cm-config-controls">
                <fieldset>
                    <Controls.ServiceSelect services={newServices} updateConfig={updateConfig} config={config} field={{name: 'services'}} t={t} />
                </fieldset>
            </div>
        </React.Fragment>
    }
    return (
        <div className="cm-ide-services">
            <p className="cm-section-description">
                {t(['services', 'description'])}
            </p>
            {component}
        </div>
    );
};
