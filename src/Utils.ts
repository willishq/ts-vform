export interface ErrorMessages {
    [key: string]: string[];

}

export interface ValidationErrors {
    statusCode: number;
    message: string;
    errors: ErrorMessages;
}


export enum RequestMethod {
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch'
}

export interface RequestException {
    statusCode(): number;
    message(): string;
}

export interface ResponseData<T> {
    [key: string]: string | number | boolean | Partial<T>;
}

export type RequestHandler<T> = (method: RequestMethod, url: string, data: Partial<T>) => Promise<ResponseData<T>>
