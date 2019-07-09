import { ErrorMessages } from "./";


export default class FormErrors {
    private messages: ErrorMessages = {};

    public fill(messages: ErrorMessages): void {
        this.messages = messages;
    }

    public empty(): void {
        this.messages = {};
    }

    public hasAny(): boolean {
        return Object.keys(this.messages).length !== 0;
    }

    public has(field: string): boolean {

        return this.hasAny() && Object.keys(this.messages).filter((k: string): boolean => k === field).length !== 0;
    }

    public get(field: string): string[] {
        if (this.has(field)) {
            return this.messages[field];
        }
        return [];
    }
}