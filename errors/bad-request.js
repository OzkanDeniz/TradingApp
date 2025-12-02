import { StatusCodes } from "http-status-codes";
import CustomaAPIError from "./custom-api";

class BadRequestError extends CustomaAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export default BadRequestError;
