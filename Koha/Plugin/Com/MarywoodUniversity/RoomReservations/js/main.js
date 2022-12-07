(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.RoomReservationBundle = {}));
})(this, (function (exports) { 'use strict';

  /**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t$1=window,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$3=Symbol(),n$3=new WeakMap;class o$3{constructor(t,e,n){if(this._$cssResult$=!0,n!==s$3)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n$3.set(s,t));}return t}toString(){return this.cssText}}const r$2=t=>new o$3("string"==typeof t?t:t+"",void 0,s$3),i$1=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o$3(n,t,s$3)},S$1=(s,n)=>{e$2?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=t$1.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n);}));},c$1=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var s$2;const e$1=window,r$1=e$1.trustedTypes,h$1=r$1?r$1.emptyScript:"",o$2=e$1.reactiveElementPolyfillSupport,n$2={toAttribute(t,i){switch(i){case Boolean:t=t?h$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},a$1=(t,i)=>i!==t&&(i==i||t==t),l$2={attribute:!0,type:String,converter:n$2,reflect:!1,hasChanged:a$1};class d$1 extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u();}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e));})),t}static createProperty(t,i=l$2){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$2}static finalize(){if(this.hasOwnProperty("finalized"))return !1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c$1(i));}else void 0!==i&&s.push(c$1(i));return s}static _$Ep(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1);}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S$1(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$EO(t,i,s=l$2){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:n$2).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null;}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:n$2;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a$1)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej());}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek();}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek();}updated(t){}firstUpdated(t){}}d$1.finalized=!0,d$1.elementProperties=new Map,d$1.elementStyles=[],d$1.shadowRootOptions={mode:"open"},null==o$2||o$2({ReactiveElement:d$1}),(null!==(s$2=e$1.reactiveElementVersions)&&void 0!==s$2?s$2:e$1.reactiveElementVersions=[]).push("1.4.2");

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  var t;const i=window,s$1=i.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$1=`lit$${(Math.random()+"").slice(9)}$`,n$1="?"+o$1,l$1=`<${n$1}>`,h=document,r=(t="")=>h.createComment(t),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,c=t=>u(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,a=/-->/g,f=/>/g,_=RegExp(">|[ \t\n\f\r](?:([^\\s\"'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r\"'`<>=]|(\"|')|))|$)","g"),m=/'/g,p=/"/g,$=/^(?:script|style|textarea|title)$/i,g=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),y=g(1),x=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),T=new WeakMap,A=h.createTreeWalker(h,129,null,!1),E=(t,i)=>{const s=t.length-1,n=[];let h,r=2===i?"<svg>":"",d=v;for(let i=0;i<s;i++){const s=t[i];let e,u,c=-1,g=0;for(;g<s.length&&(d.lastIndex=g,u=d.exec(s),null!==u);)g=d.lastIndex,d===v?"!--"===u[1]?d=a:void 0!==u[1]?d=f:void 0!==u[2]?($.test(u[2])&&(h=RegExp("</"+u[2],"g")),d=_):void 0!==u[3]&&(d=_):d===_?">"===u[0]?(d=null!=h?h:v,c=-1):void 0===u[1]?c=-2:(c=d.lastIndex-u[2].length,e=u[1],d=void 0===u[3]?_:'"'===u[3]?p:m):d===p||d===m?d=_:d===a||d===f?d=v:(d=_,h=void 0);const y=d===_&&t[i+1].startsWith("/>")?" ":"";r+=d===v?s+l$1:c>=0?(n.push(e),s.slice(0,c)+"$lit$"+s.slice(c)+o$1+y):s+o$1+(-2===c?(n.push(void 0),i):y);}const u=r+(t[s]||"<?>")+(2===i?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return [void 0!==e?e.createHTML(u):u,n]};class C{constructor({strings:t,_$litType$:i},e){let l;this.parts=[];let h=0,d=0;const u=t.length-1,c=this.parts,[v,a]=E(t,i);if(this.el=C.createElement(v,e),A.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(l=A.nextNode())&&c.length<u;){if(1===l.nodeType){if(l.hasAttributes()){const t=[];for(const i of l.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(o$1)){const s=a[d++];if(t.push(i),void 0!==s){const t=l.getAttribute(s.toLowerCase()+"$lit$").split(o$1),i=/([.?@])?(.*)/.exec(s);c.push({type:1,index:h,name:i[2],strings:t,ctor:"."===i[1]?M:"?"===i[1]?k:"@"===i[1]?H:S});}else c.push({type:6,index:h});}for(const i of t)l.removeAttribute(i);}if($.test(l.tagName)){const t=l.textContent.split(o$1),i=t.length-1;if(i>0){l.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)l.append(t[s],r()),A.nextNode(),c.push({type:2,index:++h});l.append(t[i],r());}}}else if(8===l.nodeType)if(l.data===n$1)c.push({type:2,index:h});else {let t=-1;for(;-1!==(t=l.data.indexOf(o$1,t+1));)c.push({type:7,index:h}),t+=o$1.length-1;}h++;}}static createElement(t,i){const s=h.createElement("template");return s.innerHTML=t,s}}function P(t,i,s=t,e){var o,n,l,h;if(i===x)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=P(t,r._$AS(t,i.values),r,e)),i}class V{constructor(t,i){this.u=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}v(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:h).importNode(s,!0);A.currentNode=o;let n=A.nextNode(),l=0,r=0,d=e[0];for(;void 0!==d;){if(l===d.index){let i;2===d.type?i=new N(n,n.nextSibling,this,t):1===d.type?i=new d.ctor(n,d.name,d.strings,this,t):6===d.type&&(i=new I(n,this,t)),this.u.push(i),d=e[++r];}l!==(null==d?void 0:d.index)&&(n=A.nextNode(),l++);}return o}p(t){let i=0;for(const s of this.u)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class N{constructor(t,i,s,e){var o;this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cm=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cm}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=P(this,t,i),d(t)?t===b||null==t||""===t?(this._$AH!==b&&this._$AR(),this._$AH=b):t!==this._$AH&&t!==x&&this.g(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):c(t)?this.k(t):this.g(t);}O(t,i=this._$AB){return this._$AA.parentNode.insertBefore(t,i)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}g(t){this._$AH!==b&&d(this._$AH)?this._$AA.nextSibling.data=t:this.T(h.createTextNode(t)),this._$AH=t;}$(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=C.createElement(e.h,this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.p(s);else {const t=new V(o,this),i=t.v(this.options);t.p(s),this.T(i),this._$AH=t;}}_$AC(t){let i=T.get(t.strings);return void 0===i&&T.set(t.strings,i=new C(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new N(this.O(r()),this.O(r()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cm=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class S{constructor(t,i,s,e,o){this.type=1,this._$AH=b,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=b;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=P(this,t,i,0),n=!d(t)||t!==this._$AH&&t!==x,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=P(this,e[s+l],i,l),h===x&&(h=this._$AH[l]),n||(n=!d(h)||h!==this._$AH[l]),h===b?t=b:t!==b&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class M extends S{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===b?void 0:t;}}const R=s$1?s$1.emptyScript:"";class k extends S{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==b?this.element.setAttribute(this.name,R):this.element.removeAttribute(this.name);}}class H extends S{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=P(this,t,i,0))&&void 0!==s?s:b)===x)return;const e=this._$AH,o=t===b&&e!==b||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==b&&(e===b||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class I{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t);}}const z=i.litHtmlPolyfillSupport;null==z||z(C,N),(null!==(t=i.litHtmlVersions)&&void 0!==t?t:i.litHtmlVersions=[]).push("2.4.0");const Z=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new N(i.insertBefore(r(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var l,o;class s extends d$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Z(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1);}render(){return x}}s.finalized=!0,s._$litElement$=!0,null===(l=globalThis.litElementHydrateSupport)||void 0===l||l.call(globalThis,{LitElement:s});const n=globalThis.litElementPolyfillSupport;null==n||n({LitElement:s});(null!==(o=globalThis.litElementVersions)&&void 0!==o?o:globalThis.litElementVersions=[]).push("3.2.2");

  class LMSRoom extends s {
    static get properties() {
      return {
        maxcapacity: { type: String },
        color: { type: String },
        image: { type: String },
        description: { type: String },
        maxbookabletime: { type: String },
        roomid: { type: String },
        branch: { type: String },
        roomnumber: { type: String },
        editable: { type: Boolean },
      };
    }

    static styles = i$1`
    .card {
      margin: 16px;
      padding: 16px;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }

    .label {
      display: block;
      margin: 8px 0;
      font-weight: bold;
    }

    .input {
      display: block;
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .button {
      display: inline-block;
      margin-right: 8px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background-color: #333;
      color: #fff;
      cursor: pointer;
    }

    .buttons {
      display: flex;
      justify-content: right;
      margin: 8px 0;
    }

    .button:hover {
      background-color: #444;
    }

    .p-0 {
      padding: 0;
    }
  `;

    constructor() {
      super();
      this.editable = false;
    }

    handleEdit() {
      this.editable = true;
    }

    handleSave() {
      this.editable = false;
      // Emit an event with the current property values
      const event = new CustomEvent('lms-room-saved', {
        detail: {
          maxcapacity: this.maxcapacity,
          color: this.color,
          image: this.image,
          description: this.description,
          maxbookabletime: this.maxbookabletime,
          roomid: this.roomid,
          branch: this.branch,
          roomnumber: this.roomnumber,
        },
      });
      this.dispatchEvent(event);
    }

    render() {
      return y`
      <div class="card">
        <label class="label">Room ID</label>
        <input disabled type="text" .value=${this.roomid} class="input" />
        <label class="label">Room Number</label>
        <input
          ?disabled=${!this.editable}
          type="text"
          .value=${this.roomnumber}
          @input=${(e) => { this.roomnumber = e.target.value; }}
          class="input"
        />
        <label class="label">Max Capacity</label>
        <input
          ?disabled=${!this.editable}
          type="text"
          .value=${this.maxcapacity}
          @input=${(e) => { this.maxcapacity = e.target.value; }}
          class="input"
        />
        <label class="label">Description</label>
        <input
          ?disabled=${!this.editable}
          type="text"
          .value=${this.description}
          @input=${(e) => { this.description = e.target.value; }}
          class="input"
        />
        <label class="label">Color</label>
        <input
          ?disabled=${!this.editable}
          type="color"
          .value=${this.color}
          @input=${(e) => { this.color = e.target.value; }}
          class="input p-0"
        />
        <label class="label">Image</label>
        <input
          ?disabled=${!this.editable}
          type="text"
          .value=${this.image}
          @input=${(e) => { this.image = e.target.value; }}
          class="input"
        />
        <label class="label">Branch</label>
        <input
          ?disabled=${!this.editable}
          type="text"
          .value=${this.branch}
          @input=${(e) => { this.branch = e.target.value; }}
          class="input"
        />
        <label class="label">Max Bookable Time</label>
        <input
          ?disabled=${!this.editable}
          type="number"
          .value=${this.maxbookabletime}
          @input=${(e) => { this.maxbookabletime = e.target.value; }}
          class="input"
        />
        <div class="buttons">
          <button @click=${this.handleEdit} class="button">Edit</button>
          <button @click=${this.handleSave} class="button">Save</button>
        </div>
      </div>
    `;
    }
  }

  customElements.define('lms-room', LMSRoom);

  /* eslint-disable no-underscore-dangle */

  class LMSModal extends s {
    static get properties() {
      return {
        fields: { type: Array },
        createOpts: { type: Object },
        editable: { type: Boolean },
        isOpen: { type: Boolean },
      };
    }

    static get styles() {
      return i$1`
      .label {
        display: block;
        margin: 8px 0;
        font-weight: bold;
      }

      .input {
        display: block;
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
      }

      .button {
        display: inline-block;
        margin-right: 8px;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background-color: #333;
        color: #fff;
        cursor: pointer;
      }

      .buttons {
        display: flex;
        justify-content: right;
        margin: 8px 0;
      }

      .button:hover {
        background-color: #444;
      }

      .plus-button {
        position: fixed;
        bottom: 1em;
        right: 1em;
        border-radius: 50%;
        background-color: #333;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        z-index: 99;
      }

      .plus-button > button {
        background: none;
        border: none;
        color: #fff;
        font-size: 2em;
        width: 2em;
        height: 2em;
      }

      .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 16px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        z-index: 100;
      }

      .dark-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 98;
      }

      .tilted {
        transition-timing-function: ease-in-out;
        transition: 0.2s;
        transform: rotate(45deg);
      }
    `;
    }

    constructor() {
      super();
      this.fields = [];
      this.createOpts = {
        endpoint: undefined,
        method: undefined,
        id: undefined,
        body: undefined,
      };
      this.editable = false;
      this.isOpen = false;
    }

    _toggleModal() {
      this.isOpen = !this.isOpen;
    }

    async _create(e) {
      e.preventDefault();
      const { endpoint, method } = this.createOpts;
      const response = await fetch(`${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          Object.assign(
            ...this.fields.map(({ name, value }) => ({ [name]: value }))
          )
        ),
      });

      if (response.status === 201) {
        this._toggleModal(); /** Implement success toast here */
      }

      if ([400, 500].includes(response.status)) ;
    }

    render() {
      return y`
      <div class="plus-button">
        <button @click="${this._toggleModal}" class=${this.isOpen && "tilted"}>
          +
        </button>
      </div>
      <div
        class="dark-background"
        ?hidden=${!this.isOpen}
        @click=${this._toggleModal}
      ></div>
      ${this.isOpen
        ? y`
            <div class="modal">
              <form @submit="${this._create}">
                ${this.fields.map((field) => this._getFieldMarkup(field))}
                <div class="buttons">
                  <button type="submit" class="button">Create</button>
                </div>
              </form>
            </div>
          `
        : y``}
    `;
    }

    _getFieldMarkup(field) {
      return field.desc
        ? y`
          <label class="label">${field.desc}</label>
          <input
            type=${field.type}
            name=${field.name}
            class="input"
            @input=${(e) => {
              field.value = e.target.value;
            }}
          />
        `
        : y``;
    }
  }

  class LMSRoomModal extends LMSModal {
    static get properties() {
      return { fields: { type: Array } };
    }

    constructor() {
      super();
      this.fields = [
        { name: 'maxcapacity', type: 'text', desc: 'Max capacity' },
        { name: 'color', type: 'color', desc: 'Color' },
        { name: 'image', type: 'text', desc: 'Image' },
        { name: 'description', type: 'text', desc: 'description' },
        { name: 'maxbookabletime', type: 'text', desc: 'Max bookable time' },
        { name: 'roomid', type: 'text' },
        { name: 'branch', type: 'text', desc: 'Branch' },
        { name: 'roomnumber', type: 'text', desc: 'Roomnumber' },
      ];
      this.createOpts = {
        endpoint: '/api/v1/contrib/roomreservations/rooms',
        method: 'POST',
      };
    }
  }

  customElements.define('lms-room-modal', LMSRoomModal);

  class LMSEquipmentItem extends s {
    static get properties() {
      return {
        equipmentid: { type: String },
        equipmentname: { type: String },
        editable: { type: Boolean },
      };
    }

    static styles = i$1`
    .pill {
      padding: 0.5em 1em;
      border-radius: 20px;
      background-color: #333;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1em;
    }

    .label {
      display: block;
      margin: 8px 0;
      font-weight: bold;
    }

    .input {
      display: block;
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
      background-color: #fff;
    }

    .button {
      display: inline-block;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background-color: #555;
      color: #fff;
      cursor: pointer;
    }
  `;

    constructor() {
      super();
      this.editable = false;
    }

    handleEdit() {
      this.editable = true;
    }

    handleSave() {
      this.editable = false;
      // Emit an event with the current property values
      const event = new CustomEvent('lms-room-saved', {
        detail: {
          maxcapacity: this.maxcapacity,
          color: this.color,
          image: this.image,
          description: this.description,
          maxbookabletime: this.maxbookabletime,
          roomid: this.roomid,
          branch: this.branch,
          roomnumber: this.roomnumber,
        },
      });
      this.dispatchEvent(event);
    }

    render() {
      return y`
      <div class="pill">
        <label class="label">${this.equipmentid}</label>
        <input
          type="text"
          ?disabled=${!this.editable}
          .value=${this.equipmentname}
          @input=${(e) => { this.equipmentname = e.target.value; }}
          class="input"
        />
        <button @click=${this.handleEdit} class="button">Edit</button>
        <button @click=${this.handleSave} class="button">Save</button>
      </div>
    `;
    }
  }

  customElements.define('lms-equipment-item', LMSEquipmentItem);

  class LMSEquipmentModal extends LMSModal {
    static get properties() {
      return { fields: { type: Array } };
    }

    constructor() {
      super();
      this.fields = [
        { name: 'equipmentid', type: 'text' },
        { name: 'equipmentname', type: 'text', desc: 'Equipmentname' },
      ];
      this.createOpts = {
        endpoint: '/api/v1/contrib/roomreservations/equipment',
        method: 'POST',
      };
    }
  }

  customElements.define('lms-equipment-modal', LMSEquipmentModal);

  class LMSSearch extends s {
    static get properties() {
      return {
        tagName: { type: String },
        search: { type: String },
      };
    }

    constructor() {
      super();
      this.tagName = '';
      this.search = '';
      this.indexedContent = [];
    }

    firstUpdated() {
      this.indexedContent = [...document.getElementsByTagName(this.tagName)];
    }

    update(changedProperties) {
      if (changedProperties.has('search')) {
        this.indexedContent.forEach((element) => {
          if (element.textContent.includes(this.search)) {
            element.style.display = 'block';
          } else {
            element.style.display = 'none';
          }
        });
      }

      super.update(changedProperties);
    }

    render() {
      return y` <input type="text" @input="${this.handleSearchChange}" /> `;
    }

    handleSearchChange(event) {
      this.search = event.target.value;
    }
  }

  customElements.define('lms-search', LMSSearch);

  function closeModal({ selector }) {
    const lmsrModal = document.querySelector(selector);
    const lmsrModalRoot = lmsrModal.shadowRoot;
    const lmsrModalButtonClose = lmsrModalRoot.querySelector('.lmsr-modal-button-close');
    lmsrModalButtonClose.addEventListener('click', () => { lmsrModal.remove(); });
    lmsrModalButtonClose.disabled = false;
  }

  function closeToast() {
    const lmsrToast = document.querySelector('lmsr-toast');
    const lmsrToastRoot = lmsrToast.shadowRoot;
    const lmsrToastButtonClose = lmsrToastRoot.querySelector('.lmsr-toast-button-close');
    lmsrToastButtonClose.addEventListener('click', () => { lmsrToast.remove(); });
    lmsrToastButtonClose.disabled = false;
    window.setTimeout(() => { lmsrToast.remove(); }, 3000);
  }

  function getBlackoutsBySelectedRoom({ entryPoint, blackouts }) {
    const showBlackoutHint = (entryPointRef) => {
      const blackoutInfo = document.createElement('span');
      blackoutInfo.classList.add('row', 'mx-1', 'p-1');
      blackoutInfo.textContent = 'Für diesen Raum existieren derzeit keine Sperrzeiten.';
      entryPointRef.appendChild(blackoutInfo);
      return false;
    };

    const entryPointRef = document.getElementById(entryPoint);
    entryPointRef.innerHTML = '';
    let [selectedRoom] = document.getElementById('availability-search-room').selectedOptions;
    if (!+selectedRoom.value) { return showBlackoutHint(entryPointRef); }
    selectedRoom = selectedRoom.text.replace(/\(.*\)/, '').trim();
    const blackoutsForSelectedRoom = blackouts.reduce((accumulator, blackout) => {
      if (blackout.roomnumber === selectedRoom) { accumulator.push(blackout); }
      return accumulator;
    }, []);
    if (blackoutsForSelectedRoom.length === 0) {
      return showBlackoutHint(entryPointRef);
    }
    blackoutsForSelectedRoom.forEach((blackout) => {
      const blackoutElement = document.createElement('div');
      blackoutElement.classList.add('row', 'my-3', 'mx-1', 'p-1', 'border', 'rounded', 'text-center');
      [blackout.start, '-', blackout.end].forEach((item) => {
        const span = document.createElement('div');
        span.classList.add('text-nowrap', 'col-12', 'col-xl-4');
        span.textContent = item;
        blackoutElement.appendChild(span);
      });
      entryPointRef.appendChild(blackoutElement);
    });

    return true;
  }

  function getCheckedOptions({ elements, hiddenInputReference }) {
    const hiddenInput = document.getElementById(hiddenInputReference);
    const options = document.querySelectorAll(elements);
    options.forEach((option) => {
      option.addEventListener('change', () => {
        const checkedOptions = Array.from(options).reduce((accumulator, _option) => {
          if (_option.checked) { accumulator.push(_option.value); } return accumulator;
        }, []);
        hiddenInput.value = checkedOptions;
      });
    });
  }

  function getColorTextWithContrast(color) {
    let red = 0;
    let green = 0;
    let blue = 0;

    if (!color) {
      // Generate random RGB values
      red = Math.floor(Math.random() * 256 - 1);
      green = Math.floor(Math.random() * 256 - 1);
      blue = Math.floor(Math.random() * 256 - 1);
    }

    if (color) {
      [red, green, blue] = color.replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`,
      )
        .substring(1).match(/.{2}/g)
        .map((x) => parseInt(x, 16));
    }

    // Calculate brightness of randomized colour
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    // Calculate brightness of white and black text
    const lightText = (255 * 299 + 255 * 587 + 255 * 114) / 1000;
    const darkText = (0 * 299 + 0 * 587 + 0 * 114) / 1000;

    const backgroundColor = `rgb(${red},${green},${blue})`;
    const textColor = Math.abs(brightness - lightText) > Math.abs(brightness - darkText)
      ? 'rgb(255, 255, 255)'
      : 'rgb(0, 0, 0)';

    return [backgroundColor, textColor];
  }

  function getEquipmentBySelectedRoom({
    rooms,
    equipment,
    entryPoint,
  }) {
    const showEquipmentHint = (entryPointRef) => {
      const equipmentInfo = document.createElement('span');
      equipmentInfo.classList.add('row', 'mx-1', 'p-1');
      equipmentInfo.textContent = 'Für diesen Raum konnte kein Equipment gefunden werden.';
      entryPointRef.appendChild(equipmentInfo);
      return false;
    };

    const entryPointRef = document.getElementById(entryPoint);
    entryPointRef.innerHTML = '';
    const [selectedRoom] = document.getElementById(
      'availability-search-room',
    ).selectedOptions;
    if (!+selectedRoom.value) {
      return showEquipmentHint(entryPointRef);
    }
    const roomData = rooms.find(
      (room) => room.roomnumber === selectedRoom.text.replace(/\(.*\)/, '').trim(),
    );
    roomData?.equipment.forEach((item) => {
      const lmsrEquipmentSelectionCheckForm = document.createElement(
        'lmsr-equipment-selection',
        { is: 'lmsr-equipment-selection' },
      );
      const itemMachineReadable = item.equipmentname.replace(' ', '_');
      const itemId = equipment.find(
        (_item) => _item.equipmentname === item.equipmentname,
      ).equipmentid;
      lmsrEquipmentSelectionCheckForm.innerHTML = `
        <input slot="lmsr-check-input" class="lmsr-check-input" type="checkbox" value="${itemId}" id="${itemMachineReadable}">
        <label slot="lmsr-check-label" class="lmsr-check-label" for="${itemMachineReadable}">${item.equipmentname}</label>
      `;
      entryPointRef.appendChild(
        lmsrEquipmentSelectionCheckForm,
      );
    });

    return true;
  }

  function hydrateAvailabilitySearch({
    roomSelectionRef,
    blackoutsArgs,
    equipmentArgs,
    checkedOptionsArgs,
  }) {
    if (roomSelectionRef) {
      Array.from(roomSelectionRef.selectedOptions).forEach((selectedOption) => {
        const selectedOptionRef = selectedOption;
        selectedOptionRef.selected = false;
      });
    }
    getBlackoutsBySelectedRoom({
      entryPoint: blackoutsArgs.entryPoint,
      blackouts: blackoutsArgs.blackouts,
    });
    getEquipmentBySelectedRoom({
      entryPoint: equipmentArgs.entryPoint,
      rooms: equipmentArgs.rooms,
      equipment: equipmentArgs.equipment,
    });
    getCheckedOptions({
      elements: checkedOptionsArgs.elements,
      hiddenInputReference: checkedOptionsArgs.hiddenInputReference,
    });
  }

  function hydrateRoomConfinement() {
    const roomConfinementItems = document.querySelectorAll(
      '.lmsr-calendar-room-confinement-item',
    );
    const bookingsLandscape = document.querySelectorAll(
      '.lmsr-calendar-data-booking',
    );

    const bookingsPortrait = document.querySelectorAll(
      '.lmsr-calendar-portrait-day-booking',
    );

    const bookings = bookingsLandscape.length > 0 ? bookingsLandscape : bookingsPortrait;
    const format = bookingsLandscape.length > 0;

    const resetVisibility = ({ e, _bookings }) => {
      roomConfinementItems.forEach((roomConfinementItem) => {
        if (
          roomConfinementItem.textContent.trim() !== e.target.textContent.trim()
        ) {
          const ref = roomConfinementItem;
          ref.dataset.active = 'false';
        }
      });
      _bookings.forEach((booking) => {
        const ref = booking;
        ref.style.display = format ? 'block' : 'flex';
      });
    };

    const toggleVisibility = ({ e, _bookings }) => {
      resetVisibility({ e, _bookings });
      const state = e.target.dataset.active === 'true';
      e.target.dataset.active = !state;

      _bookings.forEach((booking) => {
        const ref = booking;
        if (
          !(
            booking.firstElementChild.textContent.trim()
            === e.target.textContent.trim()
          )
        ) {
          ref.style.display = state ? `${format ? 'block' : 'flex'}` : 'none';
        }
      });
    };

    roomConfinementItems.forEach((roomConfinementItem) => {
      const ref = roomConfinementItem;
      if (
        !Array.from(bookings).some(
          (booking) => booking.firstElementChild.textContent.trim()
            === roomConfinementItem.textContent.trim(),
        )
      ) {
        ref.style.display = 'none';
      }
      roomConfinementItem.addEventListener('click', (e) => {
        toggleVisibility({ e, _bookings: bookings });
      });
    });
  }

  function loadSelectedAction() { document.getElementById('actionSelectedBtn').click(); }

  function notifyOnSubmitWithMessage({ type, message, style = null }) {
    const lmsrNotifications = document.getElementById('lmsr-notifications');
    lmsrNotifications.innerHTML = '';
    const lmsrToast = document.createElement('lmsr-toast', { is: 'lmsr-toast' });
    lmsrToast.innerHTML = `
      <strong slot="title">${type}</strong>
      <p slot="message">${message}</p>
    `;
    const lmsrToastDiv = lmsrToast.shadowRoot.querySelector('.lmsr-toast');
    if (style) {
      style.forEach((directive) => {
        const { key, value } = directive;
        lmsrToastDiv.style[key] = value;
      });
    }

    lmsrNotifications.appendChild(lmsrToast);
  }

  function prohibitFormSubmitWithMessage({
    e,
    type,
    message,
    style = [
      { key: 'bottom', value: '3.5em' },
      { key: 'right', value: '1em' },
    ],
  }) {
    e.preventDefault();
    const lmsrNotifications = document.getElementById('lmsr-notifications');
    lmsrNotifications.innerHTML = '';
    const lmsrToast = document.createElement('lmsr-toast', { is: 'lmsr-toast' });
    lmsrToast.innerHTML = `
      <strong slot="title">${type}</strong>
      <p slot="message">${message}</p>
      ${style ? `<style>${style}</style>` : ''}
    `;
    const lmsrToastDiv = lmsrToast.shadowRoot.querySelector('.lmsr-toast');
    if (style) {
      style.forEach((directive) => {
        const { key, value } = directive;
        lmsrToastDiv.style[key] = value;
      });
    }
    lmsrNotifications.appendChild(lmsrToast);

    return false;
  }

  function renderCalendar() {
    const BREAKPOINT_SM = 768;
    const HTML = document.documentElement;
    const lmsrCalendarBody = document.querySelector('.lmsr-calendar-body');
    const lmsrCalendarBodyLandscape = document.getElementById('lmsr-calendar-body-landscape-template');
    const lmsrCalendarBodyPortrait = document.getElementById('lmsr-calendar-body-portrait-template');
    const lmsrCalendarBodyContent = HTML.clientWidth >= BREAKPOINT_SM
      ? lmsrCalendarBodyLandscape.content
      : lmsrCalendarBodyPortrait.content;

    lmsrCalendarBody.appendChild(lmsrCalendarBodyContent);

    const jumpToCalendarButton = document.getElementById('jump-to-calendar');
    const calendar = document.getElementById('study-room-calendar');
    jumpToCalendarButton.addEventListener('click', () => { calendar.scrollIntoView(); });
    jumpToCalendarButton.disabled = false;

    const daysWithBookingsInCalendar = document.querySelectorAll('.lmsr-calendar-data-entry');
    const activeBookingsInCalendar = document.querySelectorAll('.lmsr-calendar-data-booking');

    daysWithBookingsInCalendar.forEach((dayWithBookingsInCalendar) => {
      if (dayWithBookingsInCalendar.firstElementChild) {
        dayWithBookingsInCalendar.parentElement.classList.add('lmsr-calendar-data-has-events');
      }
    });

    activeBookingsInCalendar.forEach((activeBookingInCalendar) => {
      const { color } = activeBookingInCalendar.dataset;
      const ACTIVE_BOOKING_REFERENCE = activeBookingInCalendar;
      const [backgroundColor, textColor] = getColorTextWithContrast(color);
      ACTIVE_BOOKING_REFERENCE.style.backgroundColor = backgroundColor;
      ACTIVE_BOOKING_REFERENCE.style.color = textColor;
    });
  }

  function setBlackoutValueOnChange(e) { e.target.value = e.target.value; }

  function deleteEquipmentConfirmation(e) {
    const equipment = document.getElementsByName('delete-equipment-radio-button');
    let equipmentChecked = false;

    equipment.forEach((item) => {
      if (item.checked) {
        equipmentChecked = true;
      }
    });

    if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Austattung aus, die Sie löschen möchten.' }); }

    const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie die ausgewählte Raumaustattung löschen möchten?');
    if (isConfirmedDelete) { return true; }

    e.preventDefault();
    return false;
  }

  function deleteRoomConfirmation(e) {
    const rooms = document.getElementsByName('delete-room-radio-button');
    let roomChecked = false;

    rooms.forEach((room) => {
      if (room.checked) {
        roomChecked = true;
      }
    });

    if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus, den Sie löschen möchten.' }); }
    const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie den ausgewählten Raum löschen möchten?');
    if (roomChecked && isConfirmedDelete) { return true; }

    e.preventDefault();
    return false;
  }

  function editEquipmentValidation(e) {
    const equipment = document.getElementsByName('edit-equipment-radio-button');
    let equipmentChecked = false;

    equipment.forEach((item) => {
      if (item.checked) {
        equipmentChecked = true;
      }
    });

    if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Austattung aus, die Sie bearbeiten möchten.' }); }

    return true;
  }

  function validateAddEquipment(e) {
    const equipmentname = document.forms.addEquipment['add-equipment-text-field'].value;
    if (equipmentname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Austattungsbezeichnung darf nicht leer sein.' }); }

    return true;
  }

  function validateAddRooms(e, rooms) {
    const roomname = document.forms.addRoomForm['add-room-roomnumber'].value;
    const maxcapacity = document.forms.addRoomForm['add-room-maxcapacity'].value;
    const equipment = document.getElementsByName('selected-equipment');

    if (rooms.some((room) => room.roomnumber === roomname)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Diese Raumbezeichnung ist bereits vergeben.' }); }
    if (roomname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Raumbezeichnung an.' }); }
    if (maxcapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Maximalkapazität an.' }); }

    let equipmentChecked = false;
    equipment.forEach((item) => {
      if (item.checked) {
        equipmentChecked = true;
      }
    });

    if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie die Raumaustattung aus. Sollte der Raum über keine Austattung verfügen, wählen Sie \'nichts\' aus.' }); }

    return true;
  }

  function validateAvailabilitySearchForBookas(e) {
    const startDate = document.forms.availabilitySearchForm['availability-search-start-date'].value;
    const startTime = document.forms.availabilitySearchForm['availability-search-start-time'].value;
    const endDate = document.forms.availabilitySearchForm['availability-search-end-date'].value;
    const endTime = document.forms.availabilitySearchForm['availability-search-end-time'].value;
    const maxCapacity = document.forms.availabilitySearchForm['availability-search-room-capacity'].value;

    if (startDate === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Startdatum an.' }); }
    if (startTime === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Startzeit an.' }); }
    if (endDate === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Enddatum an.' }); }
    if (endTime === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Endzeit an.' }); }
    if (maxCapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus.' }); }

    return true;
  }

  function validateAvailabilitySearchForOPAC({ e, rooms }) {
    const searchForm = {
      sd: {
        field: document.getElementById('availability-search-start-date'),
        value: document.getElementById('availability-search-start-date').value,
      },
      st: {
        field: document.getElementById('availability-search-start-time'),
        value: document.getElementById('availability-search-start-time').value,
      },
      ed: {
        field: document.getElementById('availability-search-end-date'),
        value: document.getElementById('availability-search-end-date').value,
      },
      et: {
        field: document.getElementById('availability-search-end-time'),
        value: document.getElementById('availability-search-end-time').value,
      },
      ro: {
        field: document.getElementById('availability-search-room'),
        value: document.getElementById('availability-search-room').value,
      },
    };

    const maximumBookableTimeframeOfSelectedRoom = rooms?.find(
      (room) => room.roomid === searchForm.ro.value,
    )?.maxbookabletime;
    const searchFormArray = Array.from(Object.entries(searchForm));

    searchFormArray.forEach((entry) => {
      const [, values] = entry;
      if (values.field.classList.contains('border-danger')) {
        values.field.classList.toggle('border-danger');
      }
    });

    const MINUTES_TO_MILLISECONDS = 60000;
    const MILLISECONDS_TO_HOURS = 3600000;
    const MINUTES_IN_HOURS = 60;

    const maximumBookableTimeframe = maximumBookableTimeframeOfSelectedRoom
      || parseInt(document.getElementById('max_time').value, 10);
    const maximumBookableTimeframeInMilliseconds = maximumBookableTimeframe !== 0
      ? maximumBookableTimeframe * MINUTES_TO_MILLISECONDS
      : 0;
    const maximumBookableTimeframeInHours = maximumBookableTimeframeInMilliseconds !== 0
      ? (maximumBookableTimeframeInMilliseconds / MILLISECONDS_TO_HOURS) % 24
      : 0;

    const startTimestamp = `${searchForm.sd.value} ${searchForm.st.value}`;
    const endTimestamp = `${searchForm.ed.value} ${searchForm.et.value}`;

    const startTimestampInMilliseconds = Date.parse(startTimestamp);
    const endTimestampInMilliseconds = Date.parse(endTimestamp);

    const timeDifferenceInMilliseconds = endTimestampInMilliseconds - startTimestampInMilliseconds;

    if (
      timeDifferenceInMilliseconds > maximumBookableTimeframeInMilliseconds
      && maximumBookableTimeframeInMilliseconds > 0
    ) {
      let timeString = '';

      if (maximumBookableTimeframeInHours > 0) {
        timeString
          += maximumBookableTimeframeInHours < 1
            ? `${MINUTES_IN_HOURS * maximumBookableTimeframeInHours} Minuten`
            : `${maximumBookableTimeframeInHours} Stunde(n)`;
      }

      return prohibitFormSubmitWithMessage({
        e,
        type: 'Warnung',
        message: `Die angegebene Zeitspanne überschreitet den Maximalwert: ${timeString}.`,
        style: [
          { key: 'bottom', value: '1em' },
          { key: 'right', value: '1em' },
        ],
      });
    }

    searchFormArray.forEach((entry) => {
      const [, values] = entry;
      if (values.value === '' || values.value === '0') {
        values.field.classList.toggle('border-danger');
      }
    });

    if (
      searchFormArray.some((entry) => {
        const [, values] = entry;
        return values.value === '';
      })
    ) {
      e.preventDefault();
      return false;
    }

    return true;
  }

  function validateAvailabilitySearchResultsForBookas(e) {
    const rooms = document.getElementsByName('selected-room-id');

    let roomChecked = false;
    rooms.forEach((room) => {
      if (room.checked) {
        roomChecked = true;
      }
    });

    if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus um fortzufahren.' }); }

    return true;
  }

  function validateBookingAction({
    e,
    bookings,
    equipment,
    rooms,
  }) {
    const action = document.forms.manageBookingsForm['manage-bookings-action'].value;
    const ids = document.getElementsByName('manage-bookings-id');

    let checked = 0;
    ids.forEach((id) => {
      if (id.checked) {
        checked += 1;
      }
    });

    if (checked !== 1) {
      return prohibitFormSubmitWithMessage({
        e,
        type: 'Warnung',
        message: 'Bitte wählen Sie eine Aktion aus.',
      });
    }
    if (action === '') {
      return prohibitFormSubmitWithMessage({
        e,
        type: 'Warnung',
        message: 'Bitte wählen Sie eine Aktion aus.',
      });
    }

    const id = Array.from(ids).find((_id) => _id.checked).value;
    const booking = bookings.find((_booking) => _booking.bookingid === id);
    const bookedEquipment = booking.equipment?.reduce((accumulator, itemId) => {
      accumulator.push(
        equipment.find((item) => item.equipmentid === itemId.toString()),
      );
      return accumulator;
    }, []);
    const roomnumbers = rooms.map((room) => room.roomnumber);

    /* Target format is yyyy-MM-ddThh:mm */
    const convertToDatetimeLocal = (datetime) => {
      const [date, time] = datetime.split(' ');
      const [day, month, year] = date.split('.');
      const [hours, minutes] = time.split(':');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    /* Target format is 'yyyy-MM-dd hh:mm:ss' */
    const convertToDatabaseFormat = (datetime) => `${datetime.replace('T', ' ')}:00`;

    const getFieldsForBookingEdit = ({
      _booking,
      _equipment,
      _bookedEquipment,
      _roomnumbers,
    }) => `
      <label for="edit-booking-roomnumber">Raum</label>
      <select name="edit-booking-roomnumber" id="edit-booking-roomnumber">
        <option value="${_booking.roomnumber}">${_booking.roomnumber}</option>
        ${_roomnumbers
    .filter((roomnumber) => roomnumber !== _booking.roomnumber)
    .reduce(
      (accumulator, roomnumber) => `
          ${accumulator}
          <option value="${roomnumber}">${roomnumber}</option>
        `,
      '',
    )}
      </select>
      <label for="edit-booking-start">Start</label>
      <input type="datetime-local" name="edit-booking-start" id="edit-booking-start" value="${convertToDatetimeLocal(
    _booking.start,
  )}">
      <label for="edit-booking-end">Ende</label>
      <input type="datetime-local" name="edit-booking-end" id="edit-booking-end" value="${convertToDatetimeLocal(
    _booking.end,
  )}">
      <label for="edit-booking-equipment">Austattung</label>
      <select name="edit-booking-equipment" id="edit-booking-equipment" multiple>
        ${
  _bookedEquipment
    ? _bookedEquipment.reduce(
      (accumulator, bookedItem) => `
      ${accumulator}
      <option value="${bookedItem.equipmentid}" selected>${bookedItem.equipmentname}</option>
      `,
      '',
    )
    : ''
}
        ${
  _equipment
    ? _equipment
      .filter((item) => (_bookedEquipment ? !_bookedEquipment.includes(item) : item))
      .reduce(
        (accumulator, item) => `
      ${accumulator}
      <option value="${item.equipmentid}">${item.equipmentname}</option>`,
        '',
      )
    : ''
}
      </select>
    `;
    const getHiddenFieldsForBookingEdit = (bookingid) => `
      <input type="hidden" name="edit-booking-id" id="edit-booking-id" value="${bookingid}"/>
    `;
    const getSubmitButtonForBookingEdit = () => `
      <input type="submit" name="submit-edit-booking" id="submit-edit-booking" value="Bestätigen" />
    `;

    if (action === 'edit') {
      e.preventDefault();
      // FIXME: Title slot should be dynamic in the future
      const entryPoint = document.getElementById('lmsr-edit-modal');
      entryPoint.innerHTML = '';
      const lmsrEditModal = document.createElement('lmsr-edit-modal', {
        is: 'lmsr-edit-modal',
      });
      lmsrEditModal.innerHTML = `
      <strong slot="title">Buchung bearbeiten</strong>
      <div slot="content" class="lmsr-edit-modal-body">${getFieldsForBookingEdit(
    {
      _booking: booking,
      _equipment: equipment,
      _bookedEquipment: bookedEquipment,
      _roomnumbers: roomnumbers,
    },
  )}</div>
      <div slot="hidden-inputs" class="lmsr-hidden-inputs">${getHiddenFieldsForBookingEdit(
    booking.bookingid,
  )}</div>
      <div slot="submit">${getSubmitButtonForBookingEdit()}</div>
      `;
      entryPoint.appendChild(lmsrEditModal);
      entryPoint.style.display = 'block';

      const submitEditBookingButton = document.getElementById(
        'submit-edit-booking',
      );
      submitEditBookingButton.addEventListener('click', () => {
        const hiddenInputRoomnumber = document.getElementById(
          'edited-booking-roomnumber',
        );
        const hiddenInputStart = document.getElementById('edited-booking-start');
        const hiddenInputEnd = document.getElementById('edited-booking-end');
        const hiddenInputEquipment = document.getElementById(
          'edited-booking-equipment',
        );
        const hiddenInputId = document.getElementById('edited-booking-id');

        hiddenInputRoomnumber.value = rooms.find(
          (room) => room.roomnumber
            === document.getElementById('edit-booking-roomnumber').value,
        ).roomid;
        hiddenInputStart.value = convertToDatabaseFormat(
          document.getElementById('edit-booking-start').value,
        );
        hiddenInputEnd.value = convertToDatabaseFormat(
          document.getElementById('edit-booking-end').value,
        );
        hiddenInputEquipment.value = Array.from(
          document.getElementById('edit-booking-equipment').childNodes,
        )
          .filter((item) => item.nodeName === 'OPTION')
          .filter((item) => item.selected)
          .reduce((accumulator, item) => `${accumulator},${item.value}`, '')
          .replace(/^,|,$/g, '');
        hiddenInputId.value = document.getElementById('edit-booking-id').value;

        e.target.submit();
      });

      return false;
    }

    return true;
  }

  function validateConfigActions(e) {
    const configAction = document.forms.config_actions.config_actions_selection.value;
    if (configAction === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }

    return true;
  }

  function validateConfirmation(e) {
    const resLimit = document.getElementById('count-limit').value;
    const userLimit = document.getElementById('user-daily-limit').value;

    if (userLimit === resLimit && userLimit > 0 && e.submitter.name === 'confirmationSubmit') {
      return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Sie haben die maximale Anzahl an Reservierungen für Ihr Konto für diesen Tag erreicht.' });
    }

    return true;
  }

  function validateDate(/* dateStr */) { return true; }
  // const regExp = /^(\d{4})-(\d\d?)-(\d\d?)$/;
  // const matches = dateStr.match(regExp);
  // console.log(matches);
  // let isValid = matches;
  // const maxDate = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // if (matches) {
  //   const year = parseInt(matches[1], 10);
  //   const month = parseInt(matches[2], 10);
  //   const date = parseInt(matches[3], 10);

  //   isValid = month <= 12 && month > 0;
  //   isValid &= date <= maxDate[month] && date > 0;

  //   const leapYear = (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);
  //   isValid &= month != 2 || leapYear || date <= 28;
  // }

  // return isValid;

  function validateDisplayRooms(e) {
    const rooms = document.getElementsByName('selected-displayed-room');
    let roomChecked = false;

    rooms.forEach((room) => {
      if (room.checked) { roomChecked = true; }
    });

    if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie mindestens einen Tag aus.' }); }

    return true;
  }

  function validateEditRooms(e) {
    const editChoice = document.forms.editRoomsForm['edit-rooms-choice'].value;
    if (editChoice === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }

    return true;
  }

  function validateEditRoomsEquipment(e) {
    const equipment = document.getElementsByName('edit-rooms-current-equipment');
    let equipmentChecked = false;

    equipment.forEach((item) => {
      if (item.checked) {
        equipmentChecked = true;
      }
    });

    if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Raumaustattung darf nicht leer sein. Sollte der Raum über keine Austattung verfügen, geben Sie \'nichts\' an.' }); }

    return true;
  }

  function validateEditRoomsRoom(e) {
    const roomname = document.forms.editRoomDetails['edit-rooms-room-roomnumber'].value;
    const maxcapacity = document.forms.editRoomDetails['edit-rooms-room-maxcapacity'].value;
    if (roomname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Raumbezeichnung darf nicht leer sein.' }); }
    if (maxcapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Maximalkapazität darf nicht leer sein.' }); }

    return true;
  }

  function validateFullBlackout(e) {
    document.forms.fullBlackoutForm['blackout-start-date'].value;
    document.forms.fullBlackoutForm['blackout-end-date'].value;
    const rooms = document.getElementsByName('current-room-blackout');
    let roomChecked = false;

    rooms.forEach((room) => {
      if (room.checked) { roomChecked = true; }
    });

    if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum oder mehrere Räume aus.' }); }

    return true;
  }

  function validateLimitRestriction(e) {
    const limitCount = document.getElementById('reservations-limit-field').value;
    if (limitCount === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Wert aus.' }); }

    return true;
  }

  function validateManageBlackouts(e) {
    const actionChoice = document.forms.manageBlackoutsForm['manage-blackouts-action'].value;
    if (actionChoice === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }

    return true;
  }

  function validateMaxFutureDate(e) {
    const num = document.getElementById('max-days-field').value;
    if (Number.isNaN(num)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }
    if (num === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

    return true;
  }

  function validateMaxTime(e) {
    const numHours = document.getElementById('max-time-hours-field').value;
    if (numHours === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

    return true;
  }

  function validateOpeningHours(e) {
    const start = document.forms.OpeningHoursForm['opening-from'].value;
    const end = document.forms.OpeningHoursForm['opening-to'].value;

    const weekdays = document.querySelectorAll('input[name="weekdays"]:checked');
    if (weekdays.length === 0) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie mindestens einen Wochentag aus.' }); }
    if (end <= start || start === 0 || end === 0) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine gültige Start- und Endzeit aus.' }); }

    return true;
  }

  function validatePartialBlackout(e) {
    const blackoutStartTime = document.forms.partialBlackoutForm['blackout-start-time'].value;
    const blackoutEndTime = document.forms.partialBlackoutForm['blackout-end-time'].value;
    const rooms = document.getElementsByName('current-room-blackout');
    let blackoutDate = document.forms.partialBlackoutForm['blackout-date'].value;
    let roomChecked = false;

    // convert date format from mm/dd/yyyy to yyyy-mm-dd
    blackoutDate = blackoutDate.replace(/(\d\d)\/(\d\d)\/(\d{4})/, '$3-$1-$2');

    // timestamp of MySQL type DATETIME
    const startTimestamp = `${blackoutDate}  ${blackoutStartTime}`;
    const endTimestamp = `${blackoutDate} ${blackoutEndTime}`;

    // determines if invalid start/end values were entered
    if (startTimestamp >= endTimestamp) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Start- und Endzeit an.' }); }

    rooms.forEach((room) => {
      if (room.checked) { roomChecked = true; }
    });

    if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum oder mehrere Räume aus.' }); }

    return true;
  }

  function validateRestrictCategories(e) {
    const numHours = document.getElementById('max-time-hours-field').value;
    if (numHours === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

    return true;
  }

  function validateSavedRooms(e) {
    const savedRoomsAction = document.forms.saved_rooms.saved_rooms_action.value;
    if (savedRoomsAction === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }
    if (savedRoomsAction === 'delete') {
      const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie den ausgewählten Raum löschen möchten?');
      if (isConfirmedDelete) { return true; }

      e.preventDefault();
      return false;
    }

    const rooms = document.getElementsByName('selectedRoom');
    let roomValue = false;

    rooms.forEach((room) => {
      if (room.checked) { roomValue = true; }
    });

    if (!roomValue) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus.' }); }

    return true;
  }

  exports.LMSEquipmentItem = LMSEquipmentItem;
  exports.LMSEquipmentModal = LMSEquipmentModal;
  exports.LMSModal = LMSModal;
  exports.LMSRoom = LMSRoom;
  exports.LMSRoomModal = LMSRoomModal;
  exports.LMSSearch = LMSSearch;
  exports.LitElement = s;
  exports.closeModal = closeModal;
  exports.closeToast = closeToast;
  exports.deleteEquipmentConfirmation = deleteEquipmentConfirmation;
  exports.deleteRoomConfirmation = deleteRoomConfirmation;
  exports.editEquipmentValidation = editEquipmentValidation;
  exports.getBlackoutsBySelectedRoom = getBlackoutsBySelectedRoom;
  exports.getCheckedOptions = getCheckedOptions;
  exports.getColorTextWithContrast = getColorTextWithContrast;
  exports.getEquipmentBySelectedRoom = getEquipmentBySelectedRoom;
  exports.html = y;
  exports.hydrateAvailabilitySearch = hydrateAvailabilitySearch;
  exports.hydrateRoomConfinement = hydrateRoomConfinement;
  exports.loadSelectedAction = loadSelectedAction;
  exports.notifyOnSubmitWithMessage = notifyOnSubmitWithMessage;
  exports.prohibitFormSubmitWithMessage = prohibitFormSubmitWithMessage;
  exports.renderCalendar = renderCalendar;
  exports.setBlackoutValueOnChange = setBlackoutValueOnChange;
  exports.validateAddEquipment = validateAddEquipment;
  exports.validateAddRooms = validateAddRooms;
  exports.validateAvailabilitySearchForBookas = validateAvailabilitySearchForBookas;
  exports.validateAvailabilitySearchForOPAC = validateAvailabilitySearchForOPAC;
  exports.validateAvailabilitySearchResultsForBookas = validateAvailabilitySearchResultsForBookas;
  exports.validateBookingAction = validateBookingAction;
  exports.validateConfigAction = validateConfigActions;
  exports.validateConfirmation = validateConfirmation;
  exports.validateDate = validateDate;
  exports.validateDisplayRooms = validateDisplayRooms;
  exports.validateEditRooms = validateEditRooms;
  exports.validateEditRoomsEquipment = validateEditRoomsEquipment;
  exports.validateEditRoomsRoom = validateEditRoomsRoom;
  exports.validateFullBlackout = validateFullBlackout;
  exports.validateLimitRestriction = validateLimitRestriction;
  exports.validateManageBlackouts = validateManageBlackouts;
  exports.validateMaxFutureDate = validateMaxFutureDate;
  exports.validateMaxTime = validateMaxTime;
  exports.validateOpeningHours = validateOpeningHours;
  exports.validatePartialBlackout = validatePartialBlackout;
  exports.validateRestrictCategories = validateRestrictCategories;
  exports.validateSavedRooms = validateSavedRooms;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
