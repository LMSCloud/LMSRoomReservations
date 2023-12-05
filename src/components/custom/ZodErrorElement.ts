import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { __ } from "../../lib/translate";

interface ZodErrorDetail {
    code: string;
    expected: string;
    received: string;
    path: string[];
    message: string;
}

export interface ZodErrorMessage {
    type: "zod";
    status: string;
    message: string;
    details: string | ZodErrorDetail[];
}

@customElement("zod-error-element")
export default class ZodErrorElement extends LitElement {
    @property({ type: Object })
    errors?: ZodErrorMessage;

    private parseErrorString(): ZodErrorMessage | undefined {
        if (!this.errors) {
            return;
        }

        try {
            if (typeof this.errors.details === "string") {
                const sanitized = this.errors?.details.replace(/^[^\[\{]+/, "");
                const parsed = JSON.parse(sanitized);
                this.errors.details = parsed;
            }

            if (typeof this.errors === "object" && this.errors !== null) {
                return this.errors as ZodErrorMessage;
            }
        } catch (e) {
            console.error("Error parsing Zod error string:", e);
        }
        return;
    }

    private renderErrorDetail(detail: ZodErrorDetail) {
        return html`
            <ul class="error-detail">
                <li><strong>${__("Code")}:</strong> ${detail.code}</li>
                <li><strong>${__("Expected")}:</strong> ${detail.expected}</li>
                <li><strong>${__("Received")}:</strong> ${detail.received}</li>
                <li><strong>${__("Path")}:</strong> ${detail.path.join(".")}</li>
                <li><strong>${__("Message")}:</strong> ${detail.message}</li>
            </ul>
        `;
    }

    override render() {
        const errorData = this.parseErrorString();
        if (!errorData) {
            return nothing;
        }

        return html`
            <div class="error-container">
                <div><strong>${__("Error")}:</strong> ${__(errorData.message)}</div>
                ${typeof errorData.details !== "string"
                    ? map(errorData.details, (detail) => this.renderErrorDetail(detail))
                    : nothing}
            </div>
        `;
    }
}
