// eslint-disable-next-line no-unused-vars
import { AxiosError } from 'axios';

export default class HttpError extends Error {
  private readonly date:Date;

  public readonly data:any;

  public readonly internalError:Error | undefined;

  constructor(data: any, internalError?: Error, ...params:any) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }

    // Custom debugging information
    this.data = data;
    this.date = new Date();
    this.internalError = internalError;
  }

  public didConnectionAbort = ():boolean => {
    if (this.internalError !== undefined) {
      const { code } = this.internalError as AxiosError;
      if (code === 'ECONNABORTED') {
        return true;
      }
    }

    return false;
  };
}
