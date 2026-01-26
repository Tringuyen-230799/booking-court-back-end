import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { errorConvert } from '../utils/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse() as {
      message?: string;
    };

    const includeDebug = process.env.NODE_ENV !== 'production';

    response.status(status).json({
      statusCode: status,
      message: typeof payload === 'string' ? payload : payload?.message,
      ...(includeDebug && {
        timestamp: new Date().toISOString(),
        stack: errorConvert(exception),
      }),
    });
  }
}

// Base class to standardize message-only exceptions with fixed HttpStatus
abstract class BaseHttpException extends HttpException {
  protected constructor(status: HttpStatus, message: string) {
    super({ status, message }, status);
  }
}

export class NotFoundException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.NOT_FOUND, message);
  }
}

export class ForbiddenException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.FORBIDDEN, message);
  }
}

export class BadRequestException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}

export class UnauthorizedException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}

export class NotAcceptableException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.NOT_ACCEPTABLE, message);
  }
}

export class RequestTimeoutException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.REQUEST_TIMEOUT, message);
  }
}

export class ConflictException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, message);
  }
}

export class GoneException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.GONE, message);
  }
}

export class HttpVersionNotSupportedException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.HTTP_VERSION_NOT_SUPPORTED, message);
  }
}

export class PayloadTooLargeException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.PAYLOAD_TOO_LARGE, message);
  }
}

export class UnsupportedMediaTypeException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, message);
  }
}

export class UnprocessableEntityException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message);
  }
}

export class InternalServerErrorException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}

export class NotImplementedException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.NOT_IMPLEMENTED, message);
  }
}

export class ImATeapotException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.I_AM_A_TEAPOT, message);
  }
}

export class MethodNotAllowedException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.METHOD_NOT_ALLOWED, message);
  }
}

export class BadGatewayException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.BAD_GATEWAY, message);
  }
}

export class ServiceUnavailableException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message);
  }
}

export class GatewayTimeoutException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.GATEWAY_TIMEOUT, message);
  }
}

export class PreconditionFailedException extends BaseHttpException {
  constructor(message: string) {
    super(HttpStatus.PRECONDITION_FAILED, message);
  }
}
