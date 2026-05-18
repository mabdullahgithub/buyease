/* BuyEase COD Form — Storefront Widget v1.0
 * Plain JS, no external dependencies.
 * Injected via Shopify Theme App Extension.
 */
(function () {
  'use strict';

  var ROOT_ID = 'buyease-cod-root';
  var OVERLAY_ID = 'buyease-overlay';
  var STYLE_ID = 'buyease-styles';
  var EMBEDDED_CARD_ID = 'buyease-embedded-card';

  var _ctx = {};
  var _btnCfg = null;
  var _formCfg = null;
  var _rates = [];
  var _overlay = null;
  var _submitLabelTemplate = 'Place Order';
  var _cartItems = [];
  var _isCartMode = false;
  var _placesReady = false;
  var _placesBalanceDepleted = false;
  var _googleData = { formattedAddress: null, mapsUrl: null, latitude: null, longitude: null, placeId: null };

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
    widthPercent: 100,
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
  // Mirrors /apps/merchant/src/components/form-builder/buy-button-icon-registry.ts
  // Uses Polaris 20x20 path data (currentColor fill) so admin live preview and
  // the storefront button render identical icons. Keep IDs in sync with that file.
  var ICON_PATHS_BTN = {
    'delivery': '<path fill-rule="evenodd" d="M4 5.25a.75.75 0 0 1 .75-.75h6.991a2.75 2.75 0 0 1 2.645 1.995l.427 1.494a.25.25 0 0 0 .18.173l1.681.421a1.75 1.75 0 0 1 1.326 1.698v1.219a1.75 1.75 0 0 1-1.032 1.597 2.5 2.5 0 1 1-4.955.153h-3.025a2.5 2.5 0 1 1-4.78-.75h-.458a.75.75 0 0 1 0-1.5h2.5c.03 0 .06.002.088.005a2.493 2.493 0 0 1 1.947.745h4.43a2.493 2.493 0 0 1 1.785-.75c.698 0 1.33.286 1.783.748a.25.25 0 0 0 .217-.248v-1.22a.25.25 0 0 0-.19-.242l-1.682-.42a1.75 1.75 0 0 1-1.258-1.217l-.427-1.494a1.25 1.25 0 0 0-1.202-.907h-6.991a.75.75 0 0 1-.75-.75Zm2.5 9.25a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/><path d="M3.25 8a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5Z"/>',
    'cart-outline': '<path fill-rule="evenodd" d="M2.5 3.75a.75.75 0 0 1 .75-.75h1.612a1.75 1.75 0 0 1 1.732 1.5h9.656a.75.75 0 0 1 .748.808l-.358 4.653a2.75 2.75 0 0 1-2.742 2.539h-6.351l.093.78a.25.25 0 0 0 .248.22h6.362a.75.75 0 0 1 0 1.5h-6.362a1.75 1.75 0 0 1-1.738-1.543l-1.04-8.737a.25.25 0 0 0-.248-.22h-1.612a.75.75 0 0 1-.75-.75Zm4.868 7.25h6.53a1.25 1.25 0 0 0 1.246-1.154l.296-3.846h-8.667l.595 5Z"/><path d="M10 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/><path d="M15 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>',
    'cart-filled': '<path d="M3.25 3a.75.75 0 0 0 0 1.5h1.612a.25.25 0 0 1 .248.22l1.04 8.737a1.75 1.75 0 0 0 1.738 1.543h6.362a.75.75 0 0 0 0-1.5h-6.362a.25.25 0 0 1-.248-.22l-.093-.78h6.35a2.75 2.75 0 0 0 2.743-2.54l.358-4.652a.75.75 0 0 0-.748-.808h-9.656a1.75 1.75 0 0 0-1.732-1.5h-1.612Z"/><path d="M9 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/><path d="M15 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>',
    'cart-sale': '<path fill-rule="evenodd" d="M4.25 3a.75.75 0 0 0 0 1.5h1.612a.25.25 0 0 1 .248.22l1.04 8.737a1.75 1.75 0 0 0 1.738 1.543h5.362a.75.75 0 0 0 0-1.5h-5.362a.25.25 0 0 1-.248-.22l-.093-.78h5.35a2.75 2.75 0 0 0 2.743-2.54l.358-4.652a.75.75 0 0 0-.748-.808h-8.656a1.75 1.75 0 0 0-1.732-1.5h-1.612Zm9.648 8h-5.53l-.595-5h7.667l-.296 3.846a1.25 1.25 0 0 1-1.246 1.154Z"/><path d="M2.75 6.5a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Z"/><path d="M2.75 9.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Z"/><path d="M2 13.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"/><path d="M10 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/><path d="M15 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>',
    'store': '<path fill-rule="evenodd" d="M13.257 3h-6.514a1.25 1.25 0 0 0-.983.478l-2.386 3.037a1.75 1.75 0 0 0-.374 1.08v.655a2.75 2.75 0 0 0 1.5 2.45v4.55c0 .966.784 1.75 1.75 1.75h7.5a1.75 1.75 0 0 0 1.75-1.75v-4.55a2.75 2.75 0 0 0 1.5-2.45v-.481c0-.504-.17-.994-.48-1.39l-2.28-2.901a1.25 1.25 0 0 0-.983-.478Zm-.257 12.5h.75a.25.25 0 0 0 .25-.25v-4.25a2.742 2.742 0 0 1-2-.863 2.742 2.742 0 0 1-2 .863 2.742 2.742 0 0 1-2-.863 2.742 2.742 0 0 1-2 .863v4.25c0 .138.112.25.25.25h3.75v-2.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2.5Zm-7-6h-.25c-.69 0-1.25-.56-1.25-1.25v-.654a.25.25 0 0 1 .053-.155l2.312-2.941h6.27l2.205 2.805a.75.75 0 0 1 .16.464v.481c0 .69-.56 1.25-1.25 1.25h-.25c-.69 0-1.25-.56-1.25-1.25v-.5a.75.75 0 0 0-1.5 0v.5a1.25 1.25 0 1 1-2.5 0v-.5a.75.75 0 0 0-1.5 0v.5c0 .69-.56 1.25-1.25 1.25Z"/>',
    'store-filled': '<path d="M12.278 3a2.75 2.75 0 0 1 2.162 1.051l2.16 2.75.01.013c.736 1.03.238 2.396-.831 2.811h-1.17c-.475 0-.915-.244-1.166-.646l-.663-1.06a.624.624 0 0 0-1.137.184l-.075.298a1.616 1.616 0 0 1-3.136 0l-.075-.298a.628.628 0 0 0-.637-.477.624.624 0 0 0-.5.293l-.662 1.06a1.375 1.375 0 0 1-1.166.646h-1.17c-1.07-.415-1.568-1.781-.832-2.81l.01-.015 2.16-2.749a2.75 2.75 0 0 1 2.162-1.051h4.556Z"/><path fill-rule="evenodd" d="M4.5 10.875v4.375c0 .966.784 1.75 1.75 1.75h7.5a1.75 1.75 0 0 0 1.75-1.75v-4.375h-.892a2.625 2.625 0 0 1-2.226-1.234l-.012-.02a2.866 2.866 0 0 1-4.74 0l-.012.02a2.625 2.625 0 0 1-2.226 1.234h-.892Zm8.5 2.475a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v2.4c0 .138.112.25.25.25h2.5a.25.25 0 0 0 .25-.25v-2.4Z"/>',
    'order-confirmed': '<path d="M13.28 4.78a.75.75 0 0 0-1.06-1.06l-2.97 2.97-1.22-1.22a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l3.5-3.5Z"/><path fill-rule="evenodd" d="M4.86 6.883a.75.75 0 0 1 .632.852l-.336 2.265h2.484a1.25 1.25 0 0 1 1.185.855l.159.474a.25.25 0 0 0 .237.171h1.558a.25.25 0 0 0 .237-.17l.159-.475a1.25 1.25 0 0 1 1.185-.855h2.484l-.336-2.265a.75.75 0 1 1 1.484-.22l.413 2.792c.063.425.095.853.095 1.282v1.661a3.25 3.25 0 0 1-3.25 3.25h-6.5a3.25 3.25 0 0 1-3.25-3.25v-1.66c0-.43.032-.858.094-1.283l.414-2.792a.75.75 0 0 1 .852-.632Zm.14 4.706v-.089h2.46l.1.303a1.75 1.75 0 0 0 1.66 1.197h1.56a1.75 1.75 0 0 0 1.66-1.197l.1-.303h2.46v1.75a1.75 1.75 0 0 1-1.75 1.75h-6.5a1.75 1.75 0 0 1-1.75-1.75v-1.66Z"/>',
    'receipt': '<path d="M7.75 5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 1 0 0-1.5h-4.5Z"/><path d="M7 8.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z"/><path d="M7.75 11a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Z"/><path d="M11 8.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z"/><path d="M11.75 11a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Z"/><path fill-rule="evenodd" d="M4 16a1.5 1.5 0 0 0 2.615 1.003l1.135-1.26 1.135 1.26a1.5 1.5 0 0 0 2.23 0l1.135-1.26 1.135 1.26a1.5 1.5 0 0 0 2.615-1.003v-11a2.5 2.5 0 0 0-2.5-2.5h-7a2.5 2.5 0 0 0-2.5 2.5v11Zm2.5-12a1 1 0 0 0-1 1v11l1.507-1.674a1 1 0 0 1 1.486 0l1.507 1.674 1.507-1.674a1 1 0 0 1 1.486 0l1.507 1.674v-11a1 1 0 0 0-1-1h-7Z"/>',
    'receipt-paid': '<path fill-rule="evenodd" d="M5.142 16.934a1 1 0 0 1-.642-.934v-11a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v11a1 1 0 0 1-1.743.669l-1.502-1.669h-.01l-1.502 1.669a1 1 0 0 1-1.486 0l-1.502-1.669h-.01l-1.502 1.669a1 1 0 0 1-1.101.265Zm4.358-11.684a.75.75 0 0 1 1.5 0v.5h.75a.75.75 0 0 1 0 1.5h-2.375a.625.625 0 1 0 0 1.25h1.25a2.125 2.125 0 0 1 0 4.25h-.125v.5a.75.75 0 0 1-1.5 0v-.5h-.75a.75.75 0 0 1 0-1.5h2.375a.625.625 0 1 0 0-1.25h-1.25a2.125 2.125 0 0 1 0-4.25h.125v-.5Z"/>',
    'cash': '<path fill-rule="evenodd" d="M12.379 4h-7.258c-.395 0-.736 0-1.017.023-.297.024-.592.078-.875.222-.424.216-.768.56-.984.984-.144.283-.198.578-.222.875-.023.28-.023.622-.023 1.017v3.008c0 .395 0 .736.023 1.017.024.297.078.592.222.875.216.424.56.768.984.984.283.144.578.198.875.222.121.01.254.016.397.019.001.243.006.46.022.65.024.297.078.592.222.875.216.424.56.768.984.984.283.144.578.198.875.222.28.023.622.023 1.017.023h7.258c.395 0 .736 0 1.017-.023.297-.024.592-.078.875-.222.424-.216.768-.56.984-.984.144-.283.198-.578.222-.875.023-.28.023-.622.023-1.017v-3.008c0-.395 0-.736-.023-1.017-.024-.297-.078-.592-.222-.875-.216-.424-.56-.768-.983-.984-.284-.144-.58-.198-.876-.222-.121-.01-.254-.016-.397-.019-.001-.243-.006-.46-.022-.65-.024-.297-.078-.592-.222-.875-.216-.424-.56-.768-.984-.984-.283-.144-.578-.198-.875-.222-.28-.023-.622-.023-1.017-.023Zm1.62 2.75h-6.378c-.395 0-.736 0-1.017.023-.297.024-.592.078-.875.222-.424.216-.768.56-.984.984-.144.283-.198.578-.222.875-.023.28-.023.622-.023 1.017v1.874c-.104-.002-.194-.006-.274-.013-.204-.017-.28-.045-.316-.064-.142-.072-.256-.186-.328-.327-.02-.038-.047-.113-.064-.317-.017-.212-.018-.492-.018-.924v-2.95c0-.432 0-.712.018-.924.017-.204.045-.28.064-.316.072-.142.186-.256.328-.328.037-.02.112-.047.316-.064.212-.017.492-.018.924-.018h7.2c.432 0 .712 0 .924.018.204.017.28.045.317.064.14.072.255.186.327.328.02.037.047.112.064.316.011.138.016.305.017.524Zm-6.349 7.75h1.178c-.515-.796-.828-1.848-.828-3 0-1.278.385-2.43 1.002-3.25h-1.352c-.432 0-.712 0-.924.018-.204.017-.28.045-.316.064-.142.072-.256.186-.328.328-.02.037-.047.112-.064.316-.017.212-.018.492-.018.924v2.95c0 .432 0 .712.018.924.017.204.045.28.064.317.072.14.186.255.328.327.037.02.112.047.316.064.212.017.492.018.924.018Zm6.85-3c0-1.278-.384-2.43-1.002-3.25h1.352c.432 0 .712 0 .924.018.204.017.28.045.316.064.142.072.256.186.328.328.02.037.047.112.064.316.017.212.018.492.018.924v2.95c0 .432 0 .712-.018.924-.017.204-.045.28-.064.317-.072.14-.186.255-.328.327-.037.02-.112.047-.316.064-.212.017-.492.018-.924.018h-1.178c.515-.796.828-1.848.828-3Zm-4.332 2.304c-.384-.532-.668-1.342-.668-2.304 0-.962.284-1.772.668-2.304.385-.533.787-.696 1.082-.696.295 0 .697.163 1.082.696.384.532.668 1.342.668 2.304 0 .962-.284 1.772-.668 2.304-.385.533-.787.696-1.082.696-.295 0-.697-.163-1.082-.696Z"/>',
    'cash-filled': '<path fill-rule="evenodd" d="M12.379 4h-7.258c-.395 0-.736 0-1.017.023-.297.024-.592.078-.875.222-.424.216-.768.56-.984.984-.144.283-.198.578-.222.875-.023.28-.023.622-.023 1.017v3.008c0 .395 0 .736.023 1.017.024.297.078.592.222.875.216.424.56.768.984.984.283.144.578.198.875.222.121.01.254.016.397.019.001.243.006.46.022.65.024.297.078.592.222.875.216.424.56.768.984.984.283.144.578.198.875.222.28.023.622.023 1.017.023h7.258c.395 0 .736 0 1.017-.023.297-.024.592-.078.875-.222.424-.216.768-.56.984-.984.144-.283.198-.578.222-.875.023-.28.023-.622.023-1.017v-3.008c0-.395 0-.736-.023-1.017-.024-.297-.078-.592-.222-.875-.216-.424-.56-.768-.983-.984-.284-.144-.58-.198-.876-.222-.121-.01-.254-.016-.397-.019-.001-.243-.006-.46-.022-.65-.024-.297-.078-.592-.222-.875-.216-.424-.56-.768-.984-.984-.283-.144-.578-.198-.875-.222-.28-.023-.622-.023-1.017-.023Zm-8.153 7.732c.08.007.17.01.274.013v-1.874c0-.395 0-.736.023-1.017.024-.297.078-.592.222-.875.216-.424.56-.768.984-.984.283-.144.578-.198.875-.222.28-.023.622-.023 1.017-.023h6.378c-.001-.219-.006-.386-.017-.524-.017-.204-.045-.28-.064-.316-.072-.142-.186-.256-.327-.328-.038-.02-.113-.047-.317-.064-.212-.017-.492-.018-.924-.018h-7.2c-.432 0-.712 0-.924.018-.204.017-.28.045-.316.064-.142.072-.256.186-.328.328-.02.037-.047.112-.064.316-.017.212-.018.492-.018.924v2.95c0 .432 0 .712.018.924.017.204.045.28.064.317.072.14.186.255.328.327.037.02.112.047.316.064Zm5.904 2.03c-.37-.537-.63-1.334-.63-2.262 0-.928.26-1.725.63-2.262.372-.541.785-.738 1.12-.738.335 0 .748.197 1.12.738.37.537.63 1.334.63 2.262 0 .928-.26 1.725-.63 2.262-.372.541-.785.738-1.12.738-.335 0-.748-.197-1.12-.738Z"/>',
    'wallet': '<path fill-rule="evenodd" d="M3.5 5.75v8.5a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25v-1c.304-.228.5-.591.5-1v-2c0-.409-.196-.772-.5-1v-.75a2.25 2.25 0 0 0-2.25-2.25h-.75v-.5a2.25 2.25 0 0 0-2.25-2.25h-5.5a2.25 2.25 0 0 0-2.25 2.25Zm2.25-.75a.75.75 0 0 0-.75.75v.5h7v-.5a.75.75 0 0 0-.75-.75h-5.5Zm9.75 5.5h-3.75v1.5h3.75v-1.5Zm-.5-1.5v-.5a.75.75 0 0 0-.75-.75h-9.25v6.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-.75h-3.5c-.69 0-1.25-.56-1.25-1.25v-2c0-.69.56-1.25 1.25-1.25h3.5Z"/>',
    'wallet-filled': '<path fill-rule="evenodd" d="M3.5 5.75v8.5a2.25 2.25 0 0 0 2.25 2.25h8.25a2.25 2.25 0 0 0 2.25-2.25v-.854a1.25 1.25 0 0 0 .75-1.146v-2a1.25 1.25 0 0 0-.75-1.146v-.604a2.25 2.25 0 0 0-2.25-2.25h-.5v-.5a2.25 2.25 0 0 0-2.25-2.25h-5.5a2.25 2.25 0 0 0-2.25 2.25Zm2.25-.75a.75.75 0 0 0-.75.75v.5h7v-.5a.75.75 0 0 0-.75-.75h-5.5Zm9.75 5.5h-3.75v1.5h3.75v-1.5Z"/>',
    'package': '<path fill-rule="evenodd" d="M7 9a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-4Zm.5 3.5v-2h3v2h-3Z"/><path fill-rule="evenodd" d="M5.315 4.45a2.25 2.25 0 0 1 1.836-.95h5.796a2.25 2.25 0 0 1 1.872 1.002l1.22 1.828c.3.452.461.983.461 1.526v6.894a1.75 1.75 0 0 1-1.75 1.75h-9.5a1.75 1.75 0 0 1-1.75-1.75v-6.863c0-.57.177-1.125.506-1.59l1.309-1.848Zm1.836.55a.75.75 0 0 0-.612.316l-.839 1.184h3.55v-1.5h-2.1Zm3.599 1.5h3.599l-.778-1.166a.75.75 0 0 0-.624-.334h-2.197v1.5Zm4.25 1.5h-10v6.75c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25v-6.75Z"/>',
    'package-filled': '<path fill-rule="evenodd" d="M16 15.975c.31-.316.5-.748.5-1.225v-6.894a2.75 2.75 0 0 0-.462-1.526l-1.219-1.828a2.25 2.25 0 0 0-1.872-1.002h-5.796a2.25 2.25 0 0 0-1.836.95l-1.31 1.847a2.75 2.75 0 0 0-.505 1.59v6.863c0 .477.19.91.5 1.225v.025h.025c.316.31.748.5 1.225.5h9.5c.477 0 .91-.19 1.225-.5h.025v-.025Zm-9.461-10.659a.75.75 0 0 1 .612-.316h2.099v1.5h-3.55l.839-1.184Zm4.211 1.184h3.599l-.778-1.166a.75.75 0 0 0-.624-.334h-2.197v1.5Zm-4 3.75a.5.5 0 0 1 .5-.5h3.5a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-.5.5h-3.5a.5.5 0 0 1-.5-.5v-2.5Z"/>',
    'card': '<path d="M6.25 11.25a.75.75 0 0 0 0 1.5h2.75a.75.75 0 0 0 0-1.5h-2.75Z"/><path fill-rule="evenodd" d="M2.5 7.25a2.75 2.75 0 0 1 2.75-2.75h9.5a2.75 2.75 0 0 1 2.75 2.75v5.5a2.75 2.75 0 0 1-2.75 2.75h-9.5a2.75 2.75 0 0 1-2.75-2.75v-5.5Zm12.25-1.25c.69 0 1.25.56 1.25 1.25h-12c0-.69.56-1.25 1.25-1.25h9.5Zm1.25 3.25h-12v3.5c0 .69.56 1.25 1.25 1.25h9.5c.69 0 1.25-.56 1.25-1.25v-3.5Z"/>',
    'pay': '<path d="M6.75 10.227v-2.227c-.778 0-1.044.005-1.283.062a2.25 2.25 0 0 0-.65.27c-.21.128-.398.31-.943.854l-.594.594a.75.75 0 0 1-1.06-1.06l.654-.655c.46-.46.78-.78 1.16-1.012a3.75 3.75 0 0 1 1.083-.45c.433-.103.888-.103 1.546-.103h.087v1.48h11v1.62c0 .84 0 1.26-.163 1.581a1.5 1.5 0 0 1-.656.655c-.32.164-.74.164-1.581.164h-2.705a1.92 1.92 0 0 1-.61.73l-2.73 1.965c-.566.407-.93.67-1.336.859-.358.167-.736.29-1.125.363-.44.083-.889.083-1.586.083h-1.508a.75.75 0 0 1 0-1.5h1.436c.794 0 1.095-.003 1.379-.057.266-.05.524-.134.77-.248.261-.122.508-.296 1.152-.76l2.67-1.923a.423.423 0 0 0-.35-.753l-4.875 1.219a.75.75 0 0 1-.364-1.456l1.182-.295Z"/><path d="M17.587 5.069c.152.298.162.683.163 1.411h-11c0-.728.011-1.113.163-1.411a1.5 1.5 0 0 1 .656-.656c.32-.163.74-.163 1.581-.163h6.2c.84 0 1.26 0 1.581.163a1.5 1.5 0 0 1 .655.656Z"/>',
    'phone': '<path d="M7.75 13.75a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z"/><path fill-rule="evenodd" d="M4.75 5.75a2.75 2.75 0 0 1 2.75-2.75h5a2.75 2.75 0 0 1 2.75 2.75v8.5a2.75 2.75 0 0 1-2.75 2.75h-5a2.75 2.75 0 0 1-2.75-2.75v-8.5Zm2.75-1.25c-.69 0-1.25.56-1.25 1.25v8.5c0 .69.56 1.25 1.25 1.25h5c.69 0 1.25-.56 1.25-1.25v-8.5c0-.69-.56-1.25-1.25-1.25h-.531a1 1 0 0 1-.969.75h-2a1 1 0 0 1-.969-.75h-.531Z"/>',
    'arrow': '<path fill-rule="evenodd" d="M3.5 10a.75.75 0 0 1 .75-.75h9.69l-2.72-2.72a.75.75 0 1 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06-1.06l2.72-2.72h-9.69a.75.75 0 0 1-.75-.75Z"/>',
    'arrow-up-right': '<path fill-rule="evenodd" d="M5.228 14.772c-.304-.304-.304-.797 0-1.101l7.113-7.114h-3.993c-.43 0-.779-.348-.779-.778 0-.43.349-.779.779-.779h5.873c.207 0 .405.082.55.228.147.146.229.344.229.55v5.874c0 .43-.349.779-.779.779-.43 0-.779-.35-.779-.78v-3.992l-7.113 7.113c-.304.304-.797.304-1.1 0Z"/>',
  };

  function renderButtonIcon(iconId, sizePx) {
    var paths = ICON_PATHS_BTN[iconId];
    if (!paths) return '';
    var size = sizePx || 20;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
      '" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' + paths + '</svg>'
    );
  }

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

  /* Build a shipping-rates request URL with the current cart context so the
     server can apply country, region, and condition filters that mirror what
     Shopify would accept. country comes from the shop's localization (the
     embed reads it once at page render); province is read from the form when
     available so user-typed regions also filter live. */
  function buildShippingRatesURL() {
    var subtotalMajor = _isCartMode
      ? _ctx.priceInCents / 100
      : (_ctx.priceInCents * (_ctx.quantity || 1)) / 100;

    var province = '';
    var form = document.getElementById('buyease-form');
    if (form) {
      var pInput = form.querySelector('[data-field-id="province"], [data-field-id="state"]');
      if (pInput && typeof pInput.value === 'string') province = pInput.value.trim().toUpperCase();
    }

    var qs = [
      'shop=' + encodeURIComponent(_ctx.shop),
      'country=' + encodeURIComponent(_ctx.country || ''),
      'subtotal=' + encodeURIComponent(subtotalMajor.toFixed(2)),
      'quantity=' + encodeURIComponent(_ctx.quantity || 1),
    ];
    if (province) qs.push('province=' + encodeURIComponent(province));
    return _ctx.apiBase + '/api/storefront/shipping-rates?' + qs.join('&');
  }

  /* Re-pull eligible rates whenever cart state changes (qty change, province
     edit). Runs in the background — UI shows the previously selected option
     until the response arrives, then re-renders the shipping section in place
     so the user sees an authoritative list. */
  var _ratesAbort = null;
  function refreshShippingRates() {
    if (!_ctx.apiBase || !_ctx.shop) return;
    if (_ratesAbort && typeof _ratesAbort.abort === 'function') _ratesAbort.abort();
    _ratesAbort = (typeof AbortController !== 'undefined') ? new AbortController() : null;

    var opts = _ratesAbort ? { signal: _ratesAbort.signal } : undefined;
    fetch(buildShippingRatesURL(), opts)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) {
        if (!json || !Array.isArray(json.rates)) return;
        _rates = json.rates;
        rerenderShippingSection();
      })
      .catch(function () { /* aborted or network */ });
  }

  function rerenderShippingSection() {
    var form = document.getElementById('buyease-form');
    if (!form) return;
    var fields = Array.isArray(_formCfg.fields) ? _formCfg.fields : [];
    var shippingField = fields.filter(function (f) { return f.type === 'shipping' && !f.hidden; })[0];
    if (!shippingField) return;
    var existing = form.querySelector('.buye-shipping-block');
    if (!existing) return;
    var divider = existing.nextElementSibling;
    var fragment = document.createElement('div');
    fragment.innerHTML = renderShippingField(shippingField);
    var newBlock = fragment.querySelector('.buye-shipping-block');
    if (!newBlock) return;
    existing.replaceWith(newBlock);
    if (divider && divider.classList && divider.classList.contains('buye-section-divider')) {
      // divider already follows; leave it
    }
    bindShippingHandlers(form);
    refreshCartTotals();
  }


  // ─── Styles ──────────────────────────────────────────────────────────────────
  function injectStyles(btnCfg, formCfg) {
    if (document.getElementById(STYLE_ID)) return;

    /* Mirrors the admin SVG preview formula in BuyButtonDesignerWorkspace.tsx
       (blur = min(14, shadowStrength / 2), dy = min(6, blur / 2)) so the
       storefront shadow visually matches what the merchant configured. */
    var shadowBlur = Math.min(14, Math.max(0, btnCfg.shadowStrength / 2));
    var shadowDy = Math.min(6, shadowBlur / 2);
    var shadow = btnCfg.shadowStrength > 0
      ? '0 ' + shadowDy + 'px ' + shadowBlur + 'px rgba(0,0,0,0.22)'
      : 'none';

    var widthPercent = Math.max(40, Math.min(100, Number(btnCfg.widthPercent) || 100));

    var btnAnimation = '';
    if (btnCfg.animation && btnCfg.animation !== 'none') {
      btnAnimation = buildAnimationCSS(btnCfg.animation);
    }

    var css = [
      '/* BuyEase Widget */',

      /* Note: Shopify's dynamic checkout block is hidden by an inline <style>
         in the Liquid block, so it never flashes on page load. */

      /* Tokens mirror apps/merchant/src/components/form-builder/BuyButtonDesignerWorkspace.tsx:
         padX = round(fontSize * 0.75), padY = round(fontSize * 0.55), min-height 52,
         gap 8px, weight 600 (700 bold), subtitle = max(11, fontSize * 0.78). The
         button is width:100% so it inherits the same width as the Add-to-Cart sibling. */
      '#buyease-btn {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 8px;',
      '  width: ' + widthPercent + '%;',
      '  margin-left: auto;',
      '  margin-right: auto;',
      '  cursor: pointer;',
      '  border: ' + btnCfg.borderWidthPx + 'px solid ' + esc(btnCfg.borderColor) + ';',
      '  border-radius: ' + btnCfg.borderRadiusPx + 'px;',
      '  background: ' + esc(btnCfg.bgColor) + ';',
      '  color: ' + esc(btnCfg.textColor) + ';',
      '  font-size: ' + btnCfg.fontSizePx + 'px;',
      '  font-family: inherit;',
      '  line-height: 1.15;',
      '  font-weight: ' + (btnCfg.isBold ? '700' : '600') + ';',
      '  font-style: ' + (btnCfg.isItalic ? 'italic' : 'normal') + ';',
      '  letter-spacing: 0.01em;',
      '  padding: ' + Math.round(btnCfg.fontSizePx * 0.55) + 'px ' + Math.round(btnCfg.fontSizePx * 0.75) + 'px;',
      '  min-height: 52px;',
      '  box-shadow: ' + shadow + ';',
      '  transition: opacity 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;',
      '  box-sizing: border-box;',
      '  margin-top: 10px;',
      '  -webkit-appearance: none;',
      '  appearance: none;',
      '  text-decoration: none;',
      '  vertical-align: middle;',
      '  transform-origin: center;',
      '  text-align: center;',
      '}',
      '#buyease-btn:hover { opacity: 0.92; }',
      '#buyease-btn:active:not(.buyease-animating) { transform: translateY(1px); opacity: 0.85; }',
      '#buyease-btn:focus-visible { outline: 2px solid ' + esc(btnCfg.borderColor || btnCfg.bgColor) + '; outline-offset: 2px; }',
      '#buyease-btn svg { flex-shrink: 0; display: block; }',
      '.buye-btn-icon { display: inline-flex; align-items: center; line-height: 0; }',
      '.buyease-btn-text { display: inline-flex; flex-direction: column; align-items: center; line-height: 1.15; }',
      /* Subtitle font-size = max(11, fontSize * 0.78); weight 500 (600 bold), opacity 0.92 */
      '.buyease-btn-sub { font-size: ' + Math.max(11, Math.round(btnCfg.fontSizePx * 0.78)) + 'px; opacity: 0.92; margin-top: 4px; font-weight: ' + (btnCfg.isBold ? '600' : '500') + '; font-style: ' + (btnCfg.isItalic ? 'italic' : 'normal') + '; letter-spacing: 0; line-height: 1.1; }',
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

      /* Form card — matches admin live preview tokens 1:1.
         Background, border, radius, shadow, padding all driven by merchant config. */
      '#buyease-form-card {',
      '  background: ' + esc(formCfg.formBgColor) + ';',
      '  color: ' + esc(formCfg.formTextColor) + ';',
      '  border: ' + formCfg.formBorderWidthPx + 'px solid ' + esc(formCfg.formBorderColor) + ';',
      '  border-radius: ' + formCfg.formBorderRadiusPx + 'px ' + formCfg.formBorderRadiusPx + 'px 0 0;',
      '  box-shadow: 0 -8px ' + Math.max(formCfg.formShadowPx * 3, 16) + 'px rgba(0,0,0,0.18);',
      '  padding: ' + formCfg.formPaddingPx + 'px;',
      '  width: 100%;',
      '  max-height: 92vh;',
      '  overflow-y: auto;',
      '  box-sizing: border-box;',
      '  font-family: inherit;',
      '  font-weight: ' + (formCfg.formTextBold ? '600' : '400') + ';',
      '  font-style: ' + (formCfg.formTextItalic ? 'italic' : 'normal') + ';',
      '  direction: ' + (formCfg.rtl ? 'rtl' : 'ltr') + ';',
      '  position: relative;',
      '  animation: buye-slidein 0.24s cubic-bezier(0.2, 0.8, 0.2, 1);',
      '  scrollbar-width: thin;',
      '}',
      '#buyease-form-card::-webkit-scrollbar { width: 6px; }',
      '#buyease-form-card::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 3px; }',
      '@media (min-width: 640px) {',
      '  #buyease-form-card {',
      '    border-radius: ' + formCfg.formBorderRadiusPx + 'px;',
      '    max-width: 460px;',
      '    max-height: 88vh;',
      '    box-shadow: 0 24px 48px rgba(0,0,0,0.22);',
      '  }',
      '}',

      /* Close button */
      '#buyease-close {',
      '  position: absolute;',
      '  top: 14px;',
      '  ' + (formCfg.rtl ? 'left' : 'right') + ': 14px;',
      '  width: 28px;',
      '  height: 28px;',
      '  background: rgba(0,0,0,0.05);',
      '  border: none;',
      '  border-radius: 50%;',
      '  cursor: pointer;',
      '  color: ' + esc(formCfg.formTextColor) + ';',
      '  opacity: 0.7;',
      '  padding: 0;',
      '  line-height: 1;',
      '  font-size: 18px;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  transition: opacity 0.15s, background 0.15s;',
      '  z-index: 2;',
      '}',
      '#buyease-close:hover { opacity: 1; background: rgba(0,0,0,0.1); }',

      /* Header field */
      '.buye-form-header {',
      '  margin: 0 0 14px;',
      '  padding-right: 36px;',
      '  font-size: ' + Math.max(formCfg.fieldFontSizePx, 16) + 'px;',
      '  font-weight: ' + (formCfg.formTextBold ? '800' : '700') + ';',
      '  font-style: ' + (formCfg.formTextItalic ? 'italic' : 'normal') + ';',
      '  line-height: 1.35;',
      '  color: ' + esc(formCfg.formTextColor) + ';',
      '  text-align: ' + esc(formCfg.textAlign) + ';',
      '}',

      /* Section divider — used between cart, summary, shipping blocks */
      '.buye-section-divider { height: 1px; background: ' + esc(formCfg.formBorderColor) + '; opacity: 0.35; margin: 12px 0 14px; }',

      /* ─── Cart card ───────────────────────────────────────────────────────── */
      '.buye-cart-card { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }',
      '.buye-cart-thumb { width: 52px; height: 52px; border-radius: 8px; flex-shrink: 0; background: rgba(0,0,0,0.07); display: flex; align-items: center; justify-content: center; overflow: hidden; color: ' + esc(formCfg.formTextColor) + '; }',
      '.buye-cart-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }',
      '.buye-cart-meta { flex: 1; min-width: 0; }',
      '.buye-cart-title { margin: 0; font-size: 13px; font-weight: 600; color: ' + esc(formCfg.formTextColor) + '; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }',
      '.buye-cart-variant { margin: 2px 0 0; font-size: 11px; color: ' + esc(formCfg.formTextColor) + '; opacity: 0.55; }',
      '.buye-cart-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }',
      '.buye-cart-price { font-size: 13px; font-weight: 700; color: ' + esc(formCfg.formTextColor) + '; white-space: nowrap; }',
      '.buye-qty { display: inline-flex; align-items: center; border: 1px solid ' + esc(formCfg.formBorderColor) + '; border-radius: 6px; overflow: hidden; user-select: none; }',
      '.buye-qty button { background: transparent; border: 0; padding: 2px 8px; font-size: 13px; color: ' + esc(formCfg.formTextColor) + '; cursor: pointer; line-height: 1; transition: background 0.15s; font-family: inherit; }',
      '.buye-qty button:hover:not(:disabled) { background: rgba(0,0,0,0.06); }',
      '.buye-qty button:disabled { opacity: 0.35; cursor: not-allowed; }',
      '.buye-qty .buye-qty-val { padding: 2px 6px; font-size: 12px; color: ' + esc(formCfg.formTextColor) + '; border-left: 1px solid ' + esc(formCfg.formBorderColor) + '; border-right: 1px solid ' + esc(formCfg.formBorderColor) + '; min-width: 24px; text-align: center; line-height: 1.4; }',

      /* ─── Order summary ──────────────────────────────────────────────────── */
      '.buye-summary { margin-bottom: 14px; }',
      '.buye-summary-card { background: rgba(0,0,0,0.04); border-radius: ' + Math.max(formCfg.fieldBorderRadiusPx - 2, 4) + 'px; padding: 10px 12px; margin-bottom: 6px; }',
      '.buye-summary-row { display: flex; justify-content: space-between; align-items: center; }',
      '.buye-summary-row + .buye-summary-row { margin-top: 8px; padding-top: 8px; border-top: 1px solid ' + esc(formCfg.formBorderColor) + '33; }',
      '.buye-summary-label { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: ' + esc(formCfg.formTextColor) + '; opacity: 0.6; letter-spacing: 0.02em; }',
      '.buye-summary-label svg { opacity: 0.5; }',
      '.buye-summary-value { font-size: 12px; font-weight: 500; color: ' + esc(formCfg.formTextColor) + '; }',
      '.buye-summary-value.is-free { color: #008060; }',
      '.buye-total-card { background: rgba(0,0,0,0.07); border-radius: ' + Math.max(formCfg.fieldBorderRadiusPx - 2, 4) + 'px; padding: 11px 12px; display: flex; justify-content: space-between; align-items: center; }',
      '.buye-total-label { font-weight: 700; font-size: 13px; color: ' + esc(formCfg.formTextColor) + '; letter-spacing: 0.01em; }',
      '.buye-total-value { font-weight: 800; font-size: 15px; color: ' + esc(formCfg.formTextColor) + '; }',

      /* ─── Shipping rates ─────────────────────────────────────────────────── */
      '.buye-shipping-block { margin-bottom: 14px; }',
      '.buye-shipping-title { margin: 0 0 8px; font-weight: 600; font-size: 12px; color: ' + esc(formCfg.formTextColor) + '; }',
      '.buye-rate-list { display: flex; flex-direction: column; gap: 6px; }',
      '.buye-rate-option {',
      '  display: flex; align-items: center; justify-content: space-between;',
      '  padding: 9px 12px;',
      '  border: 1.5px solid ' + esc(formCfg.fieldBorderColor) + ';',
      '  border-radius: ' + formCfg.fieldBorderRadiusPx + 'px;',
      '  cursor: pointer;',
      '  background: transparent;',
      '  color: ' + esc(formCfg.formTextColor) + ';',
      '  transition: border-color 0.15s, background 0.15s;',
      '}',
      '.buye-rate-option:hover { border-color: ' + esc(formCfg.formTextColor) + '66; }',
      '.buye-rate-option.selected { border-color: ' + esc(formCfg.formTextColor) + '; background: rgba(0,0,0,0.04); }',
      '.buye-rate-option input[type=radio] { position: absolute; opacity: 0; pointer-events: none; }',
      '.buye-rate-left { display: flex; align-items: center; gap: 8px; min-width: 0; }',
      '.buye-rate-radio { width: 15px; height: 15px; border-radius: 50%; border: 2px solid ' + esc(formCfg.formTextColor) + '; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '.buye-rate-radio::after { content: ""; width: 7px; height: 7px; border-radius: 50%; background: ' + esc(formCfg.formTextColor) + '; transform: scale(0); transition: transform 0.15s; }',
      '.buye-rate-option.selected .buye-rate-radio::after { transform: scale(1); }',
      '.buye-rate-name { font-size: 12px; color: ' + esc(formCfg.formTextColor) + '; font-weight: 500; }',
      '.buye-rate-desc { font-size: 11px; color: ' + esc(formCfg.formTextColor) + '; opacity: 0.55; margin-left: 6px; }',
      '.buye-rate-price { font-size: 12px; font-weight: 600; color: ' + esc(formCfg.formTextColor) + '; flex-shrink: 0; white-space: nowrap; }',
      '.buye-rate-price.is-free { color: #008060; }',

      /* ─── Form fields ────────────────────────────────────────────────────── */
      '.buye-field { margin-bottom: 10px; }',
      '.buye-label {',
      '  display: block;',
      '  font-size: 12px;',
      '  font-weight: ' + (formCfg.formTextBold ? '700' : '600') + ';',
      '  font-style: ' + (formCfg.formTextItalic ? 'italic' : 'normal') + ';',
      '  margin-bottom: 4px;',
      '  color: ' + esc(formCfg.formTextColor) + ';',
      '  text-align: ' + esc(formCfg.textAlign) + ';',
      '  ' + (formCfg.hideLabels ? 'display: none !important;' : '') + '',
      '}',
      '.buye-label .buye-required { color: #e53e3e; margin-left: 2px; }',
      '.buye-input-wrap {',
      '  display: flex; align-items: stretch;',
      '  background: ' + esc(formCfg.fieldBgColor) + ';',
      '  border: 1px solid ' + esc(formCfg.fieldBorderColor) + ';',
      '  border-radius: ' + formCfg.fieldBorderRadiusPx + 'px;',
      '  overflow: hidden;',
      '  transition: border-color 0.15s, box-shadow 0.15s;',
      '}',
      '.buye-input-wrap:focus-within { border-color: ' + esc(formCfg.formTextColor) + '; box-shadow: 0 0 0 3px ' + esc(formCfg.formTextColor) + '1f; }',
      '.buye-input-wrap.invalid { border-color: #e53e3e; }',
      '.buye-input-icon {',
      '  background: rgba(0,0,0,0.04);',
      '  padding: 0 10px;',
      '  display: flex; align-items: center;',
      '  border-' + (formCfg.rtl ? 'left' : 'right') + ': 1px solid ' + esc(formCfg.fieldBorderColor) + ';',
      '  flex-shrink: 0;',
      '  color: ' + esc(formCfg.fieldTextColor) + ';',
      '  opacity: 0.55;',
      '}',
      '.buye-input, .buye-textarea, .buye-select {',
      '  flex: 1;',
      '  width: 100%;',
      '  min-width: 0;',
      '  box-sizing: border-box;',
      '  border: none;',
      '  background: transparent;',
      '  color: ' + esc(formCfg.fieldTextColor) + ';',
      '  font-size: ' + formCfg.fieldFontSizePx + 'px;',
      '  font-family: inherit;',
      '  padding: 9px 10px;',
      '  outline: none;',
      '}',
      '.buye-input::placeholder, .buye-textarea::placeholder { color: ' + esc(formCfg.fieldTextColor) + '; opacity: 0.4; }',
      '.buye-textarea { resize: vertical; min-height: 72px; }',
      '.buye-select { appearance: none; -webkit-appearance: none; padding-' + (formCfg.rtl ? 'left' : 'right') + ': 32px; cursor: pointer; }',
      '.buye-select-chevron { display: flex; align-items: center; padding: 0 10px; flex-shrink: 0; pointer-events: none; color: ' + esc(formCfg.fieldTextColor) + '; opacity: 0.55; }',
      '.buye-error-msg { display: none; color: #e53e3e; font-size: 11px; margin-top: 4px; }',
      '.buye-field.has-error .buye-error-msg { display: block; }',

      /* ─── Checkbox ───────────────────────────────────────────────────────── */
      '.buye-checkbox-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 0; user-select: none; }',
      '.buye-checkbox-wrap input { position: absolute; opacity: 0; pointer-events: none; }',
      '.buye-checkbox-box { width: 15px; height: 15px; border: 1.5px solid ' + esc(formCfg.formBorderColor) + '; border-radius: 3px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s, border-color 0.15s; }',
      '.buye-checkbox-wrap input:checked + .buye-checkbox-box { background: ' + esc(formCfg.formTextColor) + '; border-color: ' + esc(formCfg.formTextColor) + '; }',
      '.buye-checkbox-wrap input:checked + .buye-checkbox-box::after { content: ""; width: 4px; height: 7px; border: solid ' + esc(formCfg.formBgColor) + '; border-width: 0 2px 2px 0; transform: rotate(45deg) translate(-1px, -1px); }',
      '.buye-checkbox-label { font-size: 12px; color: ' + esc(formCfg.formTextColor) + '; line-height: 1.4; }',

      /* ─── Submit button ──────────────────────────────────────────────────── */
      '#buyease-submit {',
      '  width: 100%;',
      '  margin-top: 8px;',
      '  padding: 13px 20px;',
      '  background: ' + esc(formCfg.formTextColor) + ';',
      '  color: ' + esc(formCfg.formBgColor) + ';',
      '  border: none;',
      '  border-radius: ' + formCfg.fieldBorderRadiusPx + 'px;',
      '  font-family: inherit;',
      '  font-size: ' + formCfg.fieldFontSizePx + 'px;',
      '  font-weight: 700;',
      '  letter-spacing: 0.3px;',
      '  cursor: pointer;',
      '  display: inline-flex; align-items: center; justify-content: center; gap: 8px;',
      '  min-height: 46px;',
      '  transition: opacity 0.15s, transform 0.1s;',
      '}',
      '#buyease-submit:hover:not(:disabled) { opacity: 0.9; }',
      '#buyease-submit:active:not(:disabled) { transform: translateY(1px); }',
      '#buyease-submit:disabled { opacity: 0.55; cursor: not-allowed; }',
      '#buyease-submit .buye-spinner { width: 16px; height: 16px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: buye-spin 0.7s linear infinite; }',

      /* ─── Inline error banner ────────────────────────────────────────────── */
      '.buye-form-banner { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: ' + Math.max(formCfg.fieldBorderRadiusPx - 2, 4) + 'px; font-size: 12.5px; line-height: 1.4; margin-bottom: 12px; }',
      '.buye-form-banner.is-error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }',
      '.buye-form-banner svg { flex-shrink: 0; }',

      /* ─── Success state ──────────────────────────────────────────────────── */
      '#buyease-success { text-align: center; padding: 8px 4px 12px; }',
      '#buyease-success .buye-success-circle { width: 64px; height: 64px; margin: 0 auto 14px; border-radius: 50%; background: #ecfdf5; display: inline-flex; align-items: center; justify-content: center; color: #059669; }',
      '#buyease-success h2 { font-size: 18px; font-weight: 700; margin: 0 0 6px; color: ' + esc(formCfg.formTextColor) + '; }',
      '#buyease-success p { font-size: 13px; line-height: 1.5; opacity: 0.75; margin: 0 0 18px; color: ' + esc(formCfg.formTextColor) + '; }',
      '#buyease-success .buye-order-name { font-weight: 700; opacity: 1; }',
      '#buyease-done-btn { padding: 11px 26px; background: ' + esc(formCfg.formTextColor) + '; color: ' + esc(formCfg.formBgColor) + '; border: none; border-radius: ' + formCfg.fieldBorderRadiusPx + 'px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }',
      '#buyease-done-btn:hover { opacity: 0.9; }',

      /* ─── Embedded form card ────────────────────────────────────────────── */
      '#buyease-embedded-card {',
      '  background: ' + esc(formCfg.formBgColor) + ';',
      '  color: ' + esc(formCfg.formTextColor) + ';',
      '  border: ' + formCfg.formBorderWidthPx + 'px solid ' + esc(formCfg.formBorderColor) + ';',
      '  border-radius: ' + formCfg.formBorderRadiusPx + 'px;',
      '  box-shadow: 0 2px ' + Math.max(formCfg.formShadowPx, 4) + 'px rgba(0,0,0,0.1);',
      '  padding: ' + formCfg.formPaddingPx + 'px;',
      '  width: 100%;',
      '  box-sizing: border-box;',
      '  font-family: inherit;',
      '  font-weight: ' + (formCfg.formTextBold ? '600' : '400') + ';',
      '  font-style: ' + (formCfg.formTextItalic ? 'italic' : 'normal') + ';',
      '  direction: ' + (formCfg.rtl ? 'rtl' : 'ltr') + ';',
      '  position: relative;',
      '  margin-top: 12px;',
      '  scrollbar-width: thin;',
      '}',
      '#buyease-embedded-card::-webkit-scrollbar { width: 6px; }',
      '#buyease-embedded-card::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 3px; }',

      /* Animations */
      '@keyframes buye-fadein { from { opacity: 0; } to { opacity: 1; } }',
      '@keyframes buye-slidein { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
      /* Keyframe values mirror the admin SVG <animateTransform> values verbatim
         (see PreviewMotionWrapper). Times are computed from `keyTimes` defaults
         (even spacing across N values). */
      '@keyframes buye-shake-lr { 0%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} 100%{transform:translateX(0)} }',
      '@keyframes buye-shake-ud { 0%{transform:translateY(0)} 20%{transform:translateY(-4px)} 40%{transform:translateY(4px)} 60%{transform:translateY(-3px)} 80%{transform:translateY(3px)} 100%{transform:translateY(0)} }',
      '@keyframes buye-shake-bottom { 0%{transform:translateY(0)} 25%{transform:translateY(4px)} 50%{transform:translateY(1px)} 75%{transform:translateY(5px)} 100%{transform:translateY(0)} }',
      '@keyframes buye-pulse { 0%{transform:scale(1)} 25%{transform:scale(1.03)} 50%{transform:scale(1)} 75%{transform:scale(0.98)} 100%{transform:scale(1)} }',
      '@keyframes buye-bounce { 0%{transform:translateY(0)} 25%{transform:translateY(-8px)} 50%{transform:translateY(0)} 75%{transform:translateY(-4px)} 100%{transform:translateY(0)} }',
      '@keyframes buye-fanfare { 0%{transform:translateX(0)} 20%{transform:translateX(4px)} 40%{transform:translateX(-4px)} 60%{transform:translateX(3px)} 80%{transform:translateX(-3px)} 100%{transform:translateX(0)} }',
      '@keyframes buye-spin { to { transform: rotate(360deg); } }',

      /* Google Places Map Picker */
      '.buye-address-wrap { display: flex; gap: 8px; }',
      '.buye-address-wrap .buye-input-wrap { flex: 1; }',
      '.buye-map-btn { flex-shrink: 0; width: 40px; height: 40px; border: 1px solid ' + esc(formCfg.fieldBorderColor) + '; border-radius: ' + formCfg.fieldBorderRadiusPx + 'px; background: ' + esc(formCfg.fieldBgColor) + '; cursor: pointer; display: flex; align-items: center; justify-content: center; color: ' + esc(formCfg.fieldTextColor) + '; }',
      '.buye-map-btn:hover { opacity: 0.8; }',
      '#buye-map-overlay { position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,0.55); display: flex; flex-direction: column; }',
      '#buye-map-container { flex: 1; width: 100%; }',
      '#buye-map-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; gap: 12px; box-shadow: 0 -2px 8px rgba(0,0,0,0.08); }',
      '#buye-map-confirm { padding: 10px 24px; background: #111; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }',
      '#buye-map-confirm:hover { background: #333; }',
      '#buye-map-close { padding: 10px 16px; background: transparent; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; cursor: pointer; color: #374151; }',
      '#buye-map-address-preview { font-size: 13px; color: #6b7280; flex: 1; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    ].join('\n');

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildAnimationCSS(anim) {
    /* Durations match the admin SVG <animateTransform dur=""> values verbatim,
       so the storefront animation timing is identical to the admin live preview. */
    var map = {
      'shake-lr':     'buye-shake-lr 0.65s linear infinite',
      'shake-ud':     'buye-shake-ud 0.65s linear infinite',
      'shake-bottom': 'buye-shake-bottom 0.55s linear infinite',
      'pulse':        'buye-pulse 1.5s ease-in-out infinite',
      'bounce':       'buye-bounce 1.1s ease-in-out infinite',
      'fanfare':      'buye-fanfare 1.15s linear infinite',
    };
    var value = map[anim];
    if (!value) return '';
    return '#buyease-btn { animation: ' + value + '; }';
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────
  // ─── Product / collection restriction ───────────────────────────────────────
  // Returns true if the COD button should be displayed on the current page.
  // formCfg.productRestrictionMode:
  //   "none"       → no restriction, always show
  //   "enable-only" → show ONLY if productId or collectionId is in the lists
  //   "disable-for" → hide if productId or collectionId is in the lists
  function isAllowedByRestriction(formCfg, productId, collectionId) {
    var mode = formCfg && formCfg.productRestrictionMode;
    if (!mode || mode === 'none') return true;

    var products = Array.isArray(formCfg.restrictedProducts) ? formCfg.restrictedProducts : [];
    var collections = Array.isArray(formCfg.restrictedCollections) ? formCfg.restrictedCollections : [];

    var pid = String(productId || '');
    var cids = String(collectionId || '').split(',').filter(function (s) { return s; });

    var inProducts = pid && products.some(function (p) { return String(p.id) === pid; });
    var inCollections = cids.length > 0 && collections.some(function (c) {
      return cids.indexOf(String(c.id)) !== -1;
    });
    var matched = inProducts || inCollections;

    if (mode === 'enable-only') return matched;
    if (mode === 'disable-for') return !matched;
    return true;
  }

  function isAllowedByCountry(formCfg, country) {
    if (!formCfg || !formCfg.allowCountriesOnly) return true;
    var allowed = Array.isArray(formCfg.allowedCountries) ? formCfg.allowedCountries : [];
    if (allowed.length === 0) return true;
    return allowed.indexOf((country || '').toUpperCase()) !== -1;
  }

  function isAllowedByOrderTotal(formCfg, priceInCents, quantity) {
    if (!formCfg || !formCfg.enableOrderEligibility) return { allowed: true, message: '' };
    var total = (priceInCents * (quantity || 1)) / 100;
    var min = formCfg.orderEligibilityMin;
    var max = formCfg.orderEligibilityMax;
    if (min !== null && min !== undefined && total < Number(min)) {
      return {
        allowed: false,
        message: formCfg.showIneligibleMessage && formCfg.ineligibleMessage ? formCfg.ineligibleMessage : '',
      };
    }
    if (max !== null && max !== undefined && Number(max) > 0 && total > Number(max)) {
      return {
        allowed: false,
        message: formCfg.showIneligibleMessage && formCfg.ineligibleMessage ? formCfg.ineligibleMessage : '',
      };
    }
    return { allowed: true, message: '' };
  }

  // ─── Placement & settings enforcement ────────────────────────────────────────

  function isPlacementAllowed(formCfg, pageType) {
    var placement = (formCfg && formCfg.formPlacement) || 'whole-store';
    var disableIn = (formCfg && formCfg.disableInPages) || {};

    if (placement === 'cart-page') return pageType === 'cart';
    if (placement === 'product-pages') return pageType === 'product';

    // whole-store — allowed everywhere except explicitly disabled page types
    if (pageType === 'home' && disableIn.homePage) return false;
    if (pageType === 'collection' && disableIn.collectionPage) return false;
    if (pageType === 'page' && disableIn.regularPage) return false;
    if (pageType === 'search' && disableIn.searchResultPage) return false;
    return true;
  }

  function applyHideButtonsCSS(formCfg) {
    var existing = document.getElementById('buyease-hide-btns');
    if (existing) existing.remove();
    var rules = [];

    if (formCfg && formCfg.hideCheckout) {
      rules.push(
        'form[action="/cart"] [name="checkout"],' +
        'form[action="/cart"] button[name="checkout"],' +
        'form[action="/cart"] input[name="checkout"],' +
        'a[href="/checkout"],' +
        'a[href="/cart/checkout"],' +
        '.cart__checkout-button,' +
        '.cart-checkout-button,' +
        '[data-cart-checkout-btn]' +
        ' { display: none !important; }'
      );
    }

    if (formCfg && formCfg.hideAddToCart) {
      rules.push(
        'button[name="add"]:not(#buyease-btn),' +
        '[data-add-to-cart]:not(#buyease-btn),' +
        'form[action*="/cart/add"] [name="add"],' +
        'form[action*="/cart/add"] [data-add-to-cart],' +
        'form[action*="/cart/add"] button[type="submit"]:not(#buyease-btn),' +
        'form[action*="/cart/add"] button:not([type="button"]):not(#buyease-btn)' +
        ' { display: none !important; }'
      );
    }

    if (formCfg && formCfg.hideBuyNow) {
      rules.push(
        '.shopify-payment-button,' +
        '[data-shopify="payment-button"],' +
        '.shopify-payment-button__button,' +
        '.shopify-payment-button__more-options' +
        ' { display: none !important; }'
      );
    }

    if (!rules.length) return;
    var style = document.createElement('style');
    style.id = 'buyease-hide-btns';
    style.textContent = rules.join('\n');
    document.head.appendChild(style);
  }

  function injectCustomCss(formCfg) {
    if (!formCfg || !formCfg.customCss) return;
    if (document.getElementById('buyease-custom-css')) return;
    var style = document.createElement('style');
    style.id = 'buyease-custom-css';
    style.textContent = formCfg.customCss;
    document.head.appendChild(style);
  }

  function fetchCart(callback) {
    fetch('/cart.js')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cart) {
        callback((cart && Array.isArray(cart.items)) ? cart.items : []);
      })
      .catch(function () { callback([]); });
  }

  function initCartContext(items) {
    _cartItems = items;
    _isCartMode = true;
    _ctx.priceInCents = items.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
    _ctx.quantity = items.reduce(function (s, i) { return s + i.quantity; }, 0);
    _ctx.productTitle = 'Your Cart';
    _ctx.productImage = '';
    _ctx.variantTitle = '';
  }

  function mountCartButton() {
    var existing = document.getElementById('buyease-btn');
    if (existing) return true;

    var btn = buildButtonElement(openCartForm);

    document.documentElement.classList.add('buyease-active');

    if (_btnCfg.stickyPosition && _btnCfg.stickyPosition !== 'off') {
      var existingWrap = document.getElementById('buyease-sticky-wrap');
      if (existingWrap) existingWrap.remove();
      var wrap = document.createElement('div');
      wrap.id = 'buyease-sticky-wrap';
      wrap.className = 'sticky-' + _btnCfg.stickyPosition;
      if (_btnCfg.mobileFullWidth) wrap.style.padding = '10px 0';
      wrap.appendChild(btn);
      document.body.appendChild(wrap);
      return true;
    }

    var checkoutBtn = document.querySelector(
      'form[action="/cart"] [name="checkout"],' +
      'form[action="/cart"] button[name="checkout"],' +
      'form[action="/cart"] input[name="checkout"],' +
      '.cart__checkout-button,' +
      '[data-cart-checkout-btn]'
    );
    if (checkoutBtn && checkoutBtn.parentNode) {
      checkoutBtn.parentNode.insertBefore(btn, checkoutBtn);
      return true;
    }

    var cartForm = document.querySelector('form[action="/cart"]');
    if (cartForm) {
      cartForm.appendChild(btn);
      return true;
    }

    return false;
  }

  function ensureCartButtonMounted() {
    if (mountCartButton()) return;
    if (_mountObserver) return;
    _mountObserver = new MutationObserver(function () {
      if (mountCartButton()) {
        if (_mountObserver) { _mountObserver.disconnect(); _mountObserver = null; }
        if (_mountRetryTimer) { clearTimeout(_mountRetryTimer); _mountRetryTimer = null; }
      }
    });
    _mountObserver.observe(document.body, { childList: true, subtree: true });
    _mountRetryTimer = setTimeout(function () {
      if (_mountObserver) { _mountObserver.disconnect(); _mountObserver = null; }
      _mountRetryTimer = null;
    }, 10000);
  }

  function openCartForm() {
    if (_overlay) return;
    if (!_cartItems.length) return;

    _overlay = document.createElement('div');
    _overlay.id = OVERLAY_ID;

    var card = document.createElement('div');
    card.id = 'buyease-form-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', 'COD Order Form');

    card.innerHTML = buildCartFormHTML();
    _overlay.appendChild(card);
    document.body.appendChild(_overlay);
    document.body.style.overflow = 'hidden';

    _googleData = { formattedAddress: null, mapsUrl: null, latitude: null, longitude: null, placeId: null };
    initGooglePlaces();

    bindFormEvents(card);

    var firstInput = card.querySelector('input[type="text"], input[type="tel"], input[type="email"], textarea');
    if (firstInput) firstInput.focus({ preventScroll: true });
  }

  function buildCartFormHTML() {
    var fields = Array.isArray(_formCfg.fields) ? _formCfg.fields : [];
    var visibleFields = fields.filter(function (f) { return !f.hidden; });

    var parts = [
      '<button type="button" id="buyease-close" aria-label="Close">&#215;</button>',
      '<form id="buyease-form" novalidate autocomplete="' + (_formCfg.autocomplete !== false ? 'on' : 'off') + '">',
    ];

    visibleFields.forEach(function (field) {
      if (field.type === 'cart') {
        parts.push(renderCartItemsField());
      } else {
        parts.push(renderField(field));
      }
    });

    parts.push('</form>');
    return parts.join('');
  }

  function renderCartItemsField() {
    if (!_cartItems || !_cartItems.length) return '';

    var itemsHtml = _cartItems.map(function (item) {
      var imgUrl = item.featured_image && item.featured_image.url ? item.featured_image.url : '';
      var thumb = imgUrl
        ? '<img src="' + esc(imgUrl) + '" alt="' + esc(item.product_title || '') + '" loading="lazy" />'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" style="opacity:0.35"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15L16 10L5 21" stroke-linecap="round"/></svg>';
      var variantLine = (item.variant_title && item.variant_title !== 'Default Title')
        ? '<p class="buye-cart-variant">' + esc(item.variant_title) + '</p>'
        : '';
      return [
        '<div class="buye-cart-card">',
        '  <div class="buye-cart-thumb">' + thumb + '</div>',
        '  <div class="buye-cart-meta">',
        '    <p class="buye-cart-title">' + esc(item.product_title || item.title || '') + '</p>',
        variantLine,
        '    <p class="buye-cart-variant">Qty: ' + item.quantity + '</p>',
        '  </div>',
        '  <div class="buye-cart-right">',
        '    <span class="buye-cart-price">' + fmtPrice(item.price * item.quantity, item.currency || _ctx.currency) + '</span>',
        '  </div>',
        '</div>',
      ].join('');
    }).join('');

    return [
      itemsHtml,
      '<div class="buye-section-divider"></div>',
    ].join('');
  }

  function collectCartFormData() {
    var form = document.getElementById('buyease-form');
    if (!form) return null;

    var data = {};
    var inputs = form.querySelectorAll('input[data-field-id], textarea[data-field-id], select[data-field-id]');
    inputs.forEach(function (input) {
      var id = input.dataset.fieldId;
      if (input.type === 'checkbox') data[id] = input.checked;
      else data[id] = (input.value || '').trim();
    });

    var selectedRate = form.querySelector('input[name="buye-shipping"]:checked');
    var shippingRateId = (selectedRate && selectedRate.value) ? selectedRate.value : undefined;

    var firstName = data.first_name || data.firstName || data.customerName || data.name || '';
    var lastName = data.last_name || data.lastName || '';
    var fullName = (firstName + ' ' + lastName).trim();

    var lineItems = _cartItems.map(function (item) {
      return { variantId: item.variant_id, quantity: item.quantity };
    });

    var payload = {
      shop: _ctx.shop,
      lineItems: lineItems,
      shippingRateId: shippingRateId,
      customerName: fullName || firstName,
      customerPhone: data.phone || data.customerPhone || '',
      customerEmail: (data.email || data.customerEmail || '') || undefined,
      address1: data.address || data.address1 || data.street || '',
      address2: data.address2 || undefined,
      city: data.city || '',
      province: data.province || data.state || undefined,
      postalCode: data.postal_code || data.postalCode || data.zip || data.postal || undefined,
      country: (data.country || _ctx.country || 'US').toString().trim().slice(0, 2).toUpperCase(),
      note: data.note || data.message || data.order_notes || undefined,
      marketingConsent: !!(data.marketing_checkbox || data.marketingConsent || data.marketing),
    };

    if (_googleData.formattedAddress) payload.googleFormattedAddress = _googleData.formattedAddress;
    if (_googleData.mapsUrl) payload.googleMapsUrl = _googleData.mapsUrl;
    if (_googleData.latitude !== null) payload.googleLatitude = _googleData.latitude;
    if (_googleData.longitude !== null) payload.googleLongitude = _googleData.longitude;
    if (_googleData.placeId) payload.googlePlaceId = _googleData.placeId;

    return payload;
  }

  function init() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return;

    _ctx = {
      shop: root.dataset.shop || '',
      apiBase: (root.dataset.apiBase || '').replace(/\/$/, ''),
      productId: root.dataset.productId || '',
      collectionId: root.dataset.collectionId || '',
      variantId: root.dataset.variantId || '',
      priceInCents: parseInt(root.dataset.price || '0', 10),
      currency: root.dataset.currency || 'USD',
      country: (
        (typeof window !== 'undefined' && window.Shopify && window.Shopify.country)
          ? window.Shopify.country
          : (root.dataset.country || 'US')
      ).toUpperCase(),
      productTitle: root.dataset.productTitle || 'Product',
      productImage: root.dataset.productImage || '',
      variantTitle: root.dataset.variantTitle || '',
      quantity: 1,
      pageType: root.dataset.pageType || 'product',
    };

    // Product pages need a variantId; other page types fetch their data dynamically
    if (_ctx.pageType === 'product' && !_ctx.variantId) return;

    // If apiBase is missing, render with defaults immediately (theme editor preview / offline)
    if (!_ctx.apiBase || !_ctx.shop) {
      if (_ctx.pageType !== 'product') return;
      _btnCfg = DEFAULT_BTN_CFG;
      _formCfg = DEFAULT_FORM_CFG;
      injectStyles(_btnCfg, _formCfg);
      renderButton();
      return;
    }

    Promise.all([
      fetch(_ctx.apiBase + '/api/storefront/buy-button-config?shop=' + encodeURIComponent(_ctx.shop)),
      fetch(_ctx.apiBase + '/api/storefront/form-config?shop=' + encodeURIComponent(_ctx.shop)),
      fetch(buildShippingRatesURL()),
    ])
      .then(function (responses) {
        return Promise.all(responses.map(function (r) { return r.ok ? r.json() : null; }));
      })
      .then(function (results) {
        _btnCfg = results[0] || DEFAULT_BTN_CFG;
        _formCfg = results[1] || DEFAULT_FORM_CFG;
        _rates = (results[2] && results[2].rates) ? results[2].rates : [];

        warmGoogleDns();

        // Always apply dynamic button hiding and custom CSS regardless of visibility
        applyHideButtonsCSS(_formCfg);
        injectCustomCss(_formCfg);

        if (_btnCfg.isVisible === false) {
          unmountButton();
          return;
        }

        // Check placement rules
        if (!isPlacementAllowed(_formCfg, _ctx.pageType)) {
          unmountButton();
          return;
        }

        // Non-product pages: fetch cart items and use cart mode
        if (_ctx.pageType !== 'product') {
          fetchCart(function (items) {
            if (!items.length) { unmountButton(); return; }
            initCartContext(items);

            if (!isAllowedByCountry(_formCfg, _ctx.country)) { unmountButton(); return; }

            var eligibility = isAllowedByOrderTotal(_formCfg, _ctx.priceInCents, 1);
            if (!eligibility.allowed) {
              if (eligibility.message) {
                injectStyles(_btnCfg, _formCfg);
                renderIneligibleMessage(eligibility.message);
              } else {
                unmountButton();
              }
              return;
            }

            injectStyles(_btnCfg, _formCfg);
            ensureCartButtonMounted();
          });
          return;
        }

        // Product page — existing restriction/eligibility checks
        if (!isAllowedByRestriction(_formCfg, _ctx.productId, _ctx.collectionId)) {
          unmountButton();
          return;
        }

        if (!isAllowedByCountry(_formCfg, _ctx.country)) {
          unmountButton();
          return;
        }

        var eligibility = isAllowedByOrderTotal(_formCfg, _ctx.priceInCents, _ctx.quantity);
        if (!eligibility.allowed) {
          if (eligibility.message) {
            injectStyles(_btnCfg, _formCfg);
            renderIneligibleMessage(eligibility.message);
          } else {
            unmountButton();
          }
          return;
        }

        injectStyles(_btnCfg, _formCfg);
        renderButton();
      })
      .catch(function () {
        if (_ctx.pageType !== 'product') return;
        _btnCfg = DEFAULT_BTN_CFG;
        _formCfg = DEFAULT_FORM_CFG;
        injectStyles(_btnCfg, _formCfg);
        renderButton();
      });
  }

  // ─── Button ───────────────────────────────────────────────────────────────────
  var _mountObserver = null;
  var _mountRetryTimer = null;

  function buildButtonElement(clickHandler) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'buyease-btn';
    btn.setAttribute('aria-label', _btnCfg.buttonText);

    /* Icon size formula matches admin BuyButtonPreviewSvg: min(28, fontSize * 1.3) */
    var iconSize = Math.min(28, Math.round((_btnCfg.fontSizePx || 16) * 1.3));
    var iconSvg = (_btnCfg.showIcon !== false && _btnCfg.iconId && _btnCfg.iconId !== 'none')
      ? renderButtonIcon(_btnCfg.iconId, iconSize)
      : '';
    var iconHtml = iconSvg
      ? '<span class="buye-btn-icon" aria-hidden="true">' + iconSvg + '</span>'
      : '';

    var subtitleHtml = _btnCfg.buttonSubtitle
      ? '<span class="buyease-btn-sub">' + esc(_btnCfg.buttonSubtitle) + '</span>'
      : '';

    var textHtml = '<span class="buyease-btn-text"><span>' + esc(_btnCfg.buttonText) + '</span>' + subtitleHtml + '</span>';

    btn.innerHTML = _btnCfg.iconAlign === 'end'
      ? textHtml + iconHtml
      : iconHtml + textHtml;

    btn.addEventListener('click', clickHandler || openForm);
    return btn;
  }

  function isVisible(el) {
    if (!el) return false;
    if (el.offsetParent !== null) return true;
    var rects = el.getClientRects();
    return rects.length > 0 && rects[0].width > 0 && rects[0].height > 0;
  }

  function findCartForm() {
    var forms = document.querySelectorAll('form[action*="/cart/add"]');
    if (!forms.length) return null;
    for (var i = 0; i < forms.length; i++) {
      if (isVisible(forms[i])) return forms[i];
    }
    return forms[0];
  }

  function findAddToCartButton(form) {
    if (!form) return null;
    var candidates = form.querySelectorAll(
      '[name="add"], ' +
      '[data-add-to-cart], ' +
      'button[type="submit"]:not(.shopify-payment-button__button):not(.shopify-payment-button__more-options), ' +
      'input[type="submit"]'
    );
    // Prefer the first visible candidate — themes with sticky add-to-cart bars
    // often have a hidden duplicate button earlier in the DOM.
    for (var i = 0; i < candidates.length; i++) {
      if (isVisible(candidates[i])) return candidates[i];
    }
    return candidates[0] || null;
  }

  function findDynamicCheckoutBlock(form) {
    if (!form) return null;
    return form.querySelector(
      '.shopify-payment-button, [data-shopify="payment-button"]'
    );
  }

  function mountButton() {
    var existing = document.getElementById('buyease-btn');
    if (existing) return true;

    var btn = buildButtonElement();

    // Sticky mode: anchor to body
    if (_btnCfg.stickyPosition && _btnCfg.stickyPosition !== 'off') {
      var existingWrap = document.getElementById('buyease-sticky-wrap');
      if (existingWrap) existingWrap.remove();
      var wrap = document.createElement('div');
      wrap.id = 'buyease-sticky-wrap';
      wrap.className = 'sticky-' + _btnCfg.stickyPosition;
      if (_btnCfg.mobileFullWidth) wrap.style.padding = '10px 0';
      wrap.appendChild(btn);
      document.body.appendChild(wrap);
      document.documentElement.classList.add('buyease-active');
      return true;
    }

    var form = findCartForm();
    if (!form) return false;

    // Mark page as BuyEase-active so any extra hide rules can target this state.
    document.documentElement.classList.add('buyease-active');

    /* The BuyEase button must live in the SAME DOM parent as the visible
       Add-to-Cart so it inherits the exact same width / flex sizing — this is
       what makes the two buttons match width on the page.

       Strategy:
       1) Find the visible ATC button. Always insert AFTER it. The dynamic-
          checkout block (.shopify-payment-button) is hidden via inline CSS
          regardless of where it sits in the DOM, so we don't need to skip
          past it — and skipping it can place BuyEase ABOVE ATC on themes
          that render the payment block before ATC.
       2) Fall back to inserting after the (hidden) dynamic-checkout block.
       3) Last resort: append to the product form. */
    var atcBtn = findAddToCartButton(form);
    if (atcBtn && atcBtn.parentNode) {
      atcBtn.parentNode.insertBefore(btn, atcBtn.nextSibling);
      return true;
    }

    // ATC not found — fall back to inserting after the dynamic-checkout block.
    var paymentBlock = findDynamicCheckoutBlock(form);
    if (paymentBlock && paymentBlock.parentNode) {
      paymentBlock.parentNode.insertBefore(btn, paymentBlock.nextSibling);
      return true;
    }

    // Last resort: append to the product form
    form.appendChild(btn);
    return true;
  }

  function ensureButtonMounted() {
    if (mountButton()) return;

    // Cart form not in DOM yet — observe and retry. Some themes lazy-render
    // the product form, or theme editor swaps sections async.
    if (_mountObserver) return;

    _mountObserver = new MutationObserver(function () {
      if (mountButton()) {
        if (_mountObserver) { _mountObserver.disconnect(); _mountObserver = null; }
        if (_mountRetryTimer) { clearTimeout(_mountRetryTimer); _mountRetryTimer = null; }
      }
    });
    _mountObserver.observe(document.body, { childList: true, subtree: true });

    // Hard stop after 10s so the observer doesn't run forever on non-product pages
    _mountRetryTimer = setTimeout(function () {
      if (_mountObserver) { _mountObserver.disconnect(); _mountObserver = null; }
      _mountRetryTimer = null;
    }, 10000);
  }

  function unmountButton() {
    var btn = document.getElementById('buyease-btn');
    if (btn) btn.remove();
    var wrap = document.getElementById('buyease-sticky-wrap');
    if (wrap) wrap.remove();
    var embedded = document.getElementById(EMBEDDED_CARD_ID);
    if (embedded) embedded.remove();
    var ineligible = document.getElementById('buyease-ineligible-msg');
    if (ineligible) ineligible.remove();
    document.documentElement.classList.remove('buyease-active');
    if (_mountObserver) { _mountObserver.disconnect(); _mountObserver = null; }
    if (_mountRetryTimer) { clearTimeout(_mountRetryTimer); _mountRetryTimer = null; }
    var hideStyle = document.getElementById('buyease-hide-btns');
    if (hideStyle) hideStyle.remove();
    var customStyle = document.getElementById('buyease-custom-css');
    if (customStyle) customStyle.remove();
  }

  function renderIneligibleMessage(message) {
    unmountButton();
    var root = document.getElementById(ROOT_ID);
    if (!root) return;
    var el = document.createElement('div');
    el.id = 'buyease-ineligible-msg';
    el.style.cssText = 'padding:12px 16px;margin:8px 0;border-radius:8px;background:#FFF4E5;border:1px solid #FFD699;color:#6B4400;font-size:14px;line-height:1.4;';
    el.textContent = message;
    root.appendChild(el);
  }

  function renderButton() {
    if (_formCfg && _formCfg.formType === 'embedded') {
      renderEmbeddedForm();
    } else {
      ensureButtonMounted();
    }
  }

  // ─── Form ─────────────────────────────────────────────────────────────────────
  function openForm() {
    if (_overlay) return;

    // Reset quantity each time the form opens — UX matches admin preview default of 1.
    _ctx.quantity = 1;
    _isCartMode = false;
    _cartItems = [];

    // If merchant configured "product-and-cart", fetch cart items before opening
    if (_formCfg && _formCfg.whenOpened === 'product-and-cart') {
      fetchCart(function (items) {
        _cartItems = items;
        _openFormModal();
      });
      return;
    }

    _openFormModal();
  }

  function _openFormModal() {
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

    _googleData = { formattedAddress: null, mapsUrl: null, latitude: null, longitude: null, placeId: null };
    initGooglePlaces();

    bindFormEvents(card);

    // Focus first text input that isn't readonly/disabled — skip qty buttons & radios.
    var firstInput = card.querySelector('input[type="text"], input[type="tel"], input[type="email"], textarea');
    if (firstInput) firstInput.focus({ preventScroll: true });
  }

  function closeForm() {
    if (_overlay) {
      _overlay.remove();
      _overlay = null;
      document.body.style.overflow = '';
    }
  }

  // ─── Google Places Autocomplete ─────────────────────────────────────────────
  function warmGoogleDns() {
    if (!_formCfg || !_formCfg.googlePlacesEnabled) return;
    if (document.querySelector('link[href="https://maps.googleapis.com"]')) return;
    var l = document.createElement('link');
    l.rel = 'preconnect'; l.href = 'https://maps.googleapis.com'; l.crossOrigin = 'anonymous';
    document.head.appendChild(l);
  }

  function loadGooglePlaces(cb) {
    if (_placesReady) { cb(); return; }
    if (!_formCfg || !_formCfg.googlePlacesApiKey) return;
    var p = 'key=' + encodeURIComponent(_formCfg.googlePlacesApiKey) + '&libraries=places,geocoding&loading=async';
    if (_formCfg.googleAcLanguage) p += '&language=' + encodeURIComponent(_formCfg.googleAcLanguage);
    var s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?' + p;
    s.async = true; s.defer = true;
    s.onload = function () { _placesReady = true; cb(); };
    document.head.appendChild(s);
  }

  function initGooglePlaces() {
    if (!_formCfg || !_formCfg.googlePlacesEnabled || !_formCfg.googlePlacesApiKey) return;
    loadGooglePlaces(function () {
      setupPlacesAutocomplete();
      if (_formCfg.googleAcMapPicker) setupMapPicker();
      if (_formCfg.googleAcAutoLocate) tryAutoLocate();
    });
  }

  function setupPlacesAutocomplete() {
    var input = document.getElementById('buye-address') || document.getElementById('buye-address1');
    if (!input || !window.google || !window.google.maps || !window.google.maps.places) return;
    var opts = { types: [_formCfg.googleAcPlaceType || 'address'], fields: ['address_components', 'formatted_address', 'geometry', 'place_id', 'url'] };
    if (_formCfg.googleAcCountries && _formCfg.googleAcCountries.length) {
      opts.componentRestrictions = { country: _formCfg.googleAcCountries };
    }
    var ac = new google.maps.places.Autocomplete(input, opts);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
    ac.addListener('place_changed', function () {
      var place = ac.getPlace();
      if (!place || !place.address_components) return;
      _googleData.formattedAddress = place.formatted_address || null;
      _googleData.mapsUrl = place.url || null;
      _googleData.placeId = place.place_id || null;
      if (place.geometry && place.geometry.location) {
        _googleData.latitude = place.geometry.location.lat();
        _googleData.longitude = place.geometry.location.lng();
      }
      applyAddressComponents(place.address_components, place.formatted_address);
      logPlacesUsage('autocomplete');
    });
  }

  function setupMapPicker() {
    var btn = document.getElementById('buye-map-btn');
    if (btn) btn.addEventListener('click', openMapOverlay);
  }

  function openMapOverlay() {
    if (!window.google || !window.google.maps) return;
    var geocoder = new google.maps.Geocoder();
    var pendingComponents = null;
    var pendingFormatted = '';

    var overlay = document.createElement('div');
    overlay.id = 'buye-map-overlay';
    overlay.innerHTML =
      '<div id="buye-map-container"></div>' +
      '<div id="buye-map-toolbar">' +
      '<button type="button" id="buye-map-close">Cancel</button>' +
      '<span id="buye-map-address-preview">Drag the pin to your location</span>' +
      '<button type="button" id="buye-map-confirm">Confirm</button>' +
      '</div>';
    document.body.appendChild(overlay);

    var defaultCenter = { lat: 25, lng: 45 };
    var map = new google.maps.Map(document.getElementById('buye-map-container'), {
      zoom: 13, center: defaultCenter,
      disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy',
    });
    var marker = new google.maps.Marker({
      position: defaultCenter, map: map, draggable: true,
      animation: google.maps.Animation.DROP,
    });

    function reverseGeocode(latlng) {
      var req = { location: latlng };
      geocoder.geocode(req, function (results, status) {
        if (status === 'OK' && results[0]) {
          pendingComponents = results[0].address_components;
          pendingFormatted = results[0].formatted_address;
          var el = document.getElementById('buye-map-address-preview');
          if (el) el.textContent = pendingFormatted;
        }
      });
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (pos) {
        var latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(latlng); marker.setPosition(latlng); reverseGeocode(latlng);
      });
    }

    marker.addListener('dragend', function () { reverseGeocode(marker.getPosition().toJSON()); });

    document.getElementById('buye-map-confirm').addEventListener('click', function () {
      if (pendingComponents) {
        var pos = marker.getPosition().toJSON();
        _googleData.formattedAddress = pendingFormatted || null;
        _googleData.placeId = null;
        _googleData.latitude = pos.lat;
        _googleData.longitude = pos.lng;
        _googleData.mapsUrl = 'https://maps.google.com/?q=' + pos.lat + ',' + pos.lng;
        applyAddressComponents(pendingComponents, pendingFormatted);
        logPlacesUsage('geocode');
      }
      document.body.removeChild(overlay);
    });
    document.getElementById('buye-map-close').addEventListener('click', function () {
      document.body.removeChild(overlay);
    });
  }

  function tryAutoLocate() {
    if (!navigator.geolocation || !window.google || !window.google.maps) return;
    navigator.geolocation.getCurrentPosition(function (pos) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat: pos.coords.latitude, lng: pos.coords.longitude } },
        function (results, status) {
          if (status === 'OK' && results[0]) {
            _googleData.formattedAddress = results[0].formatted_address || null;
            _googleData.placeId = results[0].place_id || null;
            _googleData.latitude = pos.coords.latitude;
            _googleData.longitude = pos.coords.longitude;
            _googleData.mapsUrl = 'https://maps.google.com/?q=' + pos.coords.latitude + ',' + pos.coords.longitude;
            applyAddressComponents(results[0].address_components, results[0].formatted_address);
            logPlacesUsage('geocode');
          }
        }
      );
    }, function () { /* denied — silent */ });
  }

  function applyAddressComponents(components, formattedAddress) {
    var streetNumber = '', route = '', city = '', province = '', postalCode = '', country = '';
    components.forEach(function (c) {
      var t = c.types;
      if (t.indexOf('street_number') !== -1) streetNumber = c.long_name;
      if (t.indexOf('route') !== -1) route = c.long_name;
      if (t.indexOf('locality') !== -1) city = c.long_name;
      if (t.indexOf('administrative_area_level_1') !== -1) province = c.short_name;
      if (t.indexOf('postal_code') !== -1) postalCode = c.long_name;
      if (t.indexOf('country') !== -1) country = c.short_name;
    });
    var input = document.getElementById('buye-address') || document.getElementById('buye-address1');
    if (input) {
      input.value = [streetNumber, route].filter(Boolean).join(' ') || formattedAddress || '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    var fills = [
      { id: 'city', value: city, enabled: _formCfg.googleAcFillCity !== false },
      { id: 'postal_code', value: postalCode, enabled: _formCfg.googleAcFillPostalCode !== false },
      { id: 'province', value: province, enabled: _formCfg.googleAcFillProvince !== false },
      { id: 'state', value: province, enabled: _formCfg.googleAcFillProvince !== false },
      { id: 'country', value: country, enabled: _formCfg.googleAcFillCountry !== false },
    ];
    fills.forEach(function (f) {
      if (!f.enabled || !f.value) return;
      var el = document.getElementById('buye-' + f.id);
      if (el) { el.value = f.value; el.dispatchEvent(new Event('input', { bubbles: true })); }
    });
  }

  function logPlacesUsage(sessionType) {
    if (!_ctx.shop || !_ctx.apiBase || _placesBalanceDepleted) return;
    fetch(_ctx.apiBase + '/api/storefront/places-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: _ctx.shop, sessionType: sessionType }),
      keepalive: true,
    }).then(function (res) {
      // When the merchant's balance runs out the server returns 402.
      // Set the flag so no further charge requests are made this session.
      if (res.status === 402) { _placesBalanceDepleted = true; }
    }).catch(function () { /* silent */ });
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
    /* Admin treats selects as `type: "input"` with `isSelect: true`, so we have
       to route on isSelect first. The discriminated `select` type is also
       supported for forward compatibility. */
    if ((field.type === 'input' || field.type === 'select') && field.isSelect === true) {
      return renderSelectField(field);
    }
    switch (field.type) {
      case 'header':   return renderHeaderField(field);
      case 'cart':     return renderCartField(field);
      case 'summary':  return renderSummaryField(field);
      case 'shipping': return renderShippingField(field);
      case 'checkbox': return renderCheckboxField(field);
      case 'submit':   return renderSubmitField(field);
      case 'input':    return renderInputField(field, 'text');
      case 'textarea': return renderTextareaField(field);
      case 'select':   return renderSelectField(field);
      default:         return renderInputField(field, 'text');
    }
  }

  function renderHeaderField(field) {
    return '<h2 class="buye-form-header">' + esc(field.title || '') + '</h2>';
  }

  /* ─── Cart card ────────────────────────────────────────────────────────── */
  function renderCartField() {
    var price = fmtPrice(_ctx.priceInCents * _ctx.quantity, _ctx.currency);
    var thumb = _ctx.productImage
      ? '<img src="' + esc(_ctx.productImage) + '" alt="' + esc(_ctx.productTitle) + '" loading="lazy" />'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" style="opacity:0.35"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15L16 10L5 21" stroke-linecap="round"/></svg>';

    var variantLine = _ctx.variantTitle
      ? '<p class="buye-cart-variant">' + esc(_ctx.variantTitle) + '</p>'
      : '';

    return [
      '<div class="buye-cart-card">',
      '  <div class="buye-cart-thumb">' + thumb + '</div>',
      '  <div class="buye-cart-meta">',
      '    <p class="buye-cart-title">' + esc(_ctx.productTitle) + '</p>',
      variantLine,
      '  </div>',
      '  <div class="buye-cart-right">',
      '    <span class="buye-cart-price" id="buye-cart-price">' + price + '</span>',
      '    <div class="buye-qty" role="group" aria-label="Quantity">',
      '      <button type="button" id="buye-qty-dec" aria-label="Decrease quantity">&minus;</button>',
      '      <span class="buye-qty-val" id="buye-qty-val">' + _ctx.quantity + '</span>',
      '      <button type="button" id="buye-qty-inc" aria-label="Increase quantity">+</button>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="buye-section-divider"></div>',
    ].join('');
  }

  function bindQuantityEvents(card) {
    var dec = card.querySelector('#buye-qty-dec');
    var inc = card.querySelector('#buye-qty-inc');
    var val = card.querySelector('#buye-qty-val');
    if (!dec || !inc || !val) return;

    function sync() {
      dec.disabled = _ctx.quantity <= 1;
      inc.disabled = _ctx.quantity >= 10; // server caps at 10
      val.textContent = _ctx.quantity;
    }
    sync();

    dec.addEventListener('click', function () {
      if (_ctx.quantity <= 1) return;
      _ctx.quantity -= 1; sync(); refreshCartTotals(); refreshShippingRates();
    });
    inc.addEventListener('click', function () {
      if (_ctx.quantity >= 10) return;
      _ctx.quantity += 1; sync(); refreshCartTotals(); refreshShippingRates();
    });
  }

  function refreshCartTotals() {
    var cartPriceEl = document.getElementById('buye-cart-price');
    if (cartPriceEl) cartPriceEl.textContent = fmtPrice(_ctx.priceInCents * _ctx.quantity, _ctx.currency);

    var subtotalEl = document.getElementById('buye-summary-subtotal');
    if (subtotalEl) subtotalEl.textContent = fmtPrice(_ctx.priceInCents * _ctx.quantity, _ctx.currency);

    var selectedRate = document.querySelector('input[name="buye-shipping"]:checked');
    var shippingPrice = selectedRate ? parseFloat(selectedRate.dataset.price || '0') : 0;
    refreshTotal(shippingPrice);
    refreshSubmitLabel();
  }

  function refreshTotal(shippingPrice) {
    var subtotalAmount = _isCartMode
      ? _ctx.priceInCents / 100
      : (_ctx.priceInCents * _ctx.quantity) / 100;
    var totalAmount = subtotalAmount + (shippingPrice || 0);
    var totalEl = document.getElementById('buye-total-price');
    if (totalEl) {
      try {
        totalEl.textContent = new Intl.NumberFormat(undefined, { style: 'currency', currency: _ctx.currency }).format(totalAmount);
      } catch (e) {
        totalEl.textContent = _ctx.currency + ' ' + totalAmount.toFixed(2);
      }
    }
  }

  function refreshSubmitLabel() {
    var btn = document.getElementById('buyease-submit');
    if (!btn || btn.disabled) return;
    btn.innerHTML = computeSubmitLabel();
  }

  /* ─── Order summary ────────────────────────────────────────────────────── */
  function renderSummaryField() {
    var subtotalCents = _isCartMode ? _ctx.priceInCents : _ctx.priceInCents * _ctx.quantity;
    var subtotal = fmtPrice(subtotalCents, _ctx.currency);
    var hasRates = _rates.length > 0;
    var initialShipping = hasRates ? fmtRatePrice(_rates[0].price, _rates[0].currency || _ctx.currency) : 'Free';
    var initialShippingFree = hasRates ? _rates[0].price === 0 : true;
    var totalCents = subtotalCents + (hasRates ? Math.round(_rates[0].price * 100) : 0);
    var total = fmtPrice(totalCents, _ctx.currency);

    return [
      '<div class="buye-summary">',
      '  <div class="buye-summary-card">',
      '    <div class="buye-summary-row">',
      '      <span class="buye-summary-label">',
      '        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1h7l2 4H3L1 1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="4" cy="10" r="1" fill="currentColor"/><circle cx="9" cy="10" r="1" fill="currentColor"/></svg>',
      '        Subtotal',
      '      </span>',
      '      <span class="buye-summary-value" id="buye-summary-subtotal">' + subtotal + '</span>',
      '    </div>',
      '    <div class="buye-summary-row">',
      '      <span class="buye-summary-label">',
      '        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1" y="3" width="7" height="6" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M8 5h2l1 3H8V5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
      '        Shipping',
      '      </span>',
      '      <span class="buye-summary-value' + (initialShippingFree ? ' is-free' : '') + '" id="buye-summary-shipping">' + initialShipping + '</span>',
      '    </div>',
      '  </div>',
      '  <div class="buye-total-card">',
      '    <span class="buye-total-label">Total</span>',
      '    <span class="buye-total-value" id="buye-total-price">' + total + '</span>',
      '  </div>',
      '</div>',
      '<div class="buye-section-divider"></div>',
    ].join('');
  }

  /* ─── Shipping selector ────────────────────────────────────────────────── */
  function renderShippingField(field) {
    var title = field.hideLabel ? '' : '<p class="buye-shipping-title">' + esc(field.title || 'Shipping Method') + '</p>';

    if (!_rates.length) {
      // Mirror admin "no rates" state — single Free Shipping row, selected, disabled.
      return [
        '<div class="buye-shipping-block">',
        title,
        '<div class="buye-rate-list">',
        '  <label class="buye-rate-option selected" style="opacity:0.85; cursor: default;">',
        '    <input type="radio" name="buye-shipping" value="" data-price="0" data-currency="' + esc(_ctx.currency) + '" checked disabled>',
        '    <span class="buye-rate-left"><span class="buye-rate-radio"></span><span class="buye-rate-name">Free Shipping</span></span>',
        '    <span class="buye-rate-price is-free">Free</span>',
        '  </label>',
        '</div>',
        '</div>',
        '<div class="buye-section-divider"></div>',
      ].join('');
    }

    var options = _rates.map(function (rate, idx) {
      var priceStr = fmtRatePrice(rate.price, rate.currency || _ctx.currency);
      var isFree = rate.price === 0;
      var checked = idx === 0;
      var desc = rate.description ? '<span class="buye-rate-desc">' + esc(rate.description) + '</span>' : '';
      return [
        '<label class="buye-rate-option' + (checked ? ' selected' : '') + '">',
        '  <input type="radio" name="buye-shipping" value="' + esc(rate.id) + '" data-price="' + rate.price + '" data-currency="' + esc(rate.currency || _ctx.currency) + '"' + (checked ? ' checked' : '') + '>',
        '  <span class="buye-rate-left">',
        '    <span class="buye-rate-radio"></span>',
        '    <span><span class="buye-rate-name">' + esc(rate.name) + '</span>' + desc + '</span>',
        '  </span>',
        '  <span class="buye-rate-price' + (isFree ? ' is-free' : '') + '">' + priceStr + '</span>',
        '</label>',
      ].join('');
    }).join('');

    return [
      '<div class="buye-shipping-block">',
      title,
      '<div class="buye-rate-list">' + options + '</div>',
      '</div>',
      '<div class="buye-section-divider"></div>',
    ].join('');
  }

  /* ─── Inputs ───────────────────────────────────────────────────────────── */
  function renderInputField(field, type) {
    var inputType = type || 'text';
    if (field.id === 'phone' || field.id === 'customerPhone') inputType = 'tel';
    if (field.id === 'email' || field.id === 'customerEmail') inputType = 'email';
    if (field.validation === 'email') inputType = 'email';
    if (field.validation === 'phone') inputType = 'tel';
    if (field.validation === 'number') inputType = 'number';

    var fieldId = 'buye-' + esc(field.id);
    var label = renderFieldLabel(field, fieldId);
    var iconHtml = renderFieldIcon(field);
    var autocomplete = _formCfg.autocomplete !== false ? getAutocomplete(field.id) : 'off';

    var isAddress = (field.id === 'address' || field.id === 'address1');
    var showMapBtn = isAddress && _formCfg.googlePlacesEnabled && _formCfg.googleAcMapPicker;

    var inputHtml = [
      '<div class="buye-input-wrap">',
      iconHtml,
      '<input',
      '  type="' + inputType + '"',
      '  id="' + fieldId + '"',
      '  name="' + esc(field.id) + '"',
      '  class="buye-input"',
      '  placeholder="' + esc(field.placeholder || '') + '"',
      '  autocomplete="' + autocomplete + '"',
      '  ' + (field.required ? 'required' : '') + '',
      '  ' + (field.minLength ? 'minlength="' + field.minLength + '"' : '') + '',
      '  ' + (field.maxLength ? 'maxlength="' + field.maxLength + '"' : '') + '',
      '  data-field-id="' + esc(field.id) + '"',
      '  data-required="' + (field.required ? 'true' : 'false') + '"',
      '/>',
      '</div>',
    ].join('');

    var fieldContent = showMapBtn
      ? '<div class="buye-address-wrap">' + inputHtml +
        '<button type="button" id="buye-map-btn" class="buye-map-btn" aria-label="Pick on map">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>' +
        '</button></div>'
      : inputHtml;

    return [
      '<div class="buye-field" data-field-wrap-id="' + esc(field.id) + '">',
      label,
      fieldContent,
      '<div class="buye-error-msg">' + esc(field.errorMessage || _formCfg.errorRequired || 'This field is required') + '</div>',
      '</div>',
    ].join('');
  }

  function renderTextareaField(field) {
    var fieldId = 'buye-' + esc(field.id);
    var label = renderFieldLabel(field, fieldId);
    return [
      '<div class="buye-field" data-field-wrap-id="' + esc(field.id) + '">',
      label,
      '<div class="buye-input-wrap">',
      '<textarea',
      '  id="' + fieldId + '"',
      '  name="' + esc(field.id) + '"',
      '  class="buye-textarea"',
      '  placeholder="' + esc(field.placeholder || '') + '"',
      '  rows="3"',
      '  data-field-id="' + esc(field.id) + '"',
      '  data-required="' + (field.required ? 'true' : 'false') + '"',
      '  ' + (field.required ? 'required' : '') + '',
      '></textarea>',
      '</div>',
      '<div class="buye-error-msg">' + esc(field.errorMessage || _formCfg.errorRequired || 'This field is required') + '</div>',
      '</div>',
    ].join('');
  }

  function renderSelectField(field) {
    var fieldId = 'buye-' + esc(field.id);
    var label = renderFieldLabel(field, fieldId);
    /* Schema stores options as `string[]`. Admin passes objects `{id,value}`
       in its UI but the API serializes them to strings before the form-config
       endpoint returns them. Handle both shapes defensively. */
    var rawOptions = Array.isArray(field.options) ? field.options : [];
    var options = rawOptions
      .map(function (o) {
        if (o == null) return null;
        if (typeof o === 'string') return { value: o, label: o };
        if (typeof o === 'object') {
          var value = (o.value != null && o.value !== '') ? String(o.value) : '';
          var lbl = (o.label != null && o.label !== '') ? String(o.label) : value;
          if (!value && !lbl) return null;
          return { value: value || lbl, label: lbl || value };
        }
        return null;
      })
      .filter(function (o) { return o !== null; });

    var placeholderText = field.noneOptionLabel || field.placeholder || ('Select ' + (field.title || 'an option'));
    var placeholderOption = '<option value="" disabled' + (field.required ? '' : '') + ' selected hidden>' + esc(placeholderText) + '</option>';

    var optionHtml = placeholderOption + options.map(function (o) {
      return '<option value="' + esc(o.value) + '">' + esc(o.label) + '</option>';
    }).join('');

    var iconHtml = renderFieldIcon(field);

    return [
      '<div class="buye-field" data-field-wrap-id="' + esc(field.id) + '">',
      label,
      '<div class="buye-input-wrap">',
      iconHtml,
      '<select id="' + fieldId + '" name="' + esc(field.id) + '" class="buye-select" data-field-id="' + esc(field.id) + '" data-required="' + (field.required ? 'true' : 'false') + '"' + (field.required ? ' required' : '') + '>',
      optionHtml,
      '</select>',
      '<span class="buye-select-chevron"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"/></svg></span>',
      '</div>',
      '<div class="buye-error-msg">' + esc(field.errorMessage || _formCfg.errorRequired || 'This field is required') + '</div>',
      '</div>',
    ].join('');
  }

  function renderCheckboxField(field) {
    return [
      '<div class="buye-field">',
      '<label class="buye-checkbox-wrap">',
      '<input type="checkbox" id="buye-' + esc(field.id) + '" name="' + esc(field.id) + '" data-field-id="' + esc(field.id) + '"' + (field.required ? ' data-required="true"' : '') + '/>',
      '<span class="buye-checkbox-box" aria-hidden="true"></span>',
      '<span class="buye-checkbox-label">' + esc(field.title || '') + (field.required ? ' <span class="buye-required">*</span>' : '') + '</span>',
      '</label>',
      '</div>',
    ].join('');
  }

  function renderSubmitField(field) {
    _submitLabelTemplate = field.title || field.placeholder || 'Place Order';
    if (_formCfg && _formCfg.hideSubmitButton) return '';
    return '<button type="submit" id="buyease-submit">' + computeSubmitLabel() + '</button>';
  }

  function renderFieldLabel(field, htmlFor) {
    if (field.hideLabel || _formCfg.hideLabels) return '';
    var requiredMark = field.required ? ' <span class="buye-required">*</span>' : '';
    return '<label class="buye-label" for="' + htmlFor + '">' + esc(field.title || '') + requiredMark + '</label>';
  }

  function renderFieldIcon(field) {
    var visible = _formCfg.showIcons !== false && field.showIcon === true && field.iconId && ICON_PATHS[field.iconId];
    if (!visible) return '';
    return '<span class="buye-input-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + getIconPath(field.iconId) + '</svg></span>';
  }

  /* Replaces {total} in submit label with the live order total. */
  function computeSubmitLabel() {
    var template = _submitLabelTemplate || 'Place Order';
    var subtotal = _isCartMode
      ? _ctx.priceInCents / 100
      : (_ctx.priceInCents * _ctx.quantity) / 100;
    var selectedRate = document.querySelector('input[name="buye-shipping"]:checked');
    var shippingPrice = selectedRate ? parseFloat(selectedRate.dataset.price || '0') : 0;
    var total = subtotal + shippingPrice;
    var totalStr;
    try {
      totalStr = new Intl.NumberFormat(undefined, { style: 'currency', currency: _ctx.currency }).format(total);
    } catch (e) {
      totalStr = _ctx.currency + ' ' + total.toFixed(2);
    }
    return esc(template).replace('{total}', totalStr).replace('%7Btotal%7D', totalStr);
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

    // Quantity stepper (cart card)
    bindQuantityEvents(card);

    // Shipping rate selection
    bindShippingHandlers(card);

    // Live-clear errors as the user fixes them
    var fieldInputs = card.querySelectorAll('input[data-field-id], textarea[data-field-id], select[data-field-id]');
    fieldInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var wrap = input.closest('.buye-field');
        if (wrap && wrap.classList.contains('has-error')) validateField(input);
      });
      input.addEventListener('blur', function () {
        // Only validate on blur if the user has typed something or the field is required.
        if ((input.value || '').trim() || input.dataset.required === 'true') validateField(input);
        /* When the merchant restricts rates by region, the user typing a
           province / country into the form may make new rates eligible (or
           hide ones that no longer match). Re-pull on blur — debounced via
           AbortController in refreshShippingRates so rapid edits don't stack
           in-flight requests. */
        var fieldId = input.dataset.fieldId || '';
        if (fieldId === 'province' || fieldId === 'state' || fieldId === 'country') {
          refreshShippingRates();
        }
      });
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

  function bindShippingHandlers(scope) {
    var shippingRadios = scope.querySelectorAll('input[name="buye-shipping"]');
    shippingRadios.forEach(function (radio) {
      radio.addEventListener('change', handleShippingChange);
    });
  }

  function handleShippingChange(e) {
    var radio = e.target;
    var allOptions = document.querySelectorAll('.buye-rate-option');
    allOptions.forEach(function (opt) { opt.classList.remove('selected'); });
    var parent = radio.closest('.buye-rate-option');
    if (parent) parent.classList.add('selected');
    updateSummary(radio);
  }

  function updateSummary(radio) {
    var shippingPrice = parseFloat(radio.dataset.price || '0');
    var currency = radio.dataset.currency || _ctx.currency;
    var shippingEl = document.getElementById('buye-summary-shipping');
    if (shippingEl) {
      shippingEl.textContent = fmtRatePrice(shippingPrice, currency);
      shippingEl.classList.toggle('is-free', shippingPrice === 0);
    }
    refreshTotal(shippingPrice);
    refreshSubmitLabel();
  }

  // ─── Validation ───────────────────────────────────────────────────────────────
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[+\-\d\s().]{6,}$/;

  function validateField(input) {
    var wrap = input.closest('.buye-field') || input.parentElement;
    var inputWrap = input.closest('.buye-input-wrap');
    var val = (input.value || '').trim();
    var required = input.dataset.required === 'true';
    var isCheckbox = input.type === 'checkbox';
    var error = null;

    if (required) {
      if (isCheckbox && !input.checked) error = _formCfg.errorRequired || 'This field is required';
      else if (!isCheckbox && !val) error = _formCfg.errorRequired || 'This field is required';
    }
    if (!error && val) {
      if (input.type === 'email' && !EMAIL_RE.test(val)) error = _formCfg.errorInvalid || 'Please enter a valid email';
      else if (input.type === 'tel' && !PHONE_RE.test(val)) error = _formCfg.errorInvalid || 'Please enter a valid phone number';
    }

    if (wrap) wrap.classList.toggle('has-error', !!error);
    if (inputWrap) inputWrap.classList.toggle('invalid', !!error);
    var msgEl = wrap && wrap.querySelector('.buye-error-msg');
    if (msgEl && error) msgEl.textContent = error;
    return !error;
  }

  function validateForm() {
    var inputs = document.querySelectorAll('#buyease-form [data-required="true"], #buyease-form input[type="email"]:not([data-required="true"]), #buyease-form input[type="tel"]:not([data-required="true"])');
    var firstInvalid = null;
    inputs.forEach(function (input) {
      var ok = validateField(input);
      if (!ok && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid && firstInvalid.focus) firstInvalid.focus({ preventScroll: false });
    return !firstInvalid;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    clearFormBanner();
    if (!validateForm()) return;

    var submitBtn = document.getElementById('buyease-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="buye-spinner" aria-hidden="true"></span><span>Placing order…</span>';
    }

    var formData = _isCartMode ? collectCartFormData() : collectFormData();

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
          showFormBanner(result.data && result.data.error ? result.data.error : 'Could not place order. Please try again.');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = computeSubmitLabel(); }
          return;
        }
        showSuccess(result.data);
      })
      .catch(function () {
        showFormBanner('Network error. Please check your connection and try again.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = computeSubmitLabel(); }
      });
  }

  function collectFormData() {
    var form = document.getElementById('buyease-form');
    if (!form) {
      return { shop: _ctx.shop, variantId: _ctx.variantId, quantity: _ctx.quantity || 1 };
    }

    var data = {};
    var inputs = form.querySelectorAll('input[data-field-id], textarea[data-field-id], select[data-field-id]');
    inputs.forEach(function (input) {
      var id = input.dataset.fieldId;
      if (input.type === 'checkbox') data[id] = input.checked;
      else data[id] = (input.value || '').trim();
    });

    var selectedRate = form.querySelector('input[name="buye-shipping"]:checked');
    var shippingRateId = (selectedRate && selectedRate.value) ? selectedRate.value : undefined;

    var firstName = data.first_name || data.firstName || data.customerName || data.name || '';
    var lastName = data.last_name || data.lastName || '';
    var fullName = (firstName + ' ' + lastName).trim();

    // When "product-and-cart" is enabled, include cart items as additional line items
    var lineItems = null;
    if (_formCfg && _formCfg.whenOpened === 'product-and-cart' && _cartItems.length > 0) {
      lineItems = [{ variantId: _ctx.variantId, quantity: _ctx.quantity || 1 }].concat(
        _cartItems.map(function (item) {
          return { variantId: item.variant_id, quantity: item.quantity };
        })
      );
    }

    var payload = {
      shop: _ctx.shop,
      variantId: lineItems ? undefined : _ctx.variantId,
      quantity: lineItems ? undefined : (_ctx.quantity || 1),
      lineItems: lineItems || undefined,
      shippingRateId: shippingRateId,
      customerName: fullName || firstName,
      customerPhone: data.phone || data.customerPhone || '',
      customerEmail: (data.email || data.customerEmail || '') || undefined,
      address1: data.address || data.address1 || data.street || '',
      address2: data.address2 || undefined,
      city: data.city || '',
      province: data.province || data.state || undefined,
      postalCode: data.postal_code || data.postalCode || data.zip || data.postal || undefined,
      country: (data.country || _ctx.country || 'US').toString().trim().slice(0, 2).toUpperCase(),
      note: data.note || data.message || data.order_notes || undefined,
      marketingConsent: !!(data.marketing_checkbox || data.marketingConsent || data.marketing),
    };

    if (_googleData.formattedAddress) payload.googleFormattedAddress = _googleData.formattedAddress;
    if (_googleData.mapsUrl) payload.googleMapsUrl = _googleData.mapsUrl;
    if (_googleData.latitude !== null) payload.googleLatitude = _googleData.latitude;
    if (_googleData.longitude !== null) payload.googleLongitude = _googleData.longitude;
    if (_googleData.placeId) payload.googlePlaceId = _googleData.placeId;

    return payload;
  }

  // ─── Form banner (inline error / info) ───────────────────────────────────────
  function showFormBanner(message) {
    clearFormBanner();
    var banner = document.createElement('div');
    banner.id = 'buyease-form-banner';
    banner.className = 'buye-form-banner is-error';
    banner.setAttribute('role', 'alert');
    banner.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm-.75 4.75a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-1.5 0v-4ZM10 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>' +
      '<span>' + esc(message) + '</span>';

    var form = document.getElementById('buyease-form');
    if (form) {
      form.insertBefore(banner, form.firstChild);
      banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function clearFormBanner() {
    var existing = document.getElementById('buyease-form-banner');
    if (existing) existing.remove();
  }

  // ─── Success state ───────────────────────────────────────────────────────────
  function showSuccess(order) {
    var card = document.getElementById('buyease-form-card');
    if (!card) return;

    // Prefer the random BuyEase reference (e.g. "BE-7K4MNZ9Q") over the
    // sequential Shopify order name (#1001) so merchants don't expose order volume.
    var displayRef = (order && order.orderRef) ? order.orderRef : (order && order.orderName ? order.orderName : '');

    card.innerHTML = [
      '<button type="button" id="buyease-close" aria-label="Close">&#215;</button>',
      '<div id="buyease-success">',
      '  <div class="buye-success-circle">',
      '    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
      '  </div>',
      '  <h2>Order placed</h2>',
      '  <p>Thanks! ' + (displayRef ? 'Your order reference is <span class="buye-order-name">' + esc(displayRef) + '</span>. ' : '') + 'We\'ll be in touch to confirm delivery.</p>',
      '  <button type="button" id="buyease-done-btn">Done</button>',
      '</div>',
    ].join('');

    var closeBtn = card.querySelector('#buyease-close');
    if (closeBtn) closeBtn.addEventListener('click', closeForm);
    var doneBtn = card.querySelector('#buyease-done-btn');
    if (doneBtn) doneBtn.addEventListener('click', closeForm);
  }

  // ─── Field icons ──────────────────────────────────────────────────────────────
  // 24x24 stroke icons (rendered with stroke=currentColor inside .buye-input-icon).
  // Includes both legacy IDs (user, map-pin, building...) used by the seed config
  // AND the admin FORM_ICONS IDs (location, profile, mobile, chat, email, note,
  // text, alert, view, edit) so any saved merchant config resolves to a real icon.
  var ICON_PATHS = {
    user:     '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    profile:  '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    phone:    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.29 6.29l1.91-1.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mobile:   '<rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/>',
    'map-pin':'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    location: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    home:     '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    building: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    mail:     '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/>',
    email:    '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/>',
    chat:     '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    note:     '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>',
    text:     '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/>',
    alert:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    view:     '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    edit:     '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    hash:     '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    globe:    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  };

  function getIconPath(iconId) {
    return ICON_PATHS[iconId] || ICON_PATHS['text'];
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

  // ─── Embedded form ───────────────────────────────────────────────────────────
  function buildEmbeddedFormHTML() {
    var fields = Array.isArray(_formCfg.fields) ? _formCfg.fields : [];
    var visibleFields = fields.filter(function (f) { return !f.hidden; });
    var parts = [
      '<form id="buyease-form" novalidate autocomplete="' + (_formCfg.autocomplete !== false ? 'on' : 'off') + '">',
    ];
    visibleFields.forEach(function (field) {
      parts.push(renderField(field));
    });
    parts.push('</form>');
    return parts.join('');
  }

  function mountEmbeddedCard(card) {
    if (document.getElementById(EMBEDDED_CARD_ID)) return true;

    var form = findCartForm();
    if (!form) return false;

    document.documentElement.classList.add('buyease-active');

    var atcBtn = findAddToCartButton(form);
    if (atcBtn && atcBtn.parentNode) {
      atcBtn.parentNode.insertBefore(card, atcBtn.nextSibling);
      return true;
    }

    var paymentBlock = findDynamicCheckoutBlock(form);
    if (paymentBlock && paymentBlock.parentNode) {
      paymentBlock.parentNode.insertBefore(card, paymentBlock.nextSibling);
      return true;
    }

    form.appendChild(card);
    return true;
  }

  function renderEmbeddedForm() {
    if (document.getElementById(EMBEDDED_CARD_ID)) return;

    var card = document.createElement('div');
    card.id = EMBEDDED_CARD_ID;
    card.innerHTML = buildEmbeddedFormHTML();

    if (!mountEmbeddedCard(card)) {
      if (_mountObserver) return;
      _mountObserver = new MutationObserver(function () {
        if (mountEmbeddedCard(card)) {
          bindEmbeddedFormEvents(card);
          if (_mountObserver) { _mountObserver.disconnect(); _mountObserver = null; }
          if (_mountRetryTimer) { clearTimeout(_mountRetryTimer); _mountRetryTimer = null; }
        }
      });
      _mountObserver.observe(document.body, { childList: true, subtree: true });
      _mountRetryTimer = setTimeout(function () {
        if (_mountObserver) { _mountObserver.disconnect(); _mountObserver = null; }
        _mountRetryTimer = null;
      }, 10000);
      return;
    }

    _googleData = { formattedAddress: null, mapsUrl: null, latitude: null, longitude: null, placeId: null };
    initGooglePlaces();
    bindEmbeddedFormEvents(card);
  }

  function bindEmbeddedFormEvents(card) {
    bindQuantityEvents(card);
    bindShippingHandlers(card);

    var fieldInputs = card.querySelectorAll('input[data-field-id], textarea[data-field-id], select[data-field-id]');
    fieldInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var wrap = input.closest('.buye-field');
        if (wrap && wrap.classList.contains('has-error')) validateField(input);
      });
      input.addEventListener('blur', function () {
        if ((input.value || '').trim() || input.dataset.required === 'true') validateField(input);
        var fieldId = input.dataset.fieldId || '';
        if (fieldId === 'province' || fieldId === 'state' || fieldId === 'country') {
          refreshShippingRates();
        }
      });
    });

    var firstSelected = card.querySelector('input[name="buye-shipping"]:checked');
    if (firstSelected) updateSummary(firstSelected);

    var form = card.querySelector('#buyease-form');
    if (form) form.addEventListener('submit', handleEmbeddedSubmit);
  }

  function handleEmbeddedSubmit(e) {
    e.preventDefault();
    clearFormBanner();
    if (!validateForm()) return;

    var submitBtn = document.getElementById('buyease-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="buye-spinner" aria-hidden="true"></span><span>Placing order…</span>';
    }

    var formData = _isCartMode ? collectCartFormData() : collectFormData();

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
          showFormBanner(result.data && result.data.error ? result.data.error : 'Could not place order. Please try again.');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = computeSubmitLabel(); }
          return;
        }
        showEmbeddedSuccess(result.data);
      })
      .catch(function () {
        showFormBanner('Network error. Please check your connection and try again.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = computeSubmitLabel(); }
      });
  }

  function showEmbeddedSuccess(order) {
    var card = document.getElementById(EMBEDDED_CARD_ID);
    if (!card) return;

    var displayRef = (order && order.orderRef) ? order.orderRef : (order && order.orderName ? order.orderName : '');

    card.innerHTML = [
      '<div id="buyease-success">',
      '  <div class="buye-success-circle">',
      '    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
      '  </div>',
      '  <h2>Order placed</h2>',
      '  <p>Thanks! ' + (displayRef ? 'Your order reference is <span class="buye-order-name">' + esc(displayRef) + '</span>. ' : '') + 'We\'ll be in touch to confirm delivery.</p>',
      '  <button type="button" id="buyease-done-btn">Place another order</button>',
      '</div>',
    ].join('');

    var doneBtn = card.querySelector('#buyease-done-btn');
    if (doneBtn) {
      doneBtn.addEventListener('click', function () {
        _ctx.quantity = 1;
        card.innerHTML = buildEmbeddedFormHTML();
        bindEmbeddedFormEvents(card);
      });
    }
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────────
  function boot() {
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Theme editor: re-mount when the merchant toggles app embed or edits sections.
  // Shopify dispatches these events in the editor preview frame.
  document.addEventListener('shopify:section:load', function () {
    unmountButton();
    boot();
  });
  document.addEventListener('shopify:section:unload', function () {
    unmountButton();
  });
  document.addEventListener('shopify:block:select', function () {
    if (_formCfg && _formCfg.formType === 'embedded') {
      if (!document.getElementById(EMBEDDED_CARD_ID)) renderEmbeddedForm();
    } else {
      if (!document.getElementById('buyease-btn')) ensureButtonMounted();
    }
  });

  // SPA-style themes (Hydrogen, Dawn with Section Rendering API, etc.) often
  // swap the product form without a full page load. Re-attempt mount on URL
  // change so the BuyEase button follows the user.
  var _lastHref = location.href;
  setInterval(function () {
    if (location.href !== _lastHref) {
      _lastHref = location.href;
      unmountButton();
      boot();
    }
  }, 800);
})();
