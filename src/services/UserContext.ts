// eslint-disable-next-line no-unused-vars
import { UserModel } from '../types/Types';

export interface IUserContext{
    getCurrentUser():UserModel | undefined;
    onUserChanged(user: UserModel | undefined): void;

    onImageAdded(imageSize: number): void;
    onImageRemoved(imageSize: number): void;

    registerOnUserStorageSizeChanged(listener: (newUserStorageSize: number) => void):void;
    unregisterOnUserStorageSizeChanged(listener: (newUserStorageSize: number) => void):void;

    registerOnUserChanged(listener: (newUser: UserModel | undefined) => void):void;
    unregisterOnUserChanged(listener: (newUser: UserModel | undefined) => void):void;
}

class UserContext implements IUserContext {
    private user:UserModel | undefined = undefined;

    private userStorageSizeListeners: ((newUserStorageSize: number) => void)[] = [];

    private userListeners: ((newUser: UserModel | undefined) => void)[] = [];

    getCurrentUser():UserModel | undefined {
      return this.user;
    }

    onUserChanged(user: UserModel | undefined) {
      this.user = user;
      this.triggerOnUserChanged();
      this.triggerOnUserStorageSizeChanged();
    }

    registerOnUserStorageSizeChanged(listener: (newUserStorageSize: number) => void):void{
      this.userStorageSizeListeners.push(listener);
    }

    unregisterOnUserStorageSizeChanged(listenerToRemove: (newUserStorageSize: number) => void):void{
      // eslint-disable-next-line max-len
      this.userStorageSizeListeners = this.userStorageSizeListeners.filter((listener) => listener !== listenerToRemove);
    }

    registerOnUserChanged(listener: (newUser: UserModel | undefined) => void):void{
      this.userListeners.push(listener);
    }

    unregisterOnUserChanged(listenerToRemove: (newUser: UserModel | undefined) => void):void{
      this.userListeners = this.userListeners.filter((listener) => listener !== listenerToRemove);
    }

    onImageAdded(imageSize: number): void{
      if (this.user !== undefined) {
        this.user.imageFolderSizeInByte += imageSize;
        this.triggerOnUserStorageSizeChanged();
      }
    }

    onImageRemoved(imageSize: number): void{
      if (this.user !== undefined) {
        this.user.imageFolderSizeInByte -= imageSize;
        this.triggerOnUserStorageSizeChanged();
      }
    }

    triggerOnUserStorageSizeChanged(): void {
      const userImageFolderSize = this.user !== undefined ? this.user.imageFolderSizeInByte : 0;
      this.userStorageSizeListeners.map((listener) => listener(userImageFolderSize));
    }

    triggerOnUserChanged(): void {
      this.userListeners.map((listener) => listener(this.user));
    }
}

const userContext:IUserContext = new UserContext();
export default userContext;
