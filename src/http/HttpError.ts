export default class HttpError extends Error {
  private readonly date:Date;
  public readonly data:any;

  constructor(data: any, ...params:any) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }

    // Custom debugging information
    this.data = data;
    this.date = new Date();
  }
}