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
  const t$2=window,e$4=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$3=Symbol(),n$3=new WeakMap;class o$4{constructor(t,e,n){if(this._$cssResult$=!0,n!==s$3)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$4&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n$3.set(s,t));}return t}toString(){return this.cssText}}const r$2=t=>new o$4("string"==typeof t?t:t+"",void 0,s$3),i$2=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o$4(n,t,s$3)},S$1=(s,n)=>{e$4?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=t$2.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n);}));},c$1=e$4?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var s$2;const e$3=window,r$1=e$3.trustedTypes,h$1=r$1?r$1.emptyScript:"",o$3=e$3.reactiveElementPolyfillSupport,n$2={toAttribute(t,i){switch(i){case Boolean:t=t?h$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},a$1=(t,i)=>i!==t&&(i==i||t==t),l$2={attribute:!0,type:String,converter:n$2,reflect:!1,hasChanged:a$1};class d$1 extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u();}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e));})),t}static createProperty(t,i=l$2){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$2}static finalize(){if(this.hasOwnProperty("finalized"))return !1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c$1(i));}else void 0!==i&&s.push(c$1(i));return s}static _$Ep(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1);}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S$1(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$EO(t,i,s=l$2){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:n$2).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null;}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:n$2;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a$1)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej());}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek();}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek();}updated(t){}firstUpdated(t){}}d$1.finalized=!0,d$1.elementProperties=new Map,d$1.elementStyles=[],d$1.shadowRootOptions={mode:"open"},null==o$3||o$3({ReactiveElement:d$1}),(null!==(s$2=e$3.reactiveElementVersions)&&void 0!==s$2?s$2:e$3.reactiveElementVersions=[]).push("1.5.0");

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  var t$1;const i$1=window,s$1=i$1.trustedTypes,e$2=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$2=`lit$${(Math.random()+"").slice(9)}$`,n$1="?"+o$2,l$1=`<${n$1}>`,h=document,r=(t="")=>h.createComment(t),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,c=t=>u(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,a=/-->/g,f=/>/g,_=RegExp(">|[ \t\n\f\r](?:([^\\s\"'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r\"'`<>=]|(\"|')|))|$)","g"),m=/'/g,p=/"/g,$=/^(?:script|style|textarea|title)$/i,g=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),y=g(1),x=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),T=new WeakMap,A=h.createTreeWalker(h,129,null,!1),E=(t,i)=>{const s=t.length-1,n=[];let h,r=2===i?"<svg>":"",d=v;for(let i=0;i<s;i++){const s=t[i];let e,u,c=-1,g=0;for(;g<s.length&&(d.lastIndex=g,u=d.exec(s),null!==u);)g=d.lastIndex,d===v?"!--"===u[1]?d=a:void 0!==u[1]?d=f:void 0!==u[2]?($.test(u[2])&&(h=RegExp("</"+u[2],"g")),d=_):void 0!==u[3]&&(d=_):d===_?">"===u[0]?(d=null!=h?h:v,c=-1):void 0===u[1]?c=-2:(c=d.lastIndex-u[2].length,e=u[1],d=void 0===u[3]?_:'"'===u[3]?p:m):d===p||d===m?d=_:d===a||d===f?d=v:(d=_,h=void 0);const y=d===_&&t[i+1].startsWith("/>")?" ":"";r+=d===v?s+l$1:c>=0?(n.push(e),s.slice(0,c)+"$lit$"+s.slice(c)+o$2+y):s+o$2+(-2===c?(n.push(void 0),i):y);}const u=r+(t[s]||"<?>")+(2===i?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return [void 0!==e$2?e$2.createHTML(u):u,n]};class C{constructor({strings:t,_$litType$:i},e){let l;this.parts=[];let h=0,d=0;const u=t.length-1,c=this.parts,[v,a]=E(t,i);if(this.el=C.createElement(v,e),A.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(l=A.nextNode())&&c.length<u;){if(1===l.nodeType){if(l.hasAttributes()){const t=[];for(const i of l.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(o$2)){const s=a[d++];if(t.push(i),void 0!==s){const t=l.getAttribute(s.toLowerCase()+"$lit$").split(o$2),i=/([.?@])?(.*)/.exec(s);c.push({type:1,index:h,name:i[2],strings:t,ctor:"."===i[1]?M:"?"===i[1]?k:"@"===i[1]?H:S});}else c.push({type:6,index:h});}for(const i of t)l.removeAttribute(i);}if($.test(l.tagName)){const t=l.textContent.split(o$2),i=t.length-1;if(i>0){l.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)l.append(t[s],r()),A.nextNode(),c.push({type:2,index:++h});l.append(t[i],r());}}}else if(8===l.nodeType)if(l.data===n$1)c.push({type:2,index:h});else {let t=-1;for(;-1!==(t=l.data.indexOf(o$2,t+1));)c.push({type:7,index:h}),t+=o$2.length-1;}h++;}}static createElement(t,i){const s=h.createElement("template");return s.innerHTML=t,s}}function P(t,i,s=t,e){var o,n,l,h;if(i===x)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=P(t,r._$AS(t,i.values),r,e)),i}class V{constructor(t,i){this.u=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}v(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:h).importNode(s,!0);A.currentNode=o;let n=A.nextNode(),l=0,r=0,d=e[0];for(;void 0!==d;){if(l===d.index){let i;2===d.type?i=new N(n,n.nextSibling,this,t):1===d.type?i=new d.ctor(n,d.name,d.strings,this,t):6===d.type&&(i=new I(n,this,t)),this.u.push(i),d=e[++r];}l!==(null==d?void 0:d.index)&&(n=A.nextNode(),l++);}return o}p(t){let i=0;for(const s of this.u)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class N{constructor(t,i,s,e){var o;this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cm=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cm}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=P(this,t,i),d(t)?t===b||null==t||""===t?(this._$AH!==b&&this._$AR(),this._$AH=b):t!==this._$AH&&t!==x&&this.g(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):c(t)?this.k(t):this.g(t);}O(t,i=this._$AB){return this._$AA.parentNode.insertBefore(t,i)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}g(t){this._$AH!==b&&d(this._$AH)?this._$AA.nextSibling.data=t:this.T(h.createTextNode(t)),this._$AH=t;}$(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=C.createElement(e.h,this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.p(s);else {const t=new V(o,this),i=t.v(this.options);t.p(s),this.T(i),this._$AH=t;}}_$AC(t){let i=T.get(t.strings);return void 0===i&&T.set(t.strings,i=new C(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new N(this.O(r()),this.O(r()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cm=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class S{constructor(t,i,s,e,o){this.type=1,this._$AH=b,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=b;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=P(this,t,i,0),n=!d(t)||t!==this._$AH&&t!==x,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=P(this,e[s+l],i,l),h===x&&(h=this._$AH[l]),n||(n=!d(h)||h!==this._$AH[l]),h===b?t=b:t!==b&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class M extends S{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===b?void 0:t;}}const R=s$1?s$1.emptyScript:"";class k extends S{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==b?this.element.setAttribute(this.name,R):this.element.removeAttribute(this.name);}}class H extends S{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=P(this,t,i,0))&&void 0!==s?s:b)===x)return;const e=this._$AH,o=t===b&&e!==b||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==b&&(e===b||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class I{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t);}}const z=i$1.litHtmlPolyfillSupport;null==z||z(C,N),(null!==(t$1=i$1.litHtmlVersions)&&void 0!==t$1?t$1:i$1.litHtmlVersions=[]).push("2.5.0");const Z=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new N(i.insertBefore(r(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var l,o$1;class s extends d$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Z(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1);}render(){return x}}s.finalized=!0,s._$litElement$=!0,null===(l=globalThis.litElementHydrateSupport)||void 0===l||l.call(globalThis,{LitElement:s});const n=globalThis.litElementPolyfillSupport;null==n||n({LitElement:s});(null!==(o$1=globalThis.litElementVersions)&&void 0!==o$1?o$1:globalThis.litElementVersions=[]).push("3.2.2");

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

    static styles = i$2`
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
      const event = new CustomEvent('modified', { bubbles: true });
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
      return [
        i$2`
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
      `,
      ];
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
      const { endpoint, method, multiple } = this.createOpts;
      const response = await fetch(`${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "",
        },
        body: JSON.stringify(
          Object.assign(
            ...this.fields.map(({ name, value }) => ({ [name]: value }))
          )
        ),
      });

      if (response.status === 201) {
        this._toggleModal(); /** Implement success toast here */

        const event = new CustomEvent("created", { bubbles: true });
        this.dispatchEvent(event);
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

    static styles = i$2`
    div {
      padding: 1em;
      border: 1px solid var(--seperator-light);
      border-radius: var(--border-radius-md);
      width: max-content;
    }

    span {
      font-weight: bold;
    }

    button {
      border: 2px solid rgb(51, 51, 51);
      border-radius: 3px;
      background-color: rgb(51, 51, 51);
      color: rgb(255, 255, 255);
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
      const event = new CustomEvent("modified", { bubbles: true });
      this.dispatchEvent(event);
    }

    render() {
      return y`
      <div>
        <span>${this.equipmentid}</span>
        <input
          type="text"
          ?disabled=${!this.editable}
          .value=${this.equipmentname}
          @input=${(e) => {
            this.equipmentname = e.target.value;
          }}
          class="input"
        />
        <button @click=${this.handleEdit}>
          Edit
        </button>
        <button @click=${this.handleSave}>
          Save
        </button>
      </div>
    `;
    }
  }

  customElements.define("lms-equipment-item", LMSEquipmentItem);

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

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},e$1=t=>(...e)=>({_$litDirective$:t,values:e});class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */class e extends i{constructor(i){if(super(i),this.it=b,i.type!==t.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===b||null==r)return this._t=void 0,this.it=r;if(r===x)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.it)return this._t;this.it=r;const s=[r];return s.raw=s,this._t={_$litType$:this.constructor.resultType,strings:s,values:[]}}}e.directiveName="unsafeHTML",e.resultType=1;const o=e$1(e);

  class LMSTable extends s {
    static get properties() {
      return {
        data: { type: Array },
        _isEditable: { type: Boolean, attribute: false },
      };
    }

    static styles = [
      i$2`
      table {
        background: white;
        padding: 1em;
        border-radius: var(--border-radius-lg);
      }

      thead {
        border-bottom: 1px solid var(--seperator-light);
      }

      tbody > tr:nth-child(odd) {
        background-color: whitesmoke;
      }
    `,
    ];

    constructor() {
      super();
      this._isEditable = false;
      this._notImplementedInBaseMessage =
        "Implement this method in your extended LMSTable component.";
    }

    _handleEdit() {
      console.log(this._notImplementedInBaseMessage);
    }

    _handleSave() {
      console.log(this._notImplementedInBaseMessage);
    }

    _handleChange() {
      console.log(this._notImplementedInBaseMessage);
    }

    render() {
      const { data } = this;

      return data?.length
        ? y`
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0]).map((key) => y`<th>${key}</th>`)}
                ${this._isEditable ? y`<th>actions</th>` : y``}
              </tr>
            </thead>
            <tbody>
              ${data.map(
                (item) => y`
                  <tr>
                    ${Object.keys(item).map(
                      (key) => y`<td>${o(item[key])}</td>`
                    )}
                    ${this._isEditable
                      ? y`
                          <td @change=${this._handleChange}>
                            <div class="columns">
                              <div class="column">
                                <button
                                  @click=${this._handleEdit}
                                  class=""
                                >
                                  Edit
                                </button>
                              </div>
                              <div class="column">
                                <button
                                  @click=${this._handleSave}
                                  class=""
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </td>
                        `
                      : y``}
                  </tr>
                `
              )}
            </tbody>
          </table>
        `
        : y``;
    }
  }

  customElements.define("lms-table", LMSTable);

  class LMSSettingsTable extends LMSTable {
    static get properties() {
      return {
        data: { type: Array },
        _isEditable: { type: Boolean, attribute: false },
      };
    }

    _handleEdit(e) {
      let parent = e.target.parentElement;
      while (parent.tagName !== "TR") {
        parent = parent.parentElement;
      }

      const inputs = parent.querySelectorAll("input");
      inputs.forEach((input) => {
        input.disabled = false;
      });
    }

    async _handleSave(e) {
      let parent = e.target.parentElement;
      while (parent.tagName !== "TR") {
        parent = parent.parentElement;
      }

      const inputs = Array.from(parent.querySelectorAll("input"));
      const actions = {
        restricted_patron_categories: () => {
          inputs.filter((input) => !input.checked);
        },
        patron_categories: async () => {
          const data = inputs
            .filter((input) => input.checked)
            .map((input) => ({
              setting: `rcat_${input.name}`,
              value: input.name,
            }));

          const response = await fetch(
            "/api/v1/contrib/roomreservations/settings",
            {
              method: "POST",
              body: JSON.stringify(data),
              headers: {
                'Accept': '',
              },
            }
          );
          return response.status;
        },
      };

      if (inputs.length > 1) {
        const category = parent.firstElementChild.textContent;
        if (inputs.every((input) => input.type === "checkbox")) {
          const action = actions[category];
          if (action) {
            const status = await action();
            if ([201, 204].includes(status)) {
              // Implement success message
              inputs.forEach((input) => {
                input.disabled = true;
              });
            }
          }
        }
        return;
      }

      const [input] = inputs;
      const response = await fetch(
        `/api/v1/contrib/roomreservations/settings/${input.name}`,
        {
          method: "PUT",
          body: JSON.stringify({ value: input.value }),
          headers: {
            'Accept': '',
          },
        }
      );

      if (response.status === 201) {
        // Implement success message
        input.disabled = true;
      }
    }

    _handleChange() {}

    constructor() {
      super();
      this._isEditable = true;
    }
  }

  customElements.define("lms-settings-table", LMSSettingsTable);

  class LMSOpenHoursTable extends LMSTable {
    static get properties() {
      return {
        data: { type: Array },
        _isEditable: { type: Boolean, attribute: false },
      };
    }

    _handleEdit(e) {
      if (this._isReady) {
        let parent = e.target.parentElement;
        while (parent.tagName !== "TR") {
          parent = parent.parentElement;
        }

        const inputs = parent.querySelectorAll("input");
        inputs.forEach((input) => {
          input.disabled = false;
        });
      }
    }

    async _handleSave(e) {
      let parent = e.target.parentElement;
      while (parent.tagName !== "TR") {
        parent = parent.parentElement;
      }

      const inputs = Array.from(parent.querySelectorAll("input"));
      const [start, end] = inputs;
      const response = await fetch(
        `/api/v1/contrib/roomreservations/open_hours/${
        this._dayConversionMap[start.name]
      }`,
        {
          method: "PUT",
          body: JSON.stringify({
            day: this._dayConversionMap[start.name],
            start: start.value,
            end: end.value,
          }),
          headers: {
            Accept: "",
          },
        }
      );

      if (response.status === 201) {
        // Implement success message
        [start, end].forEach((input) => (input.disabled = true));
      }
    }

    _handleChange() {}

    async _init() {
      const endpoint = "/api/v1/contrib/roomreservations/open_hours";
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "",
        },
      });
      const result = await response.json();
      if (!result.length) {
        const response = await fetch(endpoint, {
          method: "POST",
          body: JSON.stringify(
            Array.from({ length: 7 }, (_, i) => ({
              day: i,
              start: "00:00",
              end: "00:00",
            }))
          ),
          headers: {
            Accept: "",
          },
        });
        return response.status === 201;
      }
      return result.length > 0;
    }

    constructor() {
      super();
      this._isEditable = true;
      this._dayConversionMap = {
        monday: 0,
        tuesday: 1,
        wednesday: 2,
        thursday: 3,
        friday: 4,
        saturday: 5,
        sunday: 6,
      };
      this._isReady = this._init();
    }
  }

  customElements.define("lms-open-hours-table", LMSOpenHoursTable);

  class LMSBookingsTable extends LMSTable {
    static properties = {
      data: { type: Array },
      _isEditable: { type: Boolean, attribute: false },
    };

    _handleEdit(e) {
      let parent = e.target.parentElement;
      while (parent.tagName !== "TR") {
        parent = parent.parentElement;
      }

      const inputs = parent.querySelectorAll("input");
      inputs.forEach((input) => {
        input.disabled = false;
      });
    }

    async _handleSave(e) {
      let parent = e.target.parentElement;
      while (parent.tagName !== "TR") {
        parent = parent.parentElement;
      }

      /** The api expects integers so we convert them */
      const [bookingid, borrowernumber] = [
        ...Array.from(parent.children).map((element) =>
          parseInt(element.textContent, 10)
        ),
      ];
      const inputs = Array.from(parent.querySelectorAll("input"));
      /** Same here, roomid needs to be an integer */
      const [roomid, start, end] = [
        ...inputs.map((input, index) =>
          index === 0 ? parseInt(input.value, 10) : input.value
        ),
      ];

      const response = await fetch(
        `/api/v1/contrib/roomreservations/bookings/${bookingid}`,
        {
          method: "PUT",
          body: JSON.stringify({ borrowernumber, roomid, start, end }),
          headers: {
            Accept: "",
          },
        }
      );

      if (response.status === 201) {
        // Implement success message
        inputs.forEach((input) => {
          input.disabled = true;
        });
      }
    }

    _handleChange() {}

    async _getData() {
      const response = await fetch("/api/v1/contrib/roomreservations/bookings", {
        method: "GET",
        headers: {
          Accept: "",
        },
      });

      const result = await response.json();

      if (result.length) {
        this.data = result
          .map((datum) =>
            Object.keys(datum)
              .sort((a, b) => {
                const order = [
                  "bookingid",
                  "borrowernumber",
                  "roomid",
                  "start",
                  "end",
                  "blackedout",
                  "created",
                  "updated_at",
                ];
                return order.indexOf(a) - order.indexOf(b);
              })
              .reduce((acc, key) => ({ ...acc, [key]: datum[key] }), {})
          )
          .map((datum) =>
            Object.keys(datum).reduce(
              (acc, key) => ({
                ...acc,
                [key]: this._inputFromValue({
                  key,
                  value:
                    typeof datum[key] !== "string"
                      ? datum[key].toString()
                      : datum[key],
                }),
              }),
              {}
            )
          );
      }
    }

    _inputFromValue({ key, value }) {
      return (
        {
          start: `<input type="datetime-local" name="start" value="${value}" disabled />`,
          end: `<input type="datetime-local" name="end" value="${value}" disabled />`,
          roomid: `<input type="number" name="roomid" value="${value}" disabled />`,
        }[key] || value
      );
    }

    constructor() {
      super();
      this._isEditable = true;
      this.data = [];
      this._getData();
    }
  }

  customElements.define("lms-bookings-table", LMSBookingsTable);

  class LMSBookingsModal extends LMSModal {
    static get properties() {
      return { fields: { type: Array } };
    }

    constructor() {
      super();
      this.fields = [
        { name: 'borrowernumber', type: 'number', desc: 'Borrowernumber' },
        { name: 'roomid', type: 'number', desc: 'Roomid' },
        { name: 'start', type: 'datetime-local', desc: 'Starts at' },
        { name: 'end', type: 'datetime-local', desc: 'Ends at' },
        { name: 'blackedout', type: 'integer', desc: 'Is blackout' },
      ];
      this.createOpts = {
        endpoint: '/api/v1/contrib/roomreservations/bookings',
        method: 'POST',
      };
    }
  }

  customElements.define('lms-bookings-modal', LMSBookingsModal);

  function renderOnUpdate({
    entryPoint,
    tagname,
    eventName,
    eventTarget,
    endpoint,
    options = {},
  }) {
    const entryPointRef = entryPoint;
    const eventTargetRef = eventTarget || entryPoint;
    eventTargetRef.addEventListener(eventName, async () => {
      const response = await fetch(endpoint, options);
      if ([200, 201].includes(response.status)) {
        const result = await response.json();
        entryPointRef.innerHTML = '';
        result.forEach((item) => {
          const element = document.createElement(tagname);
          Object.keys(item).forEach((key) => {
            element.setAttribute(key, item[key]);
          });
          entryPointRef.appendChild(element);
        });
      }
    });
  }

  exports.LMSBookingsModal = LMSBookingsModal;
  exports.LMSBookingsTable = LMSBookingsTable;
  exports.LMSEquipmentItem = LMSEquipmentItem;
  exports.LMSEquipmentModal = LMSEquipmentModal;
  exports.LMSModal = LMSModal;
  exports.LMSOpenHoursTable = LMSOpenHoursTable;
  exports.LMSRoom = LMSRoom;
  exports.LMSRoomModal = LMSRoomModal;
  exports.LMSSearch = LMSSearch;
  exports.LMSSettingsTable = LMSSettingsTable;
  exports.LMSTable = LMSTable;
  exports.LitElement = s;
  exports.html = y;
  exports.renderOnUpdate = renderOnUpdate;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
