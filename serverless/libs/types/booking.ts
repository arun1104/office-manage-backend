export class BookingError extends Error {
    constructor(message: string, public statusCode: number) {
      super(message);
      this.name = "BookingError";
    }
  }