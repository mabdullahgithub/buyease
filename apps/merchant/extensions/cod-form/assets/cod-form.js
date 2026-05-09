/* BuyEase COD Form — Storefront Widget v1.0
 * Plain JS, no external dependencies.
 * Injected via Shopify Theme App Extension.
 */
(function () {
  'use strict';

  var ROOT_ID = 'buyease-cod-root';
  var OVERLAY_ID = 'buyease-overlay';
  var STYLE_ID = 'buyease-styles';

  var _ctx = {};
  var _btnCfg = null;
  var _formCfg = null;
  var _rates = [];
  var _overlay = null;

  // ─── Fallback defaults (used when API is unreachable or shop has no saved config) ─
  var DEFAULT_BTN_CFG = {
    buttonText: 'Order via COD',
    buttonSubtitle: null,
    iconId: 'cart',
    iconAlign: 'start',
    showIcon: true,
    animation: 'none',
    stickyPosition: 'off',
    stickyMobile: true,
    mobileFullWidth: false,
    bgColor: '#000000',
    textColor: '#FFFFFF',
    borderColor: '#000000',
    fontSizePx: 16,
    borderRadiusPx: 8,
    borderWidthPx: 0,
    shadowStrength: 0,
    isBold: false,
    isItalic: false,
    isVisible: true,
  };

  var DEFAULT_FORM_CFG = {
    formType: 'popup',
    fields: [
      { id: 'header', type: 'header', title: 'Please fill in the form to order', hidden: false },
      { id: 'cart', type: 'cart', hidden: false },
      { id: 'first_name', type: 'input', title: 'First Name', placeholder: 'Enter your first name', required: true, iconId: 'user', hidden: false },
      { id: 'phone', type: 'input', title: 'Phone', placeholder: 'Enter your phone number', required: true, iconId: 'phone', hidden: false },
      { id: 'address', type: 'input', title: 'Address', placeholder: 'Enter your full address', required: true, iconId: 'map-pin', hidden: false },
      { id: 'city', type: 'input', title: 'City', placeholder: 'Enter your city', required: true, iconId: 'building', hidden: false },
      { id: 'postal_code', type: 'input', title: 'Postal Code', placeholder: 'Enter your postal code', required: false, hidden: false },
      { id: 'shipping', type: 'shipping', title: 'Shipping Method', hidden: false },
      { id: 'summary', type: 'summary', hidden: false },
      { id: 'submit', type: 'submit', title: 'Place Order', hidden: false },
    ],
    formBgColor: '#FFFFFF',
    formTextColor: '#000000',
    formBorderColor: '#E5E5E5',
    formBorderRadiusPx: 12,
    formBorderWidthPx: 1,
    formShadowPx: 8,
    formPaddingPx: 24,
    formTextBold: false,
    formTextItalic: false,
    fieldBgColor: '#FFFFFF',
    fieldTextColor: '#000000',
    fieldBorderColor: '#D1D5DB',
    fieldBorderRadiusPx: 6,
    fieldFontSizePx: 14,
    textAlign: 'left',
    hideLabels: false,
    showIcons: true,
    rtl: false,
    autocomplete: true,
    stickyMobile: true,
    errorRequired: 'This field is required',
    errorInvalid: 'Please enter a valid value',
    errorSoldOut: 'This product is sold out',
    isVisible: true,
  };

  // ─── SVG Icons ───────────────────────────────────────────────────────────────
  var ICONS = {
    cart: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    truck: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    package: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    cash: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
    store: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    bag: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    phone: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.29 6.29l1.91-1.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    receipt: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M9 7h6"/><path d="M9 11h6"/><path d="M9 15h4"/></svg>',
    wallet: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>',
    delivery: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1"/><path d="M9 18H7"/><path d="M17 18h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h-2"/><rect x="5" y="4" width="14" height="14" rx="2"/><path d="M9 10h6"/><path d="M9 14h4"/></svg>',
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtPrice(cents, currency) {
    var amount = cents / 100;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(amount);
    } catch (e) {
      return (currency || 'USD') + ' ' + amount.toFixed(2);
    }
  }

  function fmtRatePrice(price, currency) {
    if (price === 0) return 'Free';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(price);
    } catch (e) {
      return (currency || 'USD') + ' ' + Number(price).toFixed(2);
    }
  }

  function getIcon(iconId) {
    return ICONS[iconId] || ICONS['cart'];
  }

  // ─── Styles ──────────────────────────────────────────────────────────────────
  function injectStyles(btnCfg, formCfg) {
    if (document.getElementById(STYLE_ID)) return;

    var shadow = btnCfg.shadowStrength > 0
      ? '0 ' + Math.round(btnCfg.shadowStrength / 3) + 'px ' + btnCfg.shadowStrength + 'px rgba(0,0,0,0.2)'
      : 'none';

    var btnAnimation = '';
    if (btnCfg.animation && btnCfg.animation !== 'none') {
      btnAnimation = buildAnimationCSS(btnCfg.animation);
    }

    var css = [
      '/* BuyEase Widget */',
      '#buyease-btn {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 8px;',
      '  width: 100%;',
      '  cursor: pointer;',
      '  border: ' + btnCfg.borderWidthPx + 'px solid ' + esc(btnCfg.borderColor) + ';',
      '  border-radius: ' + btnCfg.borderRadiusPx + 'px;',
      '  background: ' + esc(btnCfg.bgColor) + ';',
      '  color: ' + esc(btnCfg.textColor) + ';',
      '  font-size: ' + btnCfg.fontSizePx + 'px;',
      '  font-weight: ' + (btnCfg.isBold ? '700' : '500') + ';',
      '  font-style: ' + (btnCfg.isItalic ? 'italic' : 'normal') + ';',
      '  padding: 12px 20px;',
      '  box-shadow: ' + shadow + ';',
      '  transition: opacity 0.15s ease;',
      '  box-sizing: border-box;',
      '  margin-top: 12px;',
      '}',
      '#buyease-btn:hover { opacity: 0.88; }',
      '#buyease-btn:active { opacity: 0.75; }',
      '#buyease-btn svg { flex-shrink: 0; }',
      '.buyease-btn-text { display: flex; flex-direction: column; align-items: center; line-height: 1.2; }',
      '.buyease-btn-sub { font-size: 0.72em; opacity: 0.8; margin-top: 2px; }',
      btnAnimation,

      /* Sticky button */
      '#buyease-sticky-wrap {',
      '  position: fixed;',
      '  left: 0; right: 0;',
      '  z-index: 9000;',
      '  padding: 10px 16px;',
      '  background: rgba(255,255,255,0.97);',
      '  backdrop-filter: blur(4px);',
      '  box-shadow: 0 -2px 12px rgba(0,0,0,0.1);',
      '}',
      '#buyease-sticky-wrap.sticky-top { top: 0; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }',
      '#buyease-sticky-wrap.sticky-bottom { bottom: 0; }',

      /* Overlay */
      '#buyease-overlay {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 99999;',
      '  background: rgba(0,0,0,0.55);',
      '  display: flex;',
      '  align-items: flex-end;',
      '  justify-content: center;',
      '  animation: buye-fadein 0.18s ease;',
      '}',
      '@media (min-width: 640px) {',
      '  #buyease-overlay { align-items: center; }',
      '}',

      /* Form card */
      '#buyease-form-card {',
      '  background: ' + esc(formCfg.formBgColor) + ';',
      '  color: ' + esc(formCfg.formTextColor) + ';',
      '  border: ' + formCfg.formBorderWidthPx + 'px solid ' + esc(formCfg.formBorderColor) + ';',
      '  border-radius: ' + formCfg.formBorderRadiusPx + 'px ' + formCfg.formBorderRadiusPx + 'px 0 0;',
      '  box-shadow: 0 -4px ' + formCfg.formShadowPx + 'px rgba(0,0,0,0.15);',
      '  padding: ' + formCfg.formPaddingPx + 'px;',
      '  width: 100%;',
      '  max-height: 90vh;',
      '  overflow-y: auto;',
      '  box-sizing: border-box;',
      '  font-weight: ' + (formCfg.formTextBold ? '600' : '400') + ';',
      '  font-style: ' + (formCfg.formTextItalic ? 'italic' : 'normal') + ';',
      '  direction: ' + (formCfg.rtl ? 'rtl' : 'ltr') + ';',
      '  position: relative;',
      '  animation: buye-slidein 0.22s ease;',
      '}',
      '@media (min-width: 640px) {',
      '  #buyease-form-card {',
      '    border-radius: ' + formCfg.formBorderRadiusPx + 'px;',
      '    max-width: 480px;',
      '    max-height: 85vh;',
      '  }',
      '}',

      /* Close button */
      '#buyease-close {',
      '  position: absolute;',
      '  top: 12px;',
      '  ' + (formCfg.rtl ? 'left' : 'right') + ': 12px;',
      '  background: none;',
      '  border: none;',
      '  cursor: pointer;',
      '  color: ' + esc(formCfg.formTextColor) + ';',
      '  opacity: 0.6;',
      '  padding: 4px;',
      '  line-height: 1;',
      '  font-size: 20px;',
      '}',
      '#buyease-close:hover { opacity: 1; }',

      /* Form fields */
      '.buye-field { margin-bottom: 14px; }',
      '.buye-label {',
      '  display: block;',
      '  font-size: 13px;',
      '  margin-bottom: 5px;',
      '  color: ' + esc(formCfg.formTextColor) + ';',
      '  text-align: ' + esc(formCfg.textAlign) + ';',
      '  ' + (formCfg.hideLabels ? 'display: none !important;' : '') + '',
      '}',
      '.buye-label.required::after { content: " *"; color: #e53e3e; }',
      '.buye-input-wrap { position: relative; }',
      '.buye-input {',
      '  width: 100%;',
      '  box-sizing: border-box;',
      '  background: ' + esc(formCfg.fieldBgColor) + ';',
      '  color: ' + esc(formCfg.fieldTextColor) + ';',
      '  border: 1px solid ' + esc(formCfg.fieldBorderColor) + ';',
      '  border-radius: ' + formCfg.fieldBorderRadiusPx + 'px;',
      '  font-size: ' + formCfg.fieldFontSizePx + 'px;',
      '  padding: 10px 12px;',
      '  outline: none;',
      '  transition: border-color 0.15s;',
      '}',
      '.buye-input:focus { border-color: ' + esc(formCfg.formBorderColor) + '; box-shadow: 0 0 0 2px ' + esc(formCfg.formBorderColor) + '33; }',
      '.buye-input.has-icon { padding-' + (formCfg.rtl ? 'right' : 'left') + ': 36px; }',
      '.buye-field-icon {',
      '  position: absolute;',
      '  top: 50%; transform: translateY(-50%);',
      '  ' + (formCfg.rtl ? 'right' : 'left') + ': 10px;',
      '  color: ' + esc(formCfg.fieldTextColor) + ';',
      '  opacity: 0.5;',
      '  pointer-events: none;',
      '}',
      '.buye-error { color: #e53e3e; font-size: 12px; margin-top: 4px; display: none; }',
      '.buye-input.invalid { border-color: #e53e3e; }',
      '.buye-input.invalid + .buye-error, .buye-input.invalid ~ .buye-error { display: block; }',

      /* Shipping rates */
      '.buye-rate-option {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 10px;',
      '  padding: 10px 12px;',
      '  border: 1px solid ' + esc(formCfg.fieldBorderColor) + ';',
      '  border-radius: ' + formCfg.fieldBorderRadiusPx + 'px;',
      '  margin-bottom: 8px;',
      '  cursor: pointer;',
      '  background: ' + esc(formCfg.fieldBgColor) + ';',
      '  color: ' + esc(formCfg.fieldTextColor) + ';',
      '  transition: border-color 0.15s;',
      '}',
      '.buye-rate-option.selected { border-color: ' + esc(formCfg.formBorderColor) + '; box-shadow: 0 0 0 1px ' + esc(formCfg.formBorderColor) + '; }',
      '.buye-rate-option input[type=radio] { accent-color: ' + esc(formCfg.formBorderColor) + '; }',
      '.buye-rate-name { flex: 1; font-size: ' + formCfg.fieldFontSizePx + 'px; }',
      '.buye-rate-price { font-weight: 600; font-size: ' + formCfg.fieldFontSizePx + 'px; }',

      /* Order summary */
      '.buye-summary { background: ' + esc(formCfg.fieldBgColor) + '; border-radius: ' + formCfg.fieldBorderRadiusPx + 'px; padding: 10px 14px; margin-bottom: 14px; font-size: 14px; }',
      '.buye-summary-row { display: flex; justify-content: space-between; padding: 4px 0; }',
      '.buye-summary-total { border-top: 1px solid ' + esc(formCfg.fieldBorderColor) + '; margin-top: 6px; padding-top: 6px; font-weight: 700; }',

      /* Checkbox */
      '.buye-checkbox-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }',
      '.buye-checkbox-wrap input { accent-color: ' + esc(formCfg.formBorderColor) + '; width: 16px; height: 16px; }',

      /* Submit button */
      '#buyease-submit {',
      '  width: 100%;',
      '  padding: 13px 20px;',
      '  background: ' + esc(formCfg.formBorderColor) + ';',
      '  color: #fff;',
      '  border: none;',
      '  border-radius: ' + formCfg.fieldBorderRadiusPx + 'px;',
      '  font-size: 16px;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  margin-top: 8px;',
      '  transition: opacity 0.15s;',
      '}',
      '#buyease-submit:hover { opacity: 0.88; }',
      '#buyease-submit:disabled { opacity: 0.55; cursor: not-allowed; }',

      /* Success / Error screens */
      '#buyease-success, #buyease-error-screen {',
      '  text-align: center;',
      '  padding: 24px 0;',
      '}',
      '#buyease-success .buye-icon-big, #buyease-error-screen .buye-icon-big { font-size: 48px; margin-bottom: 12px; }',
      '#buyease-success h2 { font-size: 20px; margin: 0 0 8px; color: ' + esc(formCfg.formTextColor) + '; }',
      '#buyease-success p, #buyease-error-screen p { font-size: 14px; opacity: 0.75; margin: 0 0 16px; color: ' + esc(formCfg.formTextColor) + '; }',

      /* Divider */
      '.buye-divider { border: none; border-top: 1px solid ' + esc(formCfg.fieldBorderColor) + '; margin: 14px 0; }',

      /* Section title */
      '.buye-section-title { font-size: 13px; font-weight: 600; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px; }',

      /* Header field */
      '.buye-form-header { font-size: 18px; font-weight: 700; margin: 0 0 16px; padding-right: 28px; color: ' + esc(formCfg.formTextColor) + '; text-align: ' + esc(formCfg.textAlign) + '; }',

      /* Animations */
      '@keyframes buye-fadein { from { opacity: 0; } to { opacity: 1; } }',
      '@keyframes buye-slidein { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
      '@keyframes shake-lr { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }',
      '@keyframes shake-ud { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-4px)} 75%{transform:translateY(4px)} }',
      '@keyframes buye-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }',
      '@keyframes buye-bounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} 60%{transform:translateY(-4px)} }',
    ].join('\n');

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildAnimationCSS(anim) {
    var map = {
      'shake-lr': 'shake-lr 0.6s ease infinite',
      'shake-ud': 'shake-ud 0.6s ease infinite',
      'shake-bottom': 'shake-ud 0.6s ease infinite',
      'pulse': 'buye-pulse 1.4s ease infinite',
      'bounce': 'buye-bounce 1.2s ease infinite',
      'fanfare': 'buye-pulse 0.8s ease 3',
    };
    var value = map[anim];
    if (!value) return '';
    return '#buyease-btn { animation: ' + value + '; }';
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return;

    _ctx = {
      shop: root.dataset.shop || '',
      apiBase: (root.dataset.apiBase || '').replace(/\/$/, ''),
      productId: root.dataset.productId || '',
      variantId: root.dataset.variantId || '',
      priceInCents: parseInt(root.dataset.price || '0', 10),
      currency: root.dataset.currency || 'USD',
      productTitle: root.dataset.productTitle || 'Product',
    };

    if (!_ctx.shop || !_ctx.apiBase || !_ctx.variantId) return;

    Promise.all([
      fetch(_ctx.apiBase + '/api/storefront/buy-button-config?shop=' + encodeURIComponent(_ctx.shop)),
      fetch(_ctx.apiBase + '/api/storefront/form-config?shop=' + encodeURIComponent(_ctx.shop)),
      fetch(_ctx.apiBase + '/api/storefront/shipping-rates?shop=' + encodeURIComponent(_ctx.shop)),
    ])
      .then(function (responses) {
        return Promise.all(responses.map(function (r) { return r.ok ? r.json() : null; }));
      })
      .then(function (results) {
        _btnCfg = results[0] || DEFAULT_BTN_CFG;
        _formCfg = results[1] || DEFAULT_FORM_CFG;
        _rates = (results[2] && results[2].rates) ? results[2].rates : [];

        if (_btnCfg.isVisible === false) return;

        injectStyles(_btnCfg, _formCfg);
        renderButton(root);
      })
      .catch(function () {
        _btnCfg = DEFAULT_BTN_CFG;
        _formCfg = DEFAULT_FORM_CFG;
        injectStyles(_btnCfg, _formCfg);
        renderButton(root);
      });
  }

  // ─── Button ───────────────────────────────────────────────────────────────────
  function renderButton(root) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'buyease-btn';
    btn.setAttribute('aria-label', _btnCfg.buttonText);

    var iconHtml = (_btnCfg.showIcon !== false)
      ? '<span class="buye-btn-icon" style="display:flex;align-items:center;">' + getIcon(_btnCfg.iconId) + '</span>'
      : '';

    var subtitleHtml = _btnCfg.buttonSubtitle
      ? '<span class="buyease-btn-sub">' + esc(_btnCfg.buttonSubtitle) + '</span>'
      : '';

    var textHtml = '<span class="buyease-btn-text"><span>' + esc(_btnCfg.buttonText) + '</span>' + subtitleHtml + '</span>';

    btn.innerHTML = _btnCfg.iconAlign === 'end'
      ? textHtml + iconHtml
      : iconHtml + textHtml;

    btn.addEventListener('click', openForm);

    if (_btnCfg.stickyPosition && _btnCfg.stickyPosition !== 'off') {
      var wrap = document.createElement('div');
      wrap.id = 'buyease-sticky-wrap';
      wrap.className = 'sticky-' + _btnCfg.stickyPosition;
      if (_btnCfg.mobileFullWidth) wrap.style.padding = '10px 0';
      wrap.appendChild(btn);
      document.body.appendChild(wrap);
    } else {
      var inserted = false;

      // Try to insert after the Add to Cart button (works across most themes)
      var atcBtn = document.querySelector(
        'form[action*="/cart/add"] [name="add"], ' +
        'form[action*="/cart/add"] [data-add-to-cart], ' +
        'form[action*="/cart/add"] button[type="submit"]'
      );
      if (atcBtn && atcBtn.parentNode) {
        atcBtn.parentNode.insertBefore(btn, atcBtn.nextSibling);
        inserted = true;
      }

      // Fallback: append to product form
      if (!inserted) {
        var productForm = document.querySelector('form[action*="/cart/add"]');
        if (productForm) {
          productForm.appendChild(btn);
          inserted = true;
        }
      }

      // Last resort: append to root (still visible at bottom of page)
      if (!inserted) {
        root.appendChild(btn);
      }
    }
  }

  // ─── Form ─────────────────────────────────────────────────────────────────────
  function openForm() {
    if (_overlay) return;

    _overlay = document.createElement('div');
    _overlay.id = OVERLAY_ID;

    var card = document.createElement('div');
    card.id = 'buyease-form-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', 'COD Order Form');

    card.innerHTML = buildFormHTML();
    _overlay.appendChild(card);
    document.body.appendChild(_overlay);
    document.body.style.overflow = 'hidden';

    bindFormEvents(card);

    // Focus first input
    var firstInput = card.querySelector('input, select, textarea');
    if (firstInput) firstInput.focus();
  }

  function closeForm() {
    if (_overlay) {
      _overlay.remove();
      _overlay = null;
      document.body.style.overflow = '';
    }
  }

  // ─── Form HTML ────────────────────────────────────────────────────────────────
  function buildFormHTML() {
    var fields = Array.isArray(_formCfg.fields) ? _formCfg.fields : [];
    var visibleFields = fields.filter(function (f) { return !f.hidden; });

    var parts = [
      '<button type="button" id="buyease-close" aria-label="Close">&#215;</button>',
      '<form id="buyease-form" novalidate autocomplete="' + (_formCfg.autocomplete !== false ? 'on' : 'off') + '">',
    ];

    visibleFields.forEach(function (field) {
      parts.push(renderField(field));
    });

    parts.push('</form>');
    return parts.join('');
  }

  function renderField(field) {
    switch (field.type) {
      case 'header':
        return '<h2 class="buye-form-header">' + esc(field.title || '') + '</h2>';

      case 'cart':
        return renderCartField(field);

      case 'summary':
        return renderSummaryField(field);

      case 'shipping':
        return renderShippingField(field);

      case 'checkbox':
        return renderCheckboxField(field);

      case 'submit':
        return renderSubmitField(field);

      case 'input':
        return renderInputField(field, 'text');

      case 'textarea':
        return renderTextareaField(field);

      case 'select':
        return renderSelectField(field);

      default:
        return renderInputField(field, 'text');
    }
  }

  function renderCartField(field) {
    var price = fmtPrice(_ctx.priceInCents, _ctx.currency);
    return [
      '<div class="buye-summary" id="buye-cart-summary">',
      '  <div class="buye-summary-row">',
      '    <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(_ctx.productTitle) + '</span>',
      '    <span style="margin-left:12px;white-space:nowrap;">' + price + '</span>',
      '  </div>',
      '</div>',
    ].join('');
  }

  function renderSummaryField(field) {
    var subtotal = fmtPrice(_ctx.priceInCents, _ctx.currency);
    return [
      '<div class="buye-summary" id="buye-order-summary">',
      '  <div class="buye-summary-row"><span>Subtotal</span><span>' + subtotal + '</span></div>',
      '  <div class="buye-summary-row" id="buye-shipping-row" style="display:none;"><span>Shipping</span><span id="buye-shipping-price">-</span></div>',
      '  <div class="buye-summary-row buye-summary-total"><span>Total</span><span id="buye-total-price">' + subtotal + '</span></div>',
      '</div>',
    ].join('');
  }

  function renderShippingField(field) {
    if (!_rates.length) return '';

    var label = field.hideLabel ? '' : '<div class="buye-label">' + esc(field.title || 'Shipping Method') + '</div>';
    var options = _rates.map(function (rate, idx) {
      var priceStr = fmtRatePrice(rate.price, rate.currency || _ctx.currency);
      var checked = idx === 0 ? 'checked' : '';
      var selected = idx === 0 ? ' selected' : '';
      return [
        '<label class="buye-rate-option' + selected + '">',
        '  <input type="radio" name="buye-shipping" value="' + esc(rate.id) + '" data-price="' + rate.price + '" data-currency="' + esc(rate.currency || _ctx.currency) + '" ' + checked + '>',
        '  <span class="buye-rate-name">' + esc(rate.name) + (rate.description ? '<br><small style="opacity:.65">' + esc(rate.description) + '</small>' : '') + '</span>',
        '  <span class="buye-rate-price">' + priceStr + '</span>',
        '</label>',
      ].join('');
    }).join('');

    return '<div class="buye-field" id="buye-shipping-field">' + label + options + '</div>';
  }

  function renderInputField(field, type) {
    var inputType = type || 'text';
    if (field.id === 'phone' || field.id === 'customerPhone') inputType = 'tel';
    if (field.id === 'email' || field.id === 'customerEmail') inputType = 'email';

    var label = field.hideLabel ? '' : [
      '<label class="buye-label' + (field.required ? ' required' : '') + '" for="buye-' + esc(field.id) + '">',
      esc(field.title || ''),
      '</label>',
    ].join('');

    var showIcon = _formCfg.showIcons !== false && field.showIcon !== false && field.iconId && ICONS[field.iconId];
    var iconHtml = showIcon
      ? '<span class="buye-field-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + getIconPath(field.iconId) + '</svg></span>'
      : '';

    var autocomplete = _formCfg.autocomplete !== false ? getAutocomplete(field.id) : 'off';

    return [
      '<div class="buye-field">',
      label,
      '<div class="buye-input-wrap">',
      iconHtml,
      '<input',
      '  type="' + inputType + '"',
      '  id="buye-' + esc(field.id) + '"',
      '  name="' + esc(field.id) + '"',
      '  class="buye-input' + (showIcon ? ' has-icon' : '') + '"',
      '  placeholder="' + esc(field.placeholder || '') + '"',
      '  autocomplete="' + autocomplete + '"',
      '  ' + (field.required ? 'required' : '') + '',
      '  ' + (field.minLength ? 'minlength="' + field.minLength + '"' : '') + '',
      '  ' + (field.maxLength ? 'maxlength="' + field.maxLength + '"' : '') + '',
      '  data-field-id="' + esc(field.id) + '"',
      '  data-required="' + (field.required ? 'true' : 'false') + '"',
      '>',
      '<div class="buye-error">' + esc(field.errorMessage || _formCfg.errorRequired || 'This field is required') + '</div>',
      '</div>',
      '</div>',
    ].join('');
  }

  function renderTextareaField(field) {
    var label = field.hideLabel ? '' : [
      '<label class="buye-label' + (field.required ? ' required' : '') + '" for="buye-' + esc(field.id) + '">',
      esc(field.title || ''),
      '</label>',
    ].join('');

    return [
      '<div class="buye-field">',
      label,
      '<textarea',
      '  id="buye-' + esc(field.id) + '"',
      '  name="' + esc(field.id) + '"',
      '  class="buye-input"',
      '  placeholder="' + esc(field.placeholder || '') + '"',
      '  rows="3"',
      '  data-field-id="' + esc(field.id) + '"',
      '  data-required="' + (field.required ? 'true' : 'false') + '"',
      '  ' + (field.required ? 'required' : '') + '',
      '  style="resize:vertical;min-height:80px;"',
      '></textarea>',
      '<div class="buye-error">' + esc(field.errorMessage || _formCfg.errorRequired || 'This field is required') + '</div>',
      '</div>',
    ].join('');
  }

  function renderSelectField(field) {
    var options = Array.isArray(field.options) ? field.options : [];
    var label = field.hideLabel ? '' : [
      '<label class="buye-label' + (field.required ? ' required' : '') + '" for="buye-' + esc(field.id) + '">',
      esc(field.title || ''),
      '</label>',
    ].join('');

    var optionHtml = (field.noneOptionLabel
      ? '<option value="">' + esc(field.noneOptionLabel) + '</option>'
      : '<option value="">-- Select --</option>') +
      options.map(function (o) {
        return '<option value="' + esc(o.value || o.label) + '">' + esc(o.label) + '</option>';
      }).join('');

    return [
      '<div class="buye-field">',
      label,
      '<div class="buye-input-wrap">',
      '<select id="buye-' + esc(field.id) + '" name="' + esc(field.id) + '" class="buye-input" data-field-id="' + esc(field.id) + '" data-required="' + (field.required ? 'true' : 'false') + '" ' + (field.required ? 'required' : '') + '>',
      optionHtml,
      '</select>',
      '<div class="buye-error">' + esc(field.errorMessage || _formCfg.errorRequired || 'This field is required') + '</div>',
      '</div>',
      '</div>',
    ].join('');
  }

  function renderCheckboxField(field) {
    return [
      '<div class="buye-field">',
      '<label class="buye-checkbox-wrap">',
      '<input type="checkbox" id="buye-' + esc(field.id) + '" name="' + esc(field.id) + '" data-field-id="' + esc(field.id) + '">',
      '<span style="font-size:14px;">' + esc(field.title || '') + '</span>',
      '</label>',
      '</div>',
    ].join('');
  }

  function renderSubmitField(field) {
    return [
      '<button type="submit" id="buyease-submit">',
      esc(field.title || field.placeholder || 'Place Order'),
      '</button>',
    ].join('');
  }

  // ─── Events ───────────────────────────────────────────────────────────────────
  function bindFormEvents(card) {
    // Close button
    var closeBtn = card.querySelector('#buyease-close');
    if (closeBtn) closeBtn.addEventListener('click', closeForm);

    // Click outside to close
    _overlay.addEventListener('click', function (e) {
      if (e.target === _overlay) closeForm();
    });

    // Escape key to close
    document.addEventListener('keydown', handleEscape);

    // Shipping rate selection
    var shippingRadios = card.querySelectorAll('input[name="buye-shipping"]');
    shippingRadios.forEach(function (radio) {
      radio.addEventListener('change', handleShippingChange);
    });

    // Initialise summary with first selected rate
    var firstSelected = card.querySelector('input[name="buye-shipping"]:checked');
    if (firstSelected) updateSummary(firstSelected);

    // Form submit
    var form = card.querySelector('#buyease-form');
    if (form) form.addEventListener('submit', handleSubmit);
  }

  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeForm();
      document.removeEventListener('keydown', handleEscape);
    }
  }

  function handleShippingChange(e) {
    var radio = e.target;
    // Update selected styles
    var allOptions = document.querySelectorAll('.buye-rate-option');
    allOptions.forEach(function (opt) { opt.classList.remove('selected'); });
    radio.closest('.buye-rate-option').classList.add('selected');
    updateSummary(radio);
  }

  function updateSummary(radio) {
    var shippingPrice = parseFloat(radio.dataset.price || '0');
    var currency = radio.dataset.currency || _ctx.currency;
    var subtotal = _ctx.priceInCents / 100;
    var total = subtotal + shippingPrice;

    var shippingRow = document.getElementById('buye-shipping-row');
    var shippingPriceEl = document.getElementById('buye-shipping-price');
    var totalEl = document.getElementById('buye-total-price');

    if (shippingRow) shippingRow.style.display = 'flex';
    if (shippingPriceEl) shippingPriceEl.textContent = fmtRatePrice(shippingPrice, currency);
    if (totalEl) {
      try {
        totalEl.textContent = new Intl.NumberFormat(undefined, { style: 'currency', currency: currency }).format(total);
      } catch (e) {
        totalEl.textContent = currency + ' ' + total.toFixed(2);
      }
    }
  }

  // ─── Validation ───────────────────────────────────────────────────────────────
  function validateForm() {
    var valid = true;
    var inputs = document.querySelectorAll('#buyease-form [data-required="true"]');
    inputs.forEach(function (input) {
      var val = input.value.trim();
      if (!val) {
        input.classList.add('invalid');
        valid = false;
      } else {
        input.classList.remove('invalid');
      }
    });
    if (!valid) {
      var firstInvalid = document.querySelector('#buyease-form .invalid');
      if (firstInvalid) firstInvalid.focus();
    }
    return valid;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    var submitBtn = document.getElementById('buyease-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Placing Order…';
    }

    var formData = collectFormData();

    fetch(_ctx.apiBase + '/api/storefront/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          showError(result.data.error || 'Could not place order. Please try again.');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = collectSubmitLabel(); }
          return;
        }
        showSuccess(result.data);
      })
      .catch(function () {
        showError('Network error. Please check your connection and try again.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = collectSubmitLabel(); }
      });
  }

  function collectSubmitLabel() {
    var fields = Array.isArray(_formCfg.fields) ? _formCfg.fields : [];
    var submitField = fields.find(function (f) { return f.type === 'submit'; });
    return (submitField && (submitField.title || submitField.placeholder)) || 'Place Order';
  }

  function collectFormData() {
    var form = document.getElementById('buyease-form');
    var data = {
      shop: _ctx.shop,
      variantId: _ctx.variantId,
      quantity: 1,
    };

    if (!form) return data;

    // Text / textarea / select fields
    var inputs = form.querySelectorAll('input[data-field-id], textarea[data-field-id], select[data-field-id]');
    inputs.forEach(function (input) {
      var id = input.dataset.fieldId;
      if (input.type === 'checkbox') {
        data[id] = input.checked;
      } else {
        data[id] = input.value.trim();
      }
    });

    // Shipping rate
    var selectedRate = form.querySelector('input[name="buye-shipping"]:checked');
    if (selectedRate) data.shippingRateId = selectedRate.value;

    // Map field IDs to API fields
    return {
      shop: _ctx.shop,
      variantId: _ctx.variantId,
      quantity: 1,
      shippingRateId: data.shippingRateId || undefined,
      customerName: data.firstName || data.customerName || data.name || '',
      customerPhone: data.phone || data.customerPhone || '',
      customerEmail: data.email || data.customerEmail || undefined,
      address1: data.address || data.address1 || '',
      address2: data.address2 || undefined,
      city: data.city || '',
      province: data.province || data.state || undefined,
      postalCode: data.postalCode || data.zip || data.postal || undefined,
      country: data.country || 'AE',
      note: data.note || data.message || undefined,
      marketingConsent: !!(data.marketingConsent || data.marketing),
    };
  }

  // ─── Success / Error screens ─────────────────────────────────────────────────
  function showSuccess(order) {
    var card = document.getElementById('buyease-form-card');
    if (!card) return;

    card.innerHTML = [
      '<button type="button" id="buyease-close" aria-label="Close">&#215;</button>',
      '<div id="buyease-success">',
      '  <div class="buye-icon-big">✅</div>',
      '  <h2>Order Confirmed!</h2>',
      '  <p>Your order <strong>' + esc(order.orderName || order.orderId || '') + '</strong> has been placed successfully.<br>We\'ll contact you to confirm delivery.</p>',
      '  <button type="button" id="buyease-done-btn" style="padding:10px 28px;background:' + esc(_formCfg.formBorderColor) + ';color:#fff;border:none;border-radius:6px;font-size:15px;cursor:pointer;">Done</button>',
      '</div>',
    ].join('');

    var closeBtn = card.querySelector('#buyease-close');
    if (closeBtn) closeBtn.addEventListener('click', closeForm);

    var doneBtn = card.querySelector('#buyease-done-btn');
    if (doneBtn) doneBtn.addEventListener('click', closeForm);
  }

  function showError(message) {
    var existing = document.getElementById('buyease-form-error');
    if (existing) existing.remove();

    var errorDiv = document.createElement('div');
    errorDiv.id = 'buyease-form-error';
    errorDiv.style.cssText = 'background:#fff5f5;color:#c53030;border:1px solid #fed7d7;border-radius:6px;padding:10px 14px;margin-bottom:12px;font-size:14px;';
    errorDiv.textContent = message;

    var form = document.getElementById('buyease-form');
    if (form) form.insertBefore(errorDiv, form.firstChild);
  }

  // ─── Icon helpers ─────────────────────────────────────────────────────────────
  var ICON_PATHS = {
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.29 6.29l1.91-1.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
    'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    building: '<rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  };

  function getIconPath(iconId) {
    return ICON_PATHS[iconId] || ICON_PATHS['user'];
  }

  function getAutocomplete(fieldId) {
    var map = {
      firstName: 'given-name',
      lastName: 'family-name',
      email: 'email',
      customerEmail: 'email',
      phone: 'tel',
      customerPhone: 'tel',
      address: 'address-line1',
      address1: 'address-line1',
      address2: 'address-line2',
      city: 'address-level2',
      province: 'address-level1',
      state: 'address-level1',
      postalCode: 'postal-code',
      zip: 'postal-code',
      country: 'country',
    };
    return map[fieldId] || 'on';
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
