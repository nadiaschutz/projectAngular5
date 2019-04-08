
export interface Serializable<T> {
    deserialize(input: Object): T;
}

export class AssociatedResources {

    resourceId: string;
    type: string;
}

export class Authority {

    permission: string;
    argument: string;
}

export class DefaultLaunchContext {

    contextType: string;
    resourceId: string;
}

export class UserAccount implements Serializable<UserAccount> {

    accountDisabled: boolean;
    accountExpiry: string;
    accountLocked: boolean;
    associatedResources: AssociatedResources[];
    authorities: Authority[];
    credentialExpiry: string;
    defaultLaunchContexts: DefaultLaunchContext[];
    email: string;
    familyName: string;
    givenName: string;
    notes: string;
    password: string;
    username: string;
    serviceAccount: boolean;
    nodeId: string;
    moduleId: string;

    deserialize(jsonObject: any): UserAccount {
        const that = this;
        Object.entries(jsonObject).forEach(function (value) {
            if (!(typeof value[1] === 'object')) {
                that[value[0]] = value[1];
            } else {
                (that[value[0]].deserialize(value[1]));
            }
        });
        return this;
    }
}
