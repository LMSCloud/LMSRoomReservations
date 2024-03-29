import { html } from "lit";
import { __ } from "../lib/translate";

export const searchSyntax = html`<h4>${__("Advanced Search Syntax")}</h4>
    <h5>${__("Field Equality Matches")}</h5>
    <p>${__("Syntax: ")}<code>fieldname:value</code></p>
    <p>${__("This will match results where the given field name matches the specified value.")}</p>
    <p>
        <strong>${__("Example:")}</strong>&nbsp;<code>age:25</code>${__(
            " will return results where the age field equals 25.",
        )}
    </p>
    <h5>${__("Complex Matching Clauses")}</h5>
    <p>${__("Syntax: ")}<code>fieldname:operator value</code></p>
    <p>
        ${__("This allows the use of various matching clauses including ")}<code>&#x3E;</code>${__(
            ", ",
        )}<code>&#x3C;</code>${__(", ")}<code>&#x3E;=</code>${__(", ")}<code>&#x3C;=</code>${__(
            ", ",
        )}<code>-like</code>${__(", and ")}<code>-not_like</code>${__(".")}
    </p>
    <p>
        <strong>${__("Example:")}</strong>&nbsp;<code>age:&#x3E;25</code>${__(
            " will return results where the age field is greater than 25.",
        )}
    </p>
    <h5>${__("Multi-field Filtering")}</h5>
    <p>${__("Syntax: ")}<code>field1:value1 AND field2:value2</code></p>
    <p>
        ${__(
            "This will filter the response to only those results where both field1 contains value1 AND field2 contains value2.",
        )}
    </p>
    <p>
        <strong>${__("Example:")}</strong>&nbsp;<code>name:John AND age:25</code>${__(
            " will return results where the name field is John AND the age field equals 25.",
        )}
    </p>
    <h5>${__("OR Queries")}</h5>
    <p>${__("Syntax: ")}<code>fieldname:value1 OR value2</code></p>
    <p>${__("This will return results where the fieldname is either value1 OR value2.")}</p>
    <p>
        <strong>${__("Example:")}</strong>&nbsp;<code>surname:Acevedo OR Bernardo</code>${__(
            ' will return any result whose surname is "Acevedo" OR "Bernardo".',
        )}
    </p>
    <h5>${__("Exact Matches")}</h5>
    <p>${__("If you quote the search term in double quotes, it will find only exact matches.")}</p>
    <p>
        <strong>${__("Example:")}</strong>&nbsp;<code>name:&#x22;John Doe&#x22;</code>${__(
            ' will return results where the name field is exactly "John Doe".',
        )}
    </p>
    <h5>${__("Wildcard Matches")}</h5>
    <p>
        ${__(
            "If a value is not quoted, it will perform a search with wildcard matches, meaning it will return results where the field contains the specified value.",
        )}
    </p>
    <p>
        <strong>${__("Example:")}</strong>&nbsp;<code>name:John</code>${__(
            ' will return results where the name field contains "John" (such as "John Doe", "Johnny", etc.).',
        )}
    </p>
    <h5>${__("Nested Data Query")}</h5>
    <p>
        ${__(
            "If you are requesting related data be embedded into the response one can query on the related data using dot notation in the field names.",
        )}
    </p>
    <p>
        <strong>${__("Example:")}</strong>&nbsp;<code
            >extended_attributes.code:internet AND extended_attributes.attribute:1</code
        >${__(" will return results where the code field of extended")}<em>${__(
            'attributes is "internet" AND the attribute field of extended',
        )}</em>${__("attributes is 1.")}
    </p>
    <h5>${__("Bare Search")}</h5>
    <p>
        ${__(
            "A bare search without keywords will search all fields with forward and backward truncation meaning *SEARCH_TERM*. This can be used for broad queries where the specific field isn't known.",
        )}
    </p>
    <p>
        <strong>${__("Example:")}</strong>${__(
            ' John will return any result that contains "John" in any of the fields.',
        )}
    </p>`;
