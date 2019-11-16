
export interface IErrorService{
    addError(error: Error): void;
    removeError(errorToDelete: Error): void;

    registerOnListErrorChanged(listener: (errors: Error[]) => void):void;
    unregisterOnListErrorChanged(listenerToRemove: (errors: Error[]) => void):void;
}

class ErrorService implements IErrorService {
    private errors:Error[] = [];

    private listeners: ((errors: Error[]) => void)[] = [];

    registerOnListErrorChanged(listener: (errors: Error[]) => void):void{
      this.listeners.push(listener);
    }

    unregisterOnListErrorChanged(listenerToRemove: (errors: Error[]) => void):void{
      this.listeners = this.listeners.filter((listener) => listener !== listenerToRemove);
    }

    addError(error: Error): void{
      this.errors.push(error);
      this.triggerOnListErrorChanged();
    }

    removeError(errorToDelete: Error): void{
      this.errors = this.errors.filter((error) => error !== errorToDelete);
      this.triggerOnListErrorChanged();
    }

    triggerOnListErrorChanged(): void {
      this.listeners.map((listener) => listener(this.errors));
    }
}

const errorService:IErrorService = new ErrorService();
export default errorService;
