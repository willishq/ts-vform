import { FormErrors, ErrorMessages, RequestHandler, RequestMethod, ResponseData } from './';

export default class VForm<M> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any; 
    private _original: M
    private _changes: Partial<M> = {}
    private _errors: FormErrors = new FormErrors();
    private _busy: boolean = true;
    private _success: boolean = false;
    private _message: string = '';


    private _requestHandler: RequestHandler<M> = async (method: RequestMethod, url: string, data: Partial<M>): Promise<ResponseData<M>> => {
        return { method, url, data };
    }

    public constructor(original: M) {
        this._original = original;
        Object.keys(this._original).forEach((key: string): void => this.addDataToClass(key));
        Object.seal(this);
    }

    public setRequestHandler(requestHandler: RequestHandler<M>): void {
        this._requestHandler = requestHandler;
    }

    private addDataToClass(key: string): void {
        Object.defineProperty(this, key, {
            get(): string | number {
                return this._data[key];
            },
            set(value: string|number): void {
                this._changes[key] = value;
            }
        })
    }

    private get _data(): Partial<M> {
        return Object.assign({}, this._original, this._changes)
    }

    public reset(): void {
        this._changes = {};
        this._errors.empty();
    }

    private starting(): void {
        this._success = false;
        this._busy = true;
        this._message = '';
        this._errors.empty();
    }

    private finished(success: boolean, message: string = '', errors: ErrorMessages = {}): void {
        this._success = success;
        this._busy = false;
        this._message = message;
        this._errors.fill(errors);
    }

    private async process(method: RequestMethod, url: string, data: Partial<M>): Promise<ResponseData<M>> {
        try {
            this.starting();
            const response = await this._requestHandler(method, url, data);
            this.finished(true);
            return response;
        } catch (e) {
            this.finished(false, e.message || 'There has been an unknown error', e.errors || {});
            return {};
        }
    }

    public async post(url: string): Promise<ResponseData<M>> {
        return await this.process(RequestMethod.POST, url, this._data);
    }

    public async put(url: string): Promise<ResponseData<M>> {
        return await this.process(RequestMethod.PUT, url, this._data);
    }

    public async patch(url: string): Promise<ResponseData<M>> {
        return await this.process(RequestMethod.PATCH, url, this._changes);
    }

    public hasErrors(): boolean {
        return this._errors.hasAny();
    }

    public hasError(field: string): boolean {
        return this._errors.has(field);
    }

    public getErrors(field: string): string[] {
        return this._errors.get(field);
    }


    public isDirty(): boolean {
        return Object.keys(this._changes).length !== 0;
    }

    public isBusy(): boolean {
        return this._busy;
    }

    public wasSuccessful(): boolean {
        return this._success;
    }

    public hasMessage(): boolean {
        return this._message !== '';
    }

    public flashMessage(): string {
        return this._message;
    }
}