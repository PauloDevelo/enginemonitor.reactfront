import { EntityModel} from './Types';

export default abstract class Entity <T extends EntityModel>
{
    protected entity: T;

    constructor(entity: T){
        this.entity = entity;
    }

    getModel():T {
        return this.entity;
    }

    protected abstract setModel(model: T):Promise<void>;

}