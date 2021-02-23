/* eslint-disable no-unused-vars */
import { UserModel } from '../types/Types';

export interface IUserContext{
    getCurrentUser():UserModel | undefined;
    onUserChanged(user: UserModel | undefined): Promise<void>;

    onImageAdded(imageSize: number): void;
    onImageRemoved(imageSize: number): void;

    registerOnUserStorageSizeChanged(listener: (newUserStorageSize: number) => void):void;
    unregisterOnUserStorageSizeChanged(listener: (newUserStorageSize: number) => void):void;

    registerOnUserChanged(listener: (newUser: UserModel | undefined) => Promise<void>):void;
    unregisterOnUserChanged(listener: (newUser: UserModel | undefined) => void):void;
}

class UserContext implements IUserContext {
    private user:UserModel | undefined = undefined;

    private userStorageSizeListeners: ((newUserStorageSize: number) => void)[] = [];

    private userListeners: ((newUser: UserModel | undefined) => Promise<void>)[] = [];

    getCurrentUser():UserModel | undefined {
      return this.user;
    }

    onUserChanged = async (user: UserModel | undefined): Promise<void> => {
      this.user = user;
      await this.triggerOnUserChanged();
      this.triggerOnUserStorageSizeChanged();
    }

    registerOnUserStorageSizeChanged(listener: (newUserStorageSize: number) => void):void {
      this.userStorageSizeListeners.push(listener);
    }

    unregisterOnUserStorageSizeChanged(listenerToRemove: (newUserStorageSize: number) => void):void {
      this.userStorageSizeListeners = this.userStorageSizeListeners.filter((listener) => listener !== listenerToRemove);
    }

    registerOnUserChanged(listener: (newUser: UserModel | undefined) => Promise<void>):void {
      this.userListeners.push(listener);
    }

    unregisterOnUserChanged(listenerToRemove: (newUser: UserModel | undefined) => void):void {
      this.userListeners = this.userListeners.filter((listener) => listener !== listenerToRemove);
    }

    onImageAdded(imageSize: number): void {
      if (this.user !== undefined) {
        this.user.imageFolderSizeInByte += imageSize;
        this.triggerOnUserStorageSizeChanged();
      }
    }

    onImageRemoved(imageSize: number): void {
      if (this.user !== undefined) {
        this.user.imageFolderSizeInByte -= imageSize;
        this.triggerOnUserStorageSizeChanged();
      }
    }

    private triggerOnUserStorageSizeChanged(): void {
      const userImageFolderSize = this.user !== undefined ? this.user.imageFolderSizeInByte : 0;
      this.userStorageSizeListeners.map((listener) => listener(userImageFolderSize));
    }

    private async triggerOnUserChanged(): Promise<void> {
      const promises = this.userListeners.map((listener) => listener(this.user));
      await Promise.all(promises);
    }
}

const userContext:IUserContext = new UserContext();
export default userContext;
