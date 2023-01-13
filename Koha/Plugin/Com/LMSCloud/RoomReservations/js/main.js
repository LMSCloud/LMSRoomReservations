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
  const t$5=window,e$9=t$5.ShadowRoot&&(void 0===t$5.ShadyCSS||t$5.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$7=Symbol(),n$8=new WeakMap;class o$8{constructor(t,e,n){if(this._$cssResult$=!0,n!==s$7)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$9&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n$8.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n$8.set(s,t));}return t}toString(){return this.cssText}}const r$5=t=>new o$8("string"==typeof t?t:t+"",void 0,s$7),i$5=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o$8(n,t,s$7)},S$3=(s,n)=>{e$9?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=t$5.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n);}));},c$3=e$9?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$5(e)})(t):t;

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var s$6;const e$8=window,r$4=e$8.trustedTypes,h$3=r$4?r$4.emptyScript:"",o$7=e$8.reactiveElementPolyfillSupport,n$7={toAttribute(t,i){switch(i){case Boolean:t=t?h$3:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},a$3=(t,i)=>i!==t&&(i==i||t==t),l$5={attribute:!0,type:String,converter:n$7,reflect:!1,hasChanged:a$3};class d$3 extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u();}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e));})),t}static createProperty(t,i=l$5){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$5}static finalize(){if(this.hasOwnProperty("finalized"))return !1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c$3(i));}else void 0!==i&&s.push(c$3(i));return s}static _$Ep(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1);}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S$3(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$EO(t,i,s=l$5){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:n$7).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null;}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:n$7;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a$3)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej());}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek();}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek();}updated(t){}firstUpdated(t){}}d$3.finalized=!0,d$3.elementProperties=new Map,d$3.elementStyles=[],d$3.shadowRootOptions={mode:"open"},null==o$7||o$7({ReactiveElement:d$3}),(null!==(s$6=e$8.reactiveElementVersions)&&void 0!==s$6?s$6:e$8.reactiveElementVersions=[]).push("1.5.0");

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  var t$4;const i$4=window,s$5=i$4.trustedTypes,e$7=s$5?s$5.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$6=`lit$${(Math.random()+"").slice(9)}$`,n$6="?"+o$6,l$4=`<${n$6}>`,h$2=document,r$3=(t="")=>h$2.createComment(t),d$2=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u$1=Array.isArray,c$2=t=>u$1(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),v$1=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,a$2=/-->/g,f$1=/>/g,_$1=RegExp(">|[ \t\n\f\r](?:([^\\s\"'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r\"'`<>=]|(\"|')|))|$)","g"),m$1=/'/g,p$1=/"/g,$$1=/^(?:script|style|textarea|title)$/i,g$1=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),y$1=g$1(1),x$1=Symbol.for("lit-noChange"),b$1=Symbol.for("lit-nothing"),T$1=new WeakMap,A$1=h$2.createTreeWalker(h$2,129,null,!1),E$1=(t,i)=>{const s=t.length-1,n=[];let h,r=2===i?"<svg>":"",d=v$1;for(let i=0;i<s;i++){const s=t[i];let e,u,c=-1,g=0;for(;g<s.length&&(d.lastIndex=g,u=d.exec(s),null!==u);)g=d.lastIndex,d===v$1?"!--"===u[1]?d=a$2:void 0!==u[1]?d=f$1:void 0!==u[2]?($$1.test(u[2])&&(h=RegExp("</"+u[2],"g")),d=_$1):void 0!==u[3]&&(d=_$1):d===_$1?">"===u[0]?(d=null!=h?h:v$1,c=-1):void 0===u[1]?c=-2:(c=d.lastIndex-u[2].length,e=u[1],d=void 0===u[3]?_$1:'"'===u[3]?p$1:m$1):d===p$1||d===m$1?d=_$1:d===a$2||d===f$1?d=v$1:(d=_$1,h=void 0);const y=d===_$1&&t[i+1].startsWith("/>")?" ":"";r+=d===v$1?s+l$4:c>=0?(n.push(e),s.slice(0,c)+"$lit$"+s.slice(c)+o$6+y):s+o$6+(-2===c?(n.push(void 0),i):y);}const u=r+(t[s]||"<?>")+(2===i?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return [void 0!==e$7?e$7.createHTML(u):u,n]};class C$1{constructor({strings:t,_$litType$:i},e){let l;this.parts=[];let h=0,d=0;const u=t.length-1,c=this.parts,[v,a]=E$1(t,i);if(this.el=C$1.createElement(v,e),A$1.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(l=A$1.nextNode())&&c.length<u;){if(1===l.nodeType){if(l.hasAttributes()){const t=[];for(const i of l.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(o$6)){const s=a[d++];if(t.push(i),void 0!==s){const t=l.getAttribute(s.toLowerCase()+"$lit$").split(o$6),i=/([.?@])?(.*)/.exec(s);c.push({type:1,index:h,name:i[2],strings:t,ctor:"."===i[1]?M$1:"?"===i[1]?k$1:"@"===i[1]?H$1:S$2});}else c.push({type:6,index:h});}for(const i of t)l.removeAttribute(i);}if($$1.test(l.tagName)){const t=l.textContent.split(o$6),i=t.length-1;if(i>0){l.textContent=s$5?s$5.emptyScript:"";for(let s=0;s<i;s++)l.append(t[s],r$3()),A$1.nextNode(),c.push({type:2,index:++h});l.append(t[i],r$3());}}}else if(8===l.nodeType)if(l.data===n$6)c.push({type:2,index:h});else {let t=-1;for(;-1!==(t=l.data.indexOf(o$6,t+1));)c.push({type:7,index:h}),t+=o$6.length-1;}h++;}}static createElement(t,i){const s=h$2.createElement("template");return s.innerHTML=t,s}}function P$1(t,i,s=t,e){var o,n,l,h;if(i===x$1)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d$2(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=P$1(t,r._$AS(t,i.values),r,e)),i}class V$1{constructor(t,i){this.u=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}v(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:h$2).importNode(s,!0);A$1.currentNode=o;let n=A$1.nextNode(),l=0,r=0,d=e[0];for(;void 0!==d;){if(l===d.index){let i;2===d.type?i=new N$1(n,n.nextSibling,this,t):1===d.type?i=new d.ctor(n,d.name,d.strings,this,t):6===d.type&&(i=new I$1(n,this,t)),this.u.push(i),d=e[++r];}l!==(null==d?void 0:d.index)&&(n=A$1.nextNode(),l++);}return o}p(t){let i=0;for(const s of this.u)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class N$1{constructor(t,i,s,e){var o;this.type=2,this._$AH=b$1,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cm=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cm}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=P$1(this,t,i),d$2(t)?t===b$1||null==t||""===t?(this._$AH!==b$1&&this._$AR(),this._$AH=b$1):t!==this._$AH&&t!==x$1&&this.g(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):c$2(t)?this.k(t):this.g(t);}O(t,i=this._$AB){return this._$AA.parentNode.insertBefore(t,i)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}g(t){this._$AH!==b$1&&d$2(this._$AH)?this._$AA.nextSibling.data=t:this.T(h$2.createTextNode(t)),this._$AH=t;}$(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=C$1.createElement(e.h,this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.p(s);else {const t=new V$1(o,this),i=t.v(this.options);t.p(s),this.T(i),this._$AH=t;}}_$AC(t){let i=T$1.get(t.strings);return void 0===i&&T$1.set(t.strings,i=new C$1(t)),i}k(t){u$1(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new N$1(this.O(r$3()),this.O(r$3()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cm=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class S$2{constructor(t,i,s,e,o){this.type=1,this._$AH=b$1,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=b$1;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=P$1(this,t,i,0),n=!d$2(t)||t!==this._$AH&&t!==x$1,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=P$1(this,e[s+l],i,l),h===x$1&&(h=this._$AH[l]),n||(n=!d$2(h)||h!==this._$AH[l]),h===b$1?t=b$1:t!==b$1&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===b$1?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class M$1 extends S$2{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===b$1?void 0:t;}}const R$1=s$5?s$5.emptyScript:"";class k$1 extends S$2{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==b$1?this.element.setAttribute(this.name,R$1):this.element.removeAttribute(this.name);}}class H$1 extends S$2{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=P$1(this,t,i,0))&&void 0!==s?s:b$1)===x$1)return;const e=this._$AH,o=t===b$1&&e!==b$1||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==b$1&&(e===b$1||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class I$1{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){P$1(this,t);}}const z$1=i$4.litHtmlPolyfillSupport;null==z$1||z$1(C$1,N$1),(null!==(t$4=i$4.litHtmlVersions)&&void 0!==t$4?t$4:i$4.litHtmlVersions=[]).push("2.5.0");const Z$1=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new N$1(i.insertBefore(r$3(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var l$3,o$5;class s$4 extends d$3{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Z$1(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1);}render(){return x$1}}s$4.finalized=!0,s$4._$litElement$=!0,null===(l$3=globalThis.litElementHydrateSupport)||void 0===l$3||l$3.call(globalThis,{LitElement:s$4});const n$5=globalThis.litElementPolyfillSupport;null==n$5||n$5({LitElement:s$4});(null!==(o$5=globalThis.litElementVersions)&&void 0!==o$5?o$5:globalThis.litElementVersions=[]).push("3.2.2");

  class LMSRoom extends s$4 {
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

    static styles = i$5`
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
      return y$1`
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

  class LMSModal extends s$4 {
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
        i$5`
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
      return y$1`
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
        ? y$1`
            <div class="modal">
              <form @submit="${this._create}">
                ${this.fields.map((field) => this._getFieldMarkup(field))}
                <div class="buttons">
                  <button type="submit" class="button">Create</button>
                </div>
              </form>
            </div>
          `
        : y$1``}
    `;
    }

    _getFieldMarkup(field) {
      return field.desc
        ? y$1`
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
        : y$1``;
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

  class LMSEquipmentItem extends s$4 {
    static get properties() {
      return {
        equipmentid: { type: String },
        equipmentname: { type: String },
        editable: { type: Boolean },
      };
    }

    static styles = i$5`
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
      return y$1`
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

  class LMSSearch extends s$4 {
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
      return y$1` <input type="text" @input="${this.handleSearchChange}" /> `;
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
  const t$3={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},e$6=t=>(...e)=>({_$litDirective$:t,values:e});class i$3{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */class e$5 extends i$3{constructor(i){if(super(i),this.it=b$1,i.type!==t$3.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===b$1||null==r)return this._t=void 0,this.it=r;if(r===x$1)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.it)return this._t;this.it=r;const s=[r];return s.raw=s,this._t={_$litType$:this.constructor.resultType,strings:s,values:[]}}}e$5.directiveName="unsafeHTML",e$5.resultType=1;const o$4=e$6(e$5);

  class LMSTable extends s$4 {
    static get properties() {
      return {
        data: { type: Array },
        _isEditable: { type: Boolean, attribute: false },
      };
    }

    static styles = [
      i$5`
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
        ? y$1`
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0]).map((key) => y$1`<th>${key}</th>`)}
                ${this._isEditable ? y$1`<th>actions</th>` : y$1``}
              </tr>
            </thead>
            <tbody>
              ${data.map(
                (item) => y$1`
                  <tr>
                    ${Object.keys(item).map(
                      (key) => y$1`<td>${o$4(item[key])}</td>`
                    )}
                    ${this._isEditable
                      ? y$1`
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
                      : y$1``}
                  </tr>
                `
              )}
            </tbody>
          </table>
        `
        : y$1``;
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

  /**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t$2=window,e$4=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$3=Symbol(),n$4=new WeakMap;class o$3{constructor(t,e,n){if(this._$cssResult$=!0,n!==s$3)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$4&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n$4.set(s,t));}return t}toString(){return this.cssText}}const r$2=t=>new o$3("string"==typeof t?t:t+"",void 0,s$3),i$2=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o$3(n,t,s$3)},S$1=(s,n)=>{e$4?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=t$2.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n);}));},c$1=e$4?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var s$2;const e$3=window,r$1=e$3.trustedTypes,h$1=r$1?r$1.emptyScript:"",o$2=e$3.reactiveElementPolyfillSupport,n$3={toAttribute(t,i){switch(i){case Boolean:t=t?h$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},a$1=(t,i)=>i!==t&&(i==i||t==t),l$2={attribute:!0,type:String,converter:n$3,reflect:!1,hasChanged:a$1};class d$1 extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u();}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e));})),t}static createProperty(t,i=l$2){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$2}static finalize(){if(this.hasOwnProperty("finalized"))return !1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c$1(i));}else void 0!==i&&s.push(c$1(i));return s}static _$Ep(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1);}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S$1(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$EO(t,i,s=l$2){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:n$3).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null;}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:n$3;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a$1)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej());}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek();}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek();}updated(t){}firstUpdated(t){}}d$1.finalized=!0,d$1.elementProperties=new Map,d$1.elementStyles=[],d$1.shadowRootOptions={mode:"open"},null==o$2||o$2({ReactiveElement:d$1}),(null!==(s$2=e$3.reactiveElementVersions)&&void 0!==s$2?s$2:e$3.reactiveElementVersions=[]).push("1.6.1");

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  var t$1;const i$1=window,s$1=i$1.trustedTypes,e$2=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$1=`lit$${(Math.random()+"").slice(9)}$`,n$2="?"+o$1,l$1=`<${n$2}>`,h=document,r=(t="")=>h.createComment(t),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,c=t=>u(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,a=/-->/g,f=/>/g,_=RegExp(">|[ \t\n\f\r](?:([^\\s\"'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r\"'`<>=]|(\"|')|))|$)","g"),m=/'/g,p=/"/g,$=/^(?:script|style|textarea|title)$/i,g=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),y=g(1),x=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),T=new WeakMap,A=h.createTreeWalker(h,129,null,!1),E=(t,i)=>{const s=t.length-1,n=[];let h,r=2===i?"<svg>":"",d=v;for(let i=0;i<s;i++){const s=t[i];let e,u,c=-1,g=0;for(;g<s.length&&(d.lastIndex=g,u=d.exec(s),null!==u);)g=d.lastIndex,d===v?"!--"===u[1]?d=a:void 0!==u[1]?d=f:void 0!==u[2]?($.test(u[2])&&(h=RegExp("</"+u[2],"g")),d=_):void 0!==u[3]&&(d=_):d===_?">"===u[0]?(d=null!=h?h:v,c=-1):void 0===u[1]?c=-2:(c=d.lastIndex-u[2].length,e=u[1],d=void 0===u[3]?_:'"'===u[3]?p:m):d===p||d===m?d=_:d===a||d===f?d=v:(d=_,h=void 0);const y=d===_&&t[i+1].startsWith("/>")?" ":"";r+=d===v?s+l$1:c>=0?(n.push(e),s.slice(0,c)+"$lit$"+s.slice(c)+o$1+y):s+o$1+(-2===c?(n.push(void 0),i):y);}const u=r+(t[s]||"<?>")+(2===i?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return [void 0!==e$2?e$2.createHTML(u):u,n]};class C{constructor({strings:t,_$litType$:i},e){let l;this.parts=[];let h=0,d=0;const u=t.length-1,c=this.parts,[v,a]=E(t,i);if(this.el=C.createElement(v,e),A.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(l=A.nextNode())&&c.length<u;){if(1===l.nodeType){if(l.hasAttributes()){const t=[];for(const i of l.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(o$1)){const s=a[d++];if(t.push(i),void 0!==s){const t=l.getAttribute(s.toLowerCase()+"$lit$").split(o$1),i=/([.?@])?(.*)/.exec(s);c.push({type:1,index:h,name:i[2],strings:t,ctor:"."===i[1]?M:"?"===i[1]?k:"@"===i[1]?H:S});}else c.push({type:6,index:h});}for(const i of t)l.removeAttribute(i);}if($.test(l.tagName)){const t=l.textContent.split(o$1),i=t.length-1;if(i>0){l.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)l.append(t[s],r()),A.nextNode(),c.push({type:2,index:++h});l.append(t[i],r());}}}else if(8===l.nodeType)if(l.data===n$2)c.push({type:2,index:h});else {let t=-1;for(;-1!==(t=l.data.indexOf(o$1,t+1));)c.push({type:7,index:h}),t+=o$1.length-1;}h++;}}static createElement(t,i){const s=h.createElement("template");return s.innerHTML=t,s}}function P(t,i,s=t,e){var o,n,l,h;if(i===x)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=P(t,r._$AS(t,i.values),r,e)),i}class V{constructor(t,i){this.u=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}v(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:h).importNode(s,!0);A.currentNode=o;let n=A.nextNode(),l=0,r=0,d=e[0];for(;void 0!==d;){if(l===d.index){let i;2===d.type?i=new N(n,n.nextSibling,this,t):1===d.type?i=new d.ctor(n,d.name,d.strings,this,t):6===d.type&&(i=new I(n,this,t)),this.u.push(i),d=e[++r];}l!==(null==d?void 0:d.index)&&(n=A.nextNode(),l++);}return o}p(t){let i=0;for(const s of this.u)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class N{constructor(t,i,s,e){var o;this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cm=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cm}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=P(this,t,i),d(t)?t===b||null==t||""===t?(this._$AH!==b&&this._$AR(),this._$AH=b):t!==this._$AH&&t!==x&&this.g(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):c(t)?this.k(t):this.g(t);}O(t,i=this._$AB){return this._$AA.parentNode.insertBefore(t,i)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}g(t){this._$AH!==b&&d(this._$AH)?this._$AA.nextSibling.data=t:this.T(h.createTextNode(t)),this._$AH=t;}$(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=C.createElement(e.h,this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.p(s);else {const t=new V(o,this),i=t.v(this.options);t.p(s),this.T(i),this._$AH=t;}}_$AC(t){let i=T.get(t.strings);return void 0===i&&T.set(t.strings,i=new C(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new N(this.O(r()),this.O(r()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cm=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class S{constructor(t,i,s,e,o){this.type=1,this._$AH=b,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=b;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=P(this,t,i,0),n=!d(t)||t!==this._$AH&&t!==x,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=P(this,e[s+l],i,l),h===x&&(h=this._$AH[l]),n||(n=!d(h)||h!==this._$AH[l]),h===b?t=b:t!==b&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class M extends S{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===b?void 0:t;}}const R=s$1?s$1.emptyScript:"";class k extends S{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==b?this.element.setAttribute(this.name,R):this.element.removeAttribute(this.name);}}class H extends S{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=P(this,t,i,0))&&void 0!==s?s:b)===x)return;const e=this._$AH,o=t===b&&e!==b||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==b&&(e===b||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class I{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t);}}const z=i$1.litHtmlPolyfillSupport;null==z||z(C,N),(null!==(t$1=i$1.litHtmlVersions)&&void 0!==t$1?t$1:i$1.litHtmlVersions=[]).push("2.6.1");const Z=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new N(i.insertBefore(r(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var l,o;class s extends d$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Z(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1);}render(){return x}}s.finalized=!0,s._$litElement$=!0,null===(l=globalThis.litElementHydrateSupport)||void 0===l||l.call(globalThis,{LitElement:s});const n$1=globalThis.litElementPolyfillSupport;null==n$1||n$1({LitElement:s});(null!==(o=globalThis.litElementVersions)&&void 0!==o?o:globalThis.litElementVersions=[]).push("3.2.2");

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const e$1=e=>n=>"function"==typeof n?((e,n)=>(customElements.define(e,n),n))(e,n):((e,n)=>{const{kind:t,elements:s}=n;return {kind:t,elements:s,finisher(n){customElements.define(e,n);}}})(e,n);

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const i=(i,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(n){n.createProperty(e.key,i);}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this));},finisher(n){n.createProperty(e.key,i);}};function e(e){return (n,t)=>void 0!==t?((i,e,n)=>{e.constructor.createProperty(n,i);})(e,n,t):i(e,n)}

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */function t(t){return e({...t,state:!0})}

  /**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var n;null!=(null===(n=window.HTMLSlotElement)||void 0===n?void 0:n.prototype.assignedElements)?(o,n)=>o.assignedElements(n):(o,n)=>o.assignedNodes(n).filter((o=>o.nodeType===Node.ELEMENT_NODE));

  /**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  /**
   * Tag that allows expressions to be used in localized non-HTML template
   * strings.
   *
   * Example: msg(str`Hello ${this.user}!`);
   *
   * The Lit html tag can also be used for this purpose, but HTML will need to be
   * escaped, and there is a small overhead for HTML parsing.
   *
   * Untagged template strings with expressions aren't supported by lit-localize
   * because they don't allow for values to be captured at runtime.
   */
  const _str = (strings, ...values) => ({
      strTag: true,
      strings,
      values,
  });
  const str = _str;
  const isStrTagged = (val) => typeof val !== 'string' && 'strTag' in val;
  /**
   * Render the result of a `str` tagged template to a string. Note we don't need
   * to do this for Lit templates, since Lit itself handles rendering.
   */
  const joinStringsAndValues = (strings, values, valueOrder) => {
      let concat = strings[0];
      for (let i = 1; i < strings.length; i++) {
          concat += values[valueOrder ? valueOrder[i - 1] : i - 1];
          concat += strings[i];
      }
      return concat;
  };

  /**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  /**
   * Default identity msg implementation. Simply returns the input template with
   * no awareness of translations. If the template is str-tagged, returns it in
   * string form.
   */
  const defaultMsg = ((template) => isStrTagged(template)
      ? joinStringsAndValues(template.strings, template.values)
      : template);

  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  class Deferred {
      constructor() {
          this.settled = false;
          this.promise = new Promise((resolve, reject) => {
              this._resolve = resolve;
              this._reject = reject;
          });
      }
      resolve(value) {
          this.settled = true;
          this._resolve(value);
      }
      reject(error) {
          this.settled = true;
          this._reject(error);
      }
  }

  /**
   * @license
   * Copyright 2014 Travis Webb
   * SPDX-License-Identifier: MIT
   */
  for (let i = 0; i < 256; i++) {
      ((i >> 4) & 15).toString(16) + (i & 15).toString(16);
  }

  /**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  let loading = new Deferred();
  // The loading promise must be initially resolved, because that's what we should
  // return if the user immediately calls setLocale(sourceLocale).
  loading.resolve();

  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  /**
   * Make a string or lit-html template localizable.
   *
   * @param template A string, a lit-html template, or a function that returns
   * either a string or lit-html template.
   * @param options Optional configuration object with the following properties:
   *   - id: Optional project-wide unique identifier for this template. If
   *     omitted, an id will be automatically generated from the template strings.
   *   - desc: Optional description
   */
  let msg = defaultMsg;

  function isEmptyObjectOrUndefined(object) {
      if (!object) {
          return true;
      }
      return Object.keys(object).length === 0;
  }

  var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  let Header = class Header extends s {
      render() {
          var _a, _b, _c;
          return y `<div class="controls">
      <div class="info">
        <span>
          <strong>${this.heading}</strong>
        </span>
        <br />
        <span class="day" ?hidden=${isEmptyObjectOrUndefined(this.expandedDate)}
          >${(_a = this.expandedDate) === null || _a === void 0 ? void 0 : _a.day}</span
        >
        <span class="month">${msg(str `${(_b = this.activeDate) === null || _b === void 0 ? void 0 : _b.month}`)}</span>
        <span class="year">${(_c = this.activeDate) === null || _c === void 0 ? void 0 : _c.year}</span>
      </div>
      <div class="context" @click=${this._dispatchSwitchView}>
        <span
          ?data-active=${!isEmptyObjectOrUndefined(this.expandedDate)}
          data-context="day"
          >${msg(str `Day`)}</span
        >
        <span
          ?data-active=${isEmptyObjectOrUndefined(this.expandedDate)}
          data-context="month"
          >${msg(str `Month`)}</span
        >
      </div>
      <div class="buttons" @click=${this._dispatchSwitchMonth}>
        <button name="previous">«</button>
        <button name="next">»</button>
      </div>
    </div>`;
      }
      _dispatchSwitchMonth(e) {
          const target = e.target;
          const direction = e.target === e.currentTarget ? 'container' : target.name;
          const event = new CustomEvent('switchmonth', {
              detail: { direction },
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(event);
      }
      _dispatchSwitchView(e) {
          const target = e.target;
          const view = e.target === e.currentTarget ? 'container' : target.dataset.context;
          const event = new CustomEvent('switchview', {
              detail: { view },
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(event);
      }
  };
  Header.styles = i$2 `
    .controls {
      height: 3.5em;
      width: 100%;
      /* padding: 0.75em 0; */
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-content: center;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--separator-light);
    }
    .info {
      padding-left: 1em;
      text-align: right;
    }
    .day,
    .month,
    .year {
      color: rgba(0, 0, 0, 0.6);
    }
    .context {
      display: flex;
    }
    .context > * {
      padding: 0.25em 0.5em;
      border: 1px solid var(--separator-light);
    }
    .context > *:first-child {
      border-radius: var(--border-radius-sm) 0 0 var(--border-radius-sm);
      border-right: none;
    }
    .context > *:last-child {
      border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
      border-left: none;
    }

    .buttons {
      padding-right: 1em;
    }
    button {
      padding: 0.75em;
      margin: 0;
      border-radius: 50%;
      line-height: 0.5em;
      border: 1px solid transparent;
    }
    span[data-active] {
      background-color: var(--separator-light);
    }
  `;
  __decorate$5([
      e({ type: String })
  ], Header.prototype, "heading", void 0);
  __decorate$5([
      e({ type: Object })
  ], Header.prototype, "activeDate", void 0);
  __decorate$5([
      e({ type: Object })
  ], Header.prototype, "expandedDate", void 0);
  Header = __decorate$5([
      e$1('lms-calendar-header')
  ], Header);

  function getDateByMonthInDirection(date, direction) {
      if (direction === 'previous') {
          return date.month - 1 === 0
              ? { ...date, year: date.year - 1, month: 12 }
              : { ...date, month: date.month - 1 };
      }
      if (direction === 'next') {
          return date.month + 1 === 13
              ? { ...date, year: date.year + 1, month: 1 }
              : { ...date, month: date.month + 1 };
      }
      return date;
  }

  var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  let Month = class Month extends s {
      render() {
          var _a;
          return Object.keys(this.activeDate || { day: 1, month: 1, year: 2022 })
              .length !== 0
              ? y `
          <div class="month">
            ${(_a = this._getCalendarArray()) === null || _a === void 0 ? void 0 : _a.map(({ year, month, day }) => y `<div
                  class="day"
                  data-date="${year}-${month}-${day}"
                  @click=${this._handleExpand}
                >
                  <div class="indicator">
                    ${day === 1 ? `${day}. ${month}` : day}
                  </div>
                  <slot name="${year}-${month}-${day}"></slot>
                </div>`)}
          </div>
        `
              : y ``;
      }
      _handleExpand(e) {
          if (e.target === null) {
              return;
          }
          const target = e.target;
          const { date } = target.dataset;
          if (!date) {
              return;
          }
          const [year, month, day] = date
              .split('-')
              .map((field) => parseInt(field, 10));
          const event = new CustomEvent('expand', {
              detail: { date: { day, month, year } },
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(event);
      }
      _getDaysInMonth(date) {
          /** Important note: Passing 0 as the date shifts the
           *  months indices by positive 1, so 1-12 */
          return new Date(date.year, date.month, 0).getDate();
      }
      _getOffsetOfFirstDayInMonth(date) {
          const offset = new Date(`${date.year}-${date.month}-01`).getDay() - 1;
          return offset === -1 ? 6 : offset;
      }
      _getDatesInMonthAsArray(date, sliceArgs) {
          return [
              ...Array.from(Array(this._getDaysInMonth(date)).keys(), (_, n) => ({
                  year: date.year,
                  month: date.month,
                  day: n + 1,
              })).slice(...sliceArgs),
          ];
      }
      _getCalendarArray() {
          if (!this.activeDate) {
              return;
          }
          const previousMonth = this._getDatesInMonthAsArray(getDateByMonthInDirection(this.activeDate, 'previous'), this._getOffsetOfFirstDayInMonth(this.activeDate)
              ? [this._getOffsetOfFirstDayInMonth(this.activeDate) * -1]
              : [-0, -0]);
          const activeMonth = this._getDatesInMonthAsArray(this.activeDate, []);
          const nextMonth = this._getDatesInMonthAsArray(getDateByMonthInDirection(this.activeDate, 'next'), [0, 42 - (previousMonth.length + activeMonth.length)]);
          return previousMonth.concat(activeMonth, nextMonth);
      }
  };
  Month.styles = i$2 `
    .month {
      /* Header: 3.5em, Context: 2em, Border: 2px */
      height: calc(100% - 5.5em + 2px);
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border-top: 1px solid var(--separator-light);
    }

    .month > div {
      border-bottom: 1px solid var(--separator-light);
      border-right: 1px solid var(--separator-light);
    }

    .month > div:nth-child(7n + 7) {
      border-right: none;
    }

    .month > div:nth-last-child(-n + 7) {
      border-bottom: none;
    }

    .day {
      width: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow-y: scroll;
      gap: 1px;
    }

    .indicator {
      position: sticky;
      top: 0.25em;
      text-align: right;
      padding: 0 0.25em;
      text-align: left;
    }
  `;
  __decorate$4([
      e({ attribute: false })
  ], Month.prototype, "activeDate", void 0);
  Month = __decorate$4([
      e$1('lms-calendar-month')
  ], Month);

  var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  let Day = class Day extends s {
      constructor() {
          super(...arguments);
          this._hours = [...Array(25).keys()];
      }
      render() {
          return y `<div class="container">
      <div class="main">
        ${this._hours.map((hour, index) => y `
              <div class="hour" style=${this._getHourIndicator(hour)}>
                <span class="indicator">
                  ${hour < 10 ? `0${hour}:00` : `${hour}:00`}
                </span>
              </div>
              ${index
            ? y `<div
                    class="separator"
                    style="grid-row: ${hour * 60}"
                  ></div>`
            : y ``}
              <slot name="${hour}" class="entry"></slot>
            `)}
      </div>
      <div class="sidebar"></div>
    </div>`;
      }
      _getHourIndicator(hour) {
          return hour !== 24
              ? `grid-row: ${(hour + 1) * 60 - 59}/${(hour + 1) * 60}`
              : 'grid-row: 1440';
      }
  };
  Day.styles = i$2 `
    .container {
      display: flex;
      /* Header: 3.5em */
      height: calc(100% - 3.5em);
      width: 100%;
    }

    .main {
      display: grid;
      grid-template-columns: 4em 1fr;
      grid-template-rows: repeat(1440, 1fr);
      width: 70%;
      height: calc(100% - 1em);
      gap: 1px;
      overflow-y: scroll;
      text-align: center;
      padding: 0.5em;
      position: relative;
    }

    .hour {
      text-align: center;
    }

    .indicator {
      position: relative;
      top: -0.6em;
    }

    .separator {
      grid-column: 2 / 3;
      border-top: 1px solid var(--separator-light);
      position: absolute;
      width: 100%;
      z-index: -1;
    }

    .sidebar {
      width: 30%;
      height: 100%;
      border-left: 1px solid var(--separator-light);
    }
  `;
  __decorate$3([
      t()
  ], Day.prototype, "_hours", void 0);
  Day = __decorate$3([
      e$1('lms-calendar-day')
  ], Day);

  var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  let Context = class Context extends s {
      constructor() {
          super(...arguments);
          this.weekdays = [];
      }
      render() {
          return this.weekdays
              ? y `<div>
          ${this.weekdays.map((item) => y `<span>${item}</span>`)}
        </div>`
              : b;
      }
  };
  Context.styles = i$2 `
    div {
      height: 1.75em;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }
    span {
      padding: 0.25em;
      text-align: left;
    }
  `;
  __decorate$2([
      e({ attribute: false })
  ], Context.prototype, "weekdays", void 0);
  Context = __decorate$2([
      e$1('lms-calendar-context')
  ], Context);

  var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  let Entry = class Entry extends s {
      constructor() {
          super(...arguments);
          this.heading = '';
          this.isContinuation = false;
      }
      render() {
          var _a;
          return y `
      <div
        class="main"
        ?data-highlighted=${this._highlighted}
        ?data-extended=${this._extended}
      >
        <span @click=${this._handleClick}>
          <span> ${this.heading} </span>
          <span ?hidden=${isEmptyObjectOrUndefined(this.content)}
            >· ${this.content}</span
          >
        </span>
        ${this.isContinuation
            ? y `<span>
              ${(_a = this.time) === null || _a === void 0 ? void 0 : _a.start.hours}:${this.time
                ? this.time.start.minutes < 10
                    ? `0${this.time.start.minutes}`
                    : this.time.start.minutes
                : '00'}
            </span>`
            : y ``}
      </div>
    `;
      }
      _handleClick() {
          this._highlighted = true;
          this._extended = true;
      }
  };
  Entry.styles = i$2 `
    :host {
      font-size: small;
      grid-column: 2;

      border-radius: var(--entry-br);
      grid-row: var(--start-slot);
      width: var(--entry-w);
      margin: var(--entry-m);
      background-color: var(--entry-bc);
      color: var(--entry-c);
    }

    .main {
      display: flex;
      justify-content: space-between;
      padding: 0.25em;
      border-radius: var(--border-radius-sm);
      background-color: inherit;
    }

    .main > span:first-child {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    div[data-highlighted] {
      background: var(--separator-light);
    }
  `;
  __decorate$1([
      e({ attribute: false })
  ], Entry.prototype, "time", void 0);
  __decorate$1([
      e()
  ], Entry.prototype, "heading", void 0);
  __decorate$1([
      e()
  ], Entry.prototype, "content", void 0);
  __decorate$1([
      e()
  ], Entry.prototype, "isContinuation", void 0);
  __decorate$1([
      t()
  ], Entry.prototype, "_highlighted", void 0);
  __decorate$1([
      t()
  ], Entry.prototype, "_extended", void 0);
  Entry = __decorate$1([
      e$1('lms-calendar-entry')
  ], Entry);

  function getColorTextWithContrast(color) {
      let red = 0;
      let green = 0;
      let blue = 0;
      if (color) {
          const matches = color
              .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`)
              .substring(1)
              .match(/.{2}/g);
          if (!matches) {
              // Return default background and text colors
              return ['rgb(255,255,255)', 'rgb(0,0,0)'];
          }
          [red, green, blue] = matches.map((x) => parseInt(x, 16));
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

  /** This is an implementation of the sweep-line algorithm
   *  Ref: https://www.baeldung.com/cs/finding-all-overlapping-intervals \
   *  Example: https://stackoverflow.com/questions/30472556/how-to-find-all-overlapping-ranges-and-partition-them-into-chunks
   */
  function partitionOverlappingIntervals(intervals) {
      const rightEndValues = intervals.map((r) => r.end).sort((a, b) => a - b);
      intervals.sort((a, b) => a.start - b.start);
      let i = 0;
      let j = 0;
      let active = 0;
      const groups = [];
      let cur = [];
      // eslint-disable-next-line no-constant-condition
      while (1) {
          if (i < intervals.length && intervals[i].start < rightEndValues[j]) {
              cur.push(intervals[i++]);
              ++active;
          }
          else if (j < intervals.length) {
              ++j;
              if (--active === 0) {
                  groups.push(cur);
                  cur = [];
              }
          }
          else
              break;
      }
      return groups;
  }

  function getOverlappingEntitiesIndices(partitions) {
      /** First we determine all non-overlapping partitions and save their indices.
       *  Indices go into the index portion of the resolving objects and we add
       *  a depth of 0 to indicate, that this is a full-width element.
       */
      const result = partitions.reduce((accumulator, partition, index) => partition.length === 1
          ? [
              ...accumulator,
              {
                  index: [partitions.slice(0, index)].flatMap((item) => item.flat().length)[0],
                  depth: 0,
                  group: index,
              },
          ]
          : [...accumulator], []);
      /** Then we filter the non-overlapping partitions out */
      const _partitions = partitions
          .map((partition, index) => partition.map((item, _index) => ({
          ...item,
          index: [partitions.slice(0, index)].flatMap((item) => item.flat().length)[0] + _index,
          group: index,
      })))
          .filter((partition) => partition.length > 1);
      /** For each of the remaining partitions we have to check how deeply they overlap.
       *  TODO: Add indictor for partition group; document...
       */
      let depth = 0;
      let openGroup = Math.min(...[..._partitions.map((partition) => partition[0].group)]);
      function recursiveBubbleSort({ partitions, isNested = false }) {
          depth = isNested ? (depth += 1) : 0;
          partitions.forEach((partition) => {
              const { group } = partition[0];
              if (openGroup !== group) {
                  depth = 0;
              }
              openGroup = group;
              const delta = [...partition.map(({ start, end }) => end - start)];
              const maxDelta = Math.max(...delta);
              const indexMaxDelta = delta.indexOf(maxDelta);
              result.push({
                  index: partition[indexMaxDelta].index,
                  depth,
                  group: partition[indexMaxDelta].group,
              });
              partition.splice(delta.indexOf(maxDelta), 1);
              recursiveBubbleSort({
                  partitions: partitionOverlappingIntervals(partition),
                  isNested: true,
              });
          });
      }
      recursiveBubbleSort({ partitions: _partitions });
      return result.sort((a, b) => a.index - b.index);
  }

  function haveSameValues(a, b) {
      if (Object.keys(a).length !== Object.keys(b).length) {
          return false;
      }
      return Object.entries(a).every(([key, value]) => {
          // Check if the key exists in both objects and if the type of the value for the key is the same
          if (key in a && key in b && typeof a[key] === typeof b[key]) {
              // Compare the values of the key in both objects
              return value === b[key];
          }
          return false;
      });
  }

  function rearrangeDepths(gradings) {
      const groups = new Map();
      gradings.forEach(item => {
          if (!groups.has(item.group)) {
              groups.set(item.group, []);
          }
          groups.get(item.group).push({ index: item.index, depth: item.depth, group: item.group });
      });
      const result = [];
      groups.forEach(groupGradings => {
          groupGradings.sort((a, b) => a.index - b.index);
          groupGradings.forEach((item, i) => {
              result.push({ index: item.index, depth: i, group: item.group });
          });
      });
      result.sort((a, b) => a.index - b.index);
      return result;
  }

  var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  let LMSCalendar = class LMSCalendar extends s {
      constructor() {
          super(...arguments);
          this.heading = 'Current Bookings';
          this.activeDate = {
              day: 1,
              month: 1,
              year: 2022,
          };
          this.weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
          this.entries = [];
          this.color = '#000000';
      }
      render() {
          return y `
      <div>
        <lms-calendar-header
          @switchmonth=${this._handleSwitchMonth}
          @switchview=${this._handleSwitchView}
          .heading=${this.heading}
          .activeDate=${this.activeDate}
          .expandedDate=${this._expandedDate}
        >
        </lms-calendar-header>

        <lms-calendar-context
          .weekdays=${this.weekdays}
          ?hidden=${!isEmptyObjectOrUndefined(this._expandedDate)}
        >
        </lms-calendar-context>

        <lms-calendar-month
          @expand=${this._handleExpand}
          .activeDate=${this.activeDate}
          ?hidden=${!isEmptyObjectOrUndefined(this._expandedDate)}
        >
          ${this._getEntries()}
        </lms-calendar-month>

        <lms-calendar-day
          ?hidden=${isEmptyObjectOrUndefined(this._expandedDate)}
        >
          ${this._getEntriesByDate()}
        </lms-calendar-day>
      </div>
    `;
      }
      _handleSwitchMonth(e) {
          this.activeDate = getDateByMonthInDirection(this.activeDate, e.detail.direction);
      }
      _handleSwitchView(e) {
          if (e.detail.view === 'day') {
              this._expandedDate = !isEmptyObjectOrUndefined(this._expandedDate)
                  ? this._expandedDate
                  : this.activeDate;
          }
          if (e.detail.view === 'month') {
              this._expandedDate = undefined;
          }
      }
      _handleExpand(e) {
          this._expandedDate = e.detail.date;
      }
      // _getEntries() {
      //   return this.entries.length !== 0
      //     ? html`${this.entries
      //         .sort(
      //           (a, b) =>
      //             a.time.start.hours - b.time.start.hours ||
      //             a.time.start.minutes - b.time.start.minutes
      //         )
      //         .map(({date, time, heading, color}, index) => {
      //           const [background, text] = getColorTextWithContrast(color);
      //           return html`
      //             <style>
      //               lms-calendar-entry.${`_${index}`} {
      //                 --entry-m: 0 0.25em 0 1.5em;
      //                 --entry-bc: ${background};
      //                 --entry-c: ${text};
      //               }
      //             </style>
      //             <lms-calendar-entry
      //               class=${`_${index}`}
      //               slot="${date.start.year}-${date.start.month}-${date.start.day}"
      //               .time=${time}
      //               .heading=${heading}
      //             >
      //             </lms-calendar-entry>
      //           `;
      //         })}`
      //     : html``;
      // }
      _getEntries() {
          return this.entries.length !== 0
              ? y `${this.entries
                .sort((a, b) => a.time.start.hours - b.time.start.hours ||
                a.time.start.minutes - b.time.start.minutes)
                .map(({ date, time, heading, color }, index) => {
                const [background, text] = getColorTextWithContrast(color);
                // Calculate the number of days the entry spans
                const startDate = new Date(date.start.year, date.start.month - 1, date.start.day);
                const endDate = new Date(date.end.year, date.end.month - 1, date.end.day);
                const rangeDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
                // Create an array of <lms-calendar-entry> elements for each day the entry spans
                const entries = [];
                for (let i = 0; i < rangeDays; i++) {
                    // Calculate the start and end date for the current entry
                    const currentStartDate = new Date(startDate.getTime() + i * (1000 * 3600 * 24));
                    const currentEndDate = new Date(currentStartDate.getTime() + (1000 * 3600 * 24) - 1);
                    // Create the entry object for the current day
                    const currentEntry = {
                        date: {
                            start: {
                                day: currentStartDate.getDate(),
                                month: currentStartDate.getMonth() + 1,
                                year: currentStartDate.getFullYear(),
                            },
                            end: {
                                day: currentEndDate.getDate(),
                                month: currentEndDate.getMonth() + 1,
                                year: currentEndDate.getFullYear(),
                            },
                        },
                        time,
                        heading,
                        color,
                    };
                    // Add the <lms-calendar-entry> element to the array
                    entries.push(y `
                <style>
                  lms-calendar-entry.${`_${index}`} {
                    --entry-br: ${rangeDays > 1 ? 0 : `var(--border-radius-sm)`};
                    --entry-m: 0 ${i !== 0 ? 0 : `0.25em`} 0 ${i !== 0 ? 0 : `1.5em`};
                    --entry-bc: ${background};
                    --entry-c: ${text};
                  }
                </style>
                <lms-calendar-entry
                  class=${`_${index}`}
                  slot="${currentEntry.date.start.year}-${currentEntry.date.start.month}-${currentEntry.date.start.day}"
                  .time=${currentEntry.time}
                  .heading=${rangeDays > 1 && i > 0 ? '' : currentEntry.heading}
                >
                </lms-calendar-entry>
              `);
                }
                // Return the array of <lms-calendar-entry> elements
                return entries;
            })}`
              : y ``;
      }
      _getEntriesByDate() {
          if (isEmptyObjectOrUndefined(this._expandedDate)) {
              return;
          }
          const entriesByDate = this.entries.filter((entry) => {
              return haveSameValues(entry.date.start, this._expandedDate || {});
          });
          const grading = rearrangeDepths(!isEmptyObjectOrUndefined(entriesByDate)
              ? getOverlappingEntitiesIndices(this._getPartitionedSlottedItems(entriesByDate))
              : []);
          return entriesByDate.map(({ time, heading, content, color }, index) => {
              const [background, text] = getColorTextWithContrast(color);
              return y `
        <style>
          lms-calendar-entry.${`_${index}`} {
            --start-slot: ${this._getGridSlotByTime(time)};
            --entry-w: ${this._getWidthByGroupSize({ grading, index })}%;
            --entry-m: 0 1.5em 0 ${this._getOffsetByDepth({ grading, index })}%;
            --entry-bc: ${background};
            --entry-c: ${text};
          }
        </style>
        <lms-calendar-entry
          class=${`_${index}`}
          slot=${time.start.hours}
          .time=${time}
          .heading=${heading}
          .content=${content}
        >
        </lms-calendar-entry>
      `;
          });
      }
      _getGridSlotByTime({ start, end }) {
          const startRow = start.hours * 60 + (start.minutes + 1);
          return `${startRow}/${startRow + (end.hours * 60 + end.minutes - startRow)}`;
      }
      _getWidthByGroupSize({ grading, index }) {
          return (100 / grading.filter((item) => item.group === grading[index].group).length);
      }
      _getOffsetByDepth({ grading, index }) {
          return grading[index].depth === 0
              ? 0
              : grading[index].depth *
                  (100 /
                      grading.filter((item) => item.group === grading[index].group)
                          .length);
      }
      _getPartitionedSlottedItems(items) {
          return partitionOverlappingIntervals(items
              .map((entry) => this._getGridSlotByTime(entry.time)
              .replace(/[^0-9/]+/g, '')
              .split('/'))
              .map(([start, end]) => [parseInt(start, 10), parseInt(end, 10)])
              .map(([start, end]) => ({ start, end })));
      }
  };
  LMSCalendar.styles = i$2 `
    :host {
      --shadow-sm: rgba(0, 0, 0, 0.18) 0px 2px 4px;
      --shadow-md: rgba(0, 0, 0, 0.15) 0px 3px 3px 0px;
      --shadow-lg: rgba(0, 0, 0, 0.15) 0px 2px 8px;
      --shadow-hv: rgba(0, 0, 0, 0.08) 0px 4px 12px;

      --breakpoint-xs: 425px;
      --breakpoint-sm: 768px;
      --breakpoint-md: 1024px;

      --separator-light: rgba(0, 0, 0, 0.1);
      --separator-mid: rgba(0, 0, 0, 0.4);
      --separator-dark: rgba(0, 0, 0, 0.7);

      --system-ui: system, -apple-system, '.SFNSText-Regular', 'San Francisco',
        'Roboto', 'Segoe UI', 'Helvetica Neue', 'Lucida Grande', sans-serif;

      --border-radius-sm: 5px;
      --border-radius-md: 7px;
      --border-radius-lg: 12px;
    }
    div {
      height: 100%;
      width: 100%;
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--separator-light);
      font-family: var(--system-ui);
      color: var(--separator-dark);
      box-shadow: var(--shadow-md);
    }
  `;
  __decorate([
      e({ type: String })
  ], LMSCalendar.prototype, "heading", void 0);
  __decorate([
      e({ type: Object })
  ], LMSCalendar.prototype, "activeDate", void 0);
  __decorate([
      e({ type: Array })
  ], LMSCalendar.prototype, "weekdays", void 0);
  __decorate([
      e({ type: Array })
  ], LMSCalendar.prototype, "entries", void 0);
  __decorate([
      e({ type: String })
  ], LMSCalendar.prototype, "color", void 0);
  __decorate([
      t()
  ], LMSCalendar.prototype, "_expandedDate", void 0);
  LMSCalendar = __decorate([
      e$1('lms-calendar')
  ], LMSCalendar);
  var LMSCalendar$1 = LMSCalendar;

  class LMSBookie extends s$4 {
    static properties = {
      _openHours: { state: true },
      _rooms: { state: true },
    };

    static styles = [
      i$5`
      .card {
        padding: 16px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--seperator-light);
        border-radius: var(--border-radius-lg);
      }

      #rooms {
        overflow-y: scroll;
        height: 80%; /* adjust to desired height */
        display: flex;
        gap: 1em;
      }

      .room {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid var(--seperator-light);
        border-radius: var(--border-radius-md);
      }

      .room img {
        width: 100%;
        border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
        aspect-ratio: 16 / 9;
      }

      .room p {
        margin: 5px 0;
      }

      dl {
        padding: 0 1em;
      }

      dt,
      dd {
        font-size: small;
      }

      dt {
        font-weight: bold;
      }

      dd {
        border-bottom: 1px solid var(--seperator-light);
      }
    `,
    ];

    async _init() {
      const options = { headers: { accept: "" } };
      const [openHours, rooms] = await Promise.all([
        fetch("/api/v1/contrib/roomreservations/open_hours", options),
        fetch("/api/v1/contrib/roomreservations/rooms", options),
      ]);

      if (openHours.ok) {
        this._openHours = await openHours.json();
      } else {
        console.error("Error fetching open hours");
      }

      if (rooms.ok) {
        this._rooms = await rooms.json();
      } else {
        console.error("Error fetching rooms");
      }
    }

    constructor() {
      super();
      this._openHours = [];
      this._rooms = [];
      this._init();
    }

    _handleSubmit() {
      const [roomid, start, duration] = [
        this.renderRoot.getElementById("room"),
        this.renderRoot.getElementById("start-datetime"),
        this.renderRoot.getElementById("duration"),
      ].map((input) => input.value);

      //TODO: Add duration to start and assign to end

      fetch("/api/v1/contrib/roomreservations/bookings/", {
        method: "POST",
        headers: {
          accept: "",
        },
        body: JSON.stringify([
          {
            borrowernumber: 42,
            roomid,
            start,
            end,
            blackedout: 0,
          },
        ]),
      });
    }

    render() {
      return y$1`
      <div class="card" ?hidden=${!this._rooms.length}>
        <div id="booking">
          <div><strong>Book a room</strong></div>
          <small
            >Pick a room, a date, a time and the duration of your
            reservation.</small
          >
          <div>
            <label for="room">
              Room
              <select id="room" name="room">
                ${this._rooms.length &&
                this._rooms.map(
                  (room) =>
                    y$1`<option value="${room.roomid}">
                      ${room.roomnumber}
                    </option>`
                )}
              </select>
            </label>
          </div>
          <div>
            <label for="start-datetime">
              Date & Time
              <input
                type="datetime-local"
                id="start-datetime"
                name="start-datetime"
              />
            </label>
          </div>
          <div>
            <label for="duration">
              Duration
              <input
                type="number"
                list="durations"
                id="duration"
                name="duration"
              />
              <datalist id="durations">
                <option>30</option>
                <option>60</option>
                <option>90</option>
                <option>120</option>
              </datalist>
            </label>
          </div>
          <button type="submit" @click=${this._handleSubmit}>Submit</button>
        </div>
        <div>
          <strong ?hidden=${!this._openHours.length}>Open hours</strong>
        </div>
        <div id="open-hours" ?hidden=${!this._openHours.length}>
          ${this._openHours.map(
            (day) => y$1`
              <div>
                <span>${day.day}</span>
                <span>${day.start}</span>
                <span>${day.end}</span>
              </div>
            `
          )}
        </div>
        <div><strong>Rooms</strong></div>
        <div id="rooms">
          ${this._rooms.map(
            (room) => y$1`
              <div class="room">
                <img src="${room.image}" />
                <dl>
                  <dt>Room Number</dt>
                  <dd>${room.roomnumber}</dd>
                  <dt>Description</dt>
                  <dd>${room.description}</dd>
                  <dt>Branch</dt>
                  <dd>${room.branch}</dd>
                  <dt>Max Bookable Time</dt>
                  <dd>${room.maxbookabletime}</dd>
                  <dt>Capacity</dt>
                  <dd>${room.maxcapacity}</dd>
                </dl>
              </div>
            `
          )}
        </div>
      </div>
    `;
    }
  }
  customElements.define("lms-bookie", LMSBookie);

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

  exports.LMSBookie = LMSBookie;
  exports.LMSBookingsModal = LMSBookingsModal;
  exports.LMSBookingsTable = LMSBookingsTable;
  exports.LMSCalendar = LMSCalendar$1;
  exports.LMSEquipmentItem = LMSEquipmentItem;
  exports.LMSEquipmentModal = LMSEquipmentModal;
  exports.LMSModal = LMSModal;
  exports.LMSOpenHoursTable = LMSOpenHoursTable;
  exports.LMSRoom = LMSRoom;
  exports.LMSRoomModal = LMSRoomModal;
  exports.LMSSearch = LMSSearch;
  exports.LMSSettingsTable = LMSSettingsTable;
  exports.LMSTable = LMSTable;
  exports.LitElement = s$4;
  exports.html = y$1;
  exports.renderOnUpdate = renderOnUpdate;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
