export class BlogError extends Error {
    constructor(message: string, public statusCode: number) {
      super(message);
      this.name = "BlogError";
    }
  }
  