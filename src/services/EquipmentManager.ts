import assetManager from './AssetManager';

// eslint-disable-next-line no-unused-vars
import { AssetModel, EquipmentModel } from '../types/Types';

export type CurrentEquipmentListener = (equipment: EquipmentModel|undefined) => void;
export type EquipmentsListener = (equipments: EquipmentModel[]) => void;

export interface IEquipmentManager{
    getEquipments(): EquipmentModel[];

    getCurrentEquipment(): EquipmentModel | undefined;
    setCurrentEquipment(equipment: EquipmentModel): void;

    onEquipmentDeleted(equipmentToDelete: EquipmentModel): void;
    onEquipmentSaved(equipmentSaved: EquipmentModel): void;

    registerOnCurrentEquipmentChanged(listener: CurrentEquipmentListener):void;
    unregisterOnCurrentEquipmentChanged(listenerToRemove: CurrentEquipmentListener):void;

    registerOnEquipmentsChanged(listener: EquipmentsListener):void;
    unregisterOnEquipmentsChanged(listenerToRemove: EquipmentsListener):void;
}

class EquipmentManager implements IEquipmentManager {
    private currentEquipmentListeners: CurrentEquipmentListener[] = [];

    private equipmentsListeners: EquipmentsListener[] = [];

    private equipments: EquipmentModel[] = [];

    private currentEquipment: EquipmentModel|undefined = undefined;

    constructor() {
      assetManager.registerOnCurrentAssetChanged(this.onCurrentAssetChanged);
    }

    // eslint-disable-next-line no-unused-vars
    private onCurrentAssetChanged = async (currentAsset: AssetModel | undefined | null) => {
      if (currentAsset) {
        const { default: equipmentProxy } = await import('./EquipmentProxy');
        this.onEquipmentsChanged(await equipmentProxy.fetchEquipments({ assetId: currentAsset._uiId }));
      } else {
        this.onEquipmentsChanged([]);
      }
    }

    getEquipments = (): EquipmentModel[] => this.equipments.concat([])

    getCurrentEquipment = (): EquipmentModel | undefined => this.currentEquipment

    setCurrentEquipment = (equipment: EquipmentModel | undefined) => {
      this.currentEquipment = equipment;
      this.currentEquipmentListeners.map((listener) => listener(this.currentEquipment));
    }

    private onEquipmentsChanged = (equipments: EquipmentModel[], newCurrentEquipment?: EquipmentModel): void => {
      this.equipments = equipments;
      this.equipmentsListeners.map((listener) => listener(this.equipments));

      if (newCurrentEquipment !== undefined) {
        this.setCurrentEquipment(newCurrentEquipment);
      } else if (this.getCurrentEquipment() === undefined) {
        this.setCurrentEquipment(this.equipments.length > 0 ? this.equipments[0] : undefined);
      } else {
        const currentEquipmentIndex = this.equipments.findIndex((eq) => eq._uiId === this.getCurrentEquipment()?._uiId);
        if (currentEquipmentIndex === -1) {
          this.setCurrentEquipment(this.equipments.length > 0 ? this.equipments[0] : undefined);
        } else {
          this.setCurrentEquipment(this.equipments[currentEquipmentIndex]);
        }
      }
    }

    onEquipmentDeleted = (equipmentToDelete: EquipmentModel): void => {
      const newEquipmentList = this.equipments.filter((equipmentInfo) => equipmentInfo._uiId !== equipmentToDelete._uiId);
      this.onEquipmentsChanged(newEquipmentList);
    }

    onEquipmentSaved = (equipmentSaved: EquipmentModel): void => {
      const index = this.equipments.findIndex((equipmentInfo) => equipmentInfo._uiId === equipmentSaved._uiId);

      const equipmentToAddOrUpdate = { ...equipmentSaved };
      if (index === -1) {
        this.equipments.push(equipmentToAddOrUpdate);
      } else {
        this.equipments[index] = equipmentToAddOrUpdate;
      }

      this.onEquipmentsChanged(this.equipments, equipmentToAddOrUpdate);
    }

    registerOnCurrentEquipmentChanged = (listener: CurrentEquipmentListener):void => {
      this.currentEquipmentListeners.push(listener);
    }

    unregisterOnCurrentEquipmentChanged = (listenerToRemove: CurrentEquipmentListener):void => {
      this.currentEquipmentListeners = this.currentEquipmentListeners.filter((listener) => listener !== listenerToRemove);
    }

    registerOnEquipmentsChanged = (listener: EquipmentsListener):void => {
      this.equipmentsListeners.push(listener);
    }

    unregisterOnEquipmentsChanged = (listenerToRemove: EquipmentsListener):void => {
      this.equipmentsListeners = this.equipmentsListeners.filter((listener) => listener !== listenerToRemove);
    }
}

const equipmentManager:IEquipmentManager = new EquipmentManager();
export default equipmentManager;
