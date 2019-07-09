TypeScript Vue Form
-------------------

Proof of concept package hacked together quickly, not recommended to use during production yet...

## Premise / idea

I wanted to create an implementation of [vform](https://github.com/cretueusebiu/vform) using TypeScript. After delving into
the vform code, I discovered it used `Object.assign()` to add the properties from the form data directly to the class. This provided an interesting problem in TypeScript, which led me to develop this package using a slightly different approach to `vform`

Rather than tacking the properties on to the object, I went for a different approach. I maintain a property of the original data, and a one just of the changes, then use `Object.defineProperty()` to add a getter and setter for each key on the data. One thing this does not do right now is handle nested data or arrays, while I have no doubt that it will be possible, for this proof of concept I didn't feel like it was needed.

### Request Handler

The next thing I did was to do away with the dependency for `axios`, and instead require users to set their request handler function themselves, enabling them to implement whatever http client of their choosing.

The request handler needs to follow the contract

```typescript
import VForm, { RequestMethod, RequestException, ResponseData, RequestHandler } from '@willishq/ts-vform';



form.setRequestHandler(async function<T>(method: RequestMethod, url: string, data: Partial<T>): Promise<ResponseData<T>> {
    return {
        method, url, data
    };
});
```

