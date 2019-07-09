import "mocha";
import { expect } from "chai";
import VForm, { ValidationErrors, RequestMethod, ResponseData } from "./";

interface TestModel {
    name: string;
    age: number;
}

describe("VForm", function () {
    it ("can instantiate a form with a model interface", function () {
        const form = new VForm<TestModel>({
            name: 'Andrew',
            age: 35
        });

        expect(form.name).to.equal('Andrew');
        expect(form.age).to.equal(35);
    });

    it ("can set properties defined in the model", function () {
        const form = new VForm<TestModel>({
            name: 'Andrew',
            age: 35
        });

        expect(form.isDirty()).to.equal(false);
        form.name = "Mad Bob";

        expect(form.isDirty()).to.equal(true);
        expect(form.name).to.equal('Mad Bob');
        expect(form.age).to.equal(35);
    });


    it ("can not set properties not defined in the model", function () {
        const form = new VForm<TestModel>({
            name: 'Andrew',
            age: 35
        });
        expect(() => {
            form.height = 100;
        }).to.throw("Cannot add property height, object is not extensible")
    });

    it ("can reset the data on the form", function () {
        const form = new VForm<TestModel>({
            name: 'Andrew',
            age: 35
        });

        form.name = "Mad Bob";

        expect(form.isDirty()).to.equal(true);

        form.reset();



        expect(form.isDirty()).to.equal(false);
        expect(form.name).to.equal('Andrew');
    });

    it ("can post a form", async function () {
        const form = new VForm<TestModel>({
            name: 'Andrew',
            age: 35
        });

        form.name = "Mad Bob";

        let response = await form.post('users');

        expect(response.method).to.equal(RequestMethod.POST);
        expect(form.wasSuccessful()).to.equal(true);
        expect(response.url).to.equal('users');
        expect(response.data).to.deep.equal({
            name: 'Mad Bob',
            age: 35
        });
    });

    it ("can override the default request handler", async function () {
        const form = new VForm<TestModel>({
            name: 'Andrew',
            age: 35
        });

        form.setRequestHandler(async function<T>(method: RequestMethod, url: string, data: Partial<T>): Promise<ResponseData<T>> {
            expect(form.isBusy()).to.equal(true);
            return {
                overridden: true,
                method, url, data
            };
        });

        let response = await form.post('users');
        expect(form.isBusy()).to.equal(false);
        expect(response.overridden).to.equal(true);
        expect(response.method).to.equal(RequestMethod.POST);
        expect(response.url).to.equal('users');
        expect(response.data).to.deep.equal({
            name: 'Andrew',
            age: 35
        });
    });


    it("can make a put request", async function () {
        const form = new VForm<TestModel>({
            name: 'Andrew',
            age: 35
        });

        form.name = 'Mad Bob';

        let response = await form.put('users/123');

        expect(response.method).to.equal(RequestMethod.PUT);
        expect(response.url).to.equal('users/123');
        expect(response.data).to.deep.equal({
            name: 'Mad Bob',
            age: 35
        });
    });

    it("can patch changes to a resource", async function () {
        const form = new VForm<TestModel>({
            name: 'Andrew',
            age: 35
        });

        form.name = 'Mad Bob';

        let response = await form.patch('users/123');

        expect(response.method).to.equal(RequestMethod.PATCH);
        expect(response.url).to.equal('users/123');
        expect(response.data).to.deep.equal({
            name: 'Mad Bob',
        });
    });

    it("can handle validation error responses", async function () {
        const form = new VForm<TestModel>({
            name: 'Andrew',
            age: 35
        });

        form.setRequestHandler(async function <T>(method?: RequestMethod, url?: string, data?: Partial<T>): Promise<ResponseData<T>> {
            const errors: ValidationErrors = {
                statusCode: 422,
                message: 'Validation Failed',
                errors: {
                    name: ['Must Be Boris']
                }
            };
            expect(form.isBusy()).to.equal(true);
            throw errors;
        });

        expect(form.hasErrors()).to.equal(false);

        await form.post('users');
        expect(form.wasSuccessful()).to.equal(false);
        expect(form.hasErrors()).to.equal(true);
        expect(form.isBusy()).to.equal(false);
        expect(form.hasError('name')).to.equal(true);
        expect(form.hasError('age')).to.equal(false);
        const errors = form.getErrors('name');
        expect(errors).to.length(1);
        expect(errors[0]).to.equal('Must Be Boris');
    });
});
