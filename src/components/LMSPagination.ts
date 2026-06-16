import { faAngleDoubleLeft, faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { __, attr__ } from "../lib/translate";
import { skeletonStyles } from "../styles/skeleton";
import { tailwindStyles } from "../tailwind.lit";
import { Column } from "../types/common";

// Controlled pagination: the parent owns the page/per-page state (and the URL),
// passes it in as `_page`/`_per_page` plus the prefetched `nextPage` (which
// drives `hasNext`), and reacts to the `page` event. This component holds no
// URL state of its own.
@customElement("lms-pagination")
export default class LMSPagination extends LitElement {
    @property({ type: Array, attribute: "page-sizes" }) pageSizes = [10, 20, 50, 100];

    @property({ type: Number }) _page = 1;

    @property({ type: Number }) _per_page = 20;

    @property({ type: Array }) nextPage: Column[] | undefined = undefined;

    static override styles = [tailwindStyles, skeletonStyles];

    private get hasPrevious() {
        return this._page > 1;
    }

    private get hasNext() {
        return this.nextPage !== undefined && this.nextPage.length > 0;
    }

    private emitPage(_page: number, _per_page: number) {
        this.dispatchEvent(
            new CustomEvent("page", {
                detail: { _page, _per_page },
                bubbles: true,
                composed: true,
            }),
        );
    }

    private handlePrevious(e: Event) {
        e.preventDefault();
        if (this.hasPrevious) {
            this.emitPage(this._page - 1, this._per_page);
        }
    }

    private handleNext(e: Event) {
        e.preventDefault();
        if (this.hasNext) {
            this.emitPage(this._page + 1, this._per_page);
        }
    }

    private handlePageSize(e: Event, pageSize: number) {
        e.preventDefault();
        if (pageSize !== this._per_page) {
            // Changing the page size returns to the first page.
            this.emitPage(1, pageSize);
        }
    }

    override render() {
        return html`
            <div class="join" aria-label=${attr__("Table navigation")}>
                <a class="btn join-item" ?disabled=${!this.hasPrevious} href="#" @click=${this.handlePrevious}
                    ><span class="hidden lg:inline"> ${__("Previous")} </span>
                    ${litFontawesome(faAngleDoubleLeft, {
                        className: "w-4 h-4 inline-block lg:hidden",
                    })}
                </a>
                ${map(
                    this.pageSizes,
                    (pageSize) => html`
                        <a
                            class="${classMap({
                                "bg-primary-focus": pageSize === this._per_page,
                            })} btn btn-square join-item"
                            href="#"
                            @click=${(e: Event) => this.handlePageSize(e, pageSize)}
                            >${pageSize}</a
                        >
                    `,
                )}
                <a class="btn join-item" ?disabled=${!this.hasNext} href="#" @click=${this.handleNext}
                    ><span class="hidden lg:inline"> ${__("Next")} </span>
                    ${litFontawesome(faAngleDoubleRight, {
                        className: "w-4 h-4 inline-block lg:hidden",
                    })}
                </a>
            </div>
        `;
    }
}
