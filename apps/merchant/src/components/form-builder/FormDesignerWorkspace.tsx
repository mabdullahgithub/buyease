"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  ActionList,
  Banner,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  ColorPicker,
  Divider,
  FormLayout,
  Icon,
  InlineGrid,
  InlineStack,
  Labelled,
  Link,
  Modal,
  Popover,
  RangeSlider,
  SkeletonBodyText,
  Tabs,
  Text,
  TextField,
  Tooltip,
  UnstyledButton,
} from "@shopify/polaris";
import type { HSBAColor } from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";

import { hexToHsb, hsbToHex, hsbaToRgbaString } from "@/lib/color-utils";
import { useShopifyBridge } from "@/lib/use-shopify-bridge";
import { BuyButtonLivePreview } from "@/components/form-builder/BuyButtonLivePreview";
import {
  AlertCircleIcon,
  CalendarIcon,
  CaretDownIcon,
  CartIcon,
  ChatIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  DeleteIcon,
  DragHandleIcon,
  EditIcon,
  EmailIcon,
  HideIcon,
  HomeIcon,
  ImageIcon,
  LinkIcon,
  LocationIcon,
  LockIcon,
  MobileIcon,
  NoteIcon,
  PhoneIcon,
  PlusIcon,
  ProfileIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextIcon,
  ViewIcon,
} from "@shopify/polaris-icons";

// ─── Icon registry ────────────────────────────────────────────────────────────

const FORM_ICONS = [
  { id: "location", source: LocationIcon },
  { id: "phone",    source: PhoneIcon },
  { id: "mobile",   source: MobileIcon },
  { id: "chat",     source: ChatIcon },
  { id: "email",    source: EmailIcon },
  { id: "profile",  source: ProfileIcon },
  { id: "note",     source: NoteIcon },
  { id: "text",     source: TextIcon },
  { id: "alert",    source: AlertCircleIcon },
  { id: "view",     source: ViewIcon },
  { id: "edit",     source: EditIcon },
];

function getFormIcon(id: string) {
  return FORM_ICONS.find((e) => e.id === id);
}

// ─── Templates ────────────────────────────────────────────────────────────────

type ShapeTemplate = { id: string; name: string; formBorderRadius: number; fieldBorderRadius: number };
type ColorTemplate  = { id: string; name: string; formBg: string; formBorder: string; formText: string; fieldBg: string; fieldBorder: string; fieldText: string };

const SHAPE_TEMPLATES: ShapeTemplate[] = [
  { id: "square",     name: "Square",     formBorderRadius: 0,  fieldBorderRadius: 0  },
  { id: "soft",       name: "Soft",       formBorderRadius: 6,  fieldBorderRadius: 4  },
  { id: "elegant",    name: "Elegant",    formBorderRadius: 12, fieldBorderRadius: 6  },
  { id: "rounded",    name: "Rounded",    formBorderRadius: 20, fieldBorderRadius: 10 },
  { id: "pill",       name: "Pill",       formBorderRadius: 32, fieldBorderRadius: 20 },
  { id: "full-round", name: "Full Round", formBorderRadius: 50, fieldBorderRadius: 50 },
];

const COLOR_TEMPLATES: ColorTemplate[] = [
  { id: "basic",     name: "Basic",     formBg: "#ffffff", formBorder: "#e1e3e5", formText: "#202223", fieldBg: "#ffffff", fieldBorder: "#cccccc", fieldText: "#1a1a1a" },
  { id: "emerald",   name: "Emerald",   formBg: "#f0fdf4", formBorder: "#a7f3d0", formText: "#065f46", fieldBg: "#ffffff", fieldBorder: "#6ee7b7", fieldText: "#065f46" },
  { id: "ruby",      name: "Ruby",      formBg: "#fff1f2", formBorder: "#fecdd3", formText: "#881337", fieldBg: "#ffffff", fieldBorder: "#fda4af", fieldText: "#881337" },
  { id: "excalibur", name: "Excalibur", formBg: "#0f172a", formBorder: "#1e293b", formText: "#f1f5f9", fieldBg: "#1e293b", fieldBorder: "#334155", fieldText: "#f1f5f9" },
  { id: "sapphire",  name: "Sapphire",  formBg: "#eff6ff", formBorder: "#bfdbfe", formText: "#1e40af", fieldBg: "#ffffff", fieldBorder: "#93c5fd", fieldText: "#1e40af" },
  { id: "aurora",    name: "Aurora",    formBg: "#faf5ff", formBorder: "#e9d5ff", formText: "#4c1d95", fieldBg: "#ffffff", fieldBorder: "#c4b5fd", fieldText: "#4c1d95" },
  { id: "obsidian",  name: "Obsidian",  formBg: "#111827", formBorder: "#374151", formText: "#f9fafb", fieldBg: "#1f2937", fieldBorder: "#4b5563", fieldText: "#f9fafb" },
];

const PREMIUM_COLOR_TEMPLATES: ColorTemplate[] = [
  { id: "neon",       name: "Neon",      formBg: "#0a0a0a", formBorder: "#00ff87", formText: "#00ff87", fieldBg: "#111111", fieldBorder: "#00cc6a", fieldText: "#00ff87" },
  { id: "sunset",     name: "Sunset",    formBg: "#fff7ed", formBorder: "#f97316", formText: "#7c2d12", fieldBg: "#ffffff", fieldBorder: "#fb923c", fieldText: "#7c2d12" },
  { id: "ocean",      name: "Ocean",     formBg: "#0c1a2e", formBorder: "#0ea5e9", formText: "#e0f2fe", fieldBg: "#0f2744", fieldBorder: "#38bdf8", fieldText: "#e0f2fe" },
  { id: "mint",       name: "Mint",      formBg: "#f0fdfa", formBorder: "#14b8a6", formText: "#134e4a", fieldBg: "#ffffff", fieldBorder: "#2dd4bf", fieldText: "#134e4a" },
  { id: "onyx",       name: "Onyx",      formBg: "#09090b", formBorder: "#27272a", formText: "#fafafa", fieldBg: "#18181b", fieldBorder: "#3f3f46", fieldText: "#fafafa" },
  { id: "rose-gold",  name: "Rose Gold", formBg: "#fff1f2", formBorder: "#f43f5e", formText: "#9f1239", fieldBg: "#fff5f7", fieldBorder: "#fb7185", fieldText: "#9f1239" },
  { id: "slate-pro",  name: "Slate Pro", formBg: "#1e293b", formBorder: "#475569", formText: "#f1f5f9", fieldBg: "#0f172a", fieldBorder: "#334155", fieldText: "#f1f5f9" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionItem = { id: string; value: string };

type FieldDef = {
  id: string;
  title: string;
  type: "header" | "cart" | "summary" | "shipping" | "input" | "checkbox" | "submit";
  deletable: boolean;
  placeholder?: string;
  required?: boolean;
  hideLabel?: boolean;
  errorMessage?: string;
  isSelect?: boolean;
  showIcon?: boolean;
  iconId?: string;
  hidden?: boolean;
  prefixText?: string;
  minLength?: number;
  maxLength?: number;
  options?: OptionItem[];
  noneOptionLabel?: string;
};

type ApiFieldDef = Omit<FieldDef, "options"> & { options?: string[] };

type ApiConfig = {
  formType: string;
  fields: ApiFieldDef[];
  formBgColor: string;
  formTextColor: string;
  formBorderColor: string;
  formBorderRadiusPx: number;
  formBorderWidthPx: number;
  formShadowPx: number;
  formPaddingPx: number;
  formTextBold: boolean;
  formTextItalic: boolean;
  fieldBgColor: string;
  fieldTextColor: string;
  fieldBorderColor: string;
  fieldBorderRadiusPx: number;
  fieldFontSizePx: number;
  textAlign: string;
  hideLabels: boolean;
  showIcons: boolean;
  rtl: boolean;
  autocomplete: boolean;
  stickyMobile: boolean;
  errorRequired: string;
  errorInvalid: string;
  errorSoldOut: string;
  isVisible: boolean;
};

const INITIAL_FIELDS: FieldDef[] = [
  { id: "header",   title: "Please fill in the form to order", type: "header",   deletable: false },
  { id: "cart",     title: "Cart Content / Quantity Offers",   type: "cart",     deletable: false },
  { id: "summary",  title: "Order summary",                    type: "summary",  deletable: false },
  { id: "shipping", title: "Shipping options",                  type: "shipping", deletable: false },
  { id: "firstName",title: "First Name",      type: "input", deletable: true, placeholder: "First Name",     required: true, showIcon: true, iconId: "profile" },
  { id: "phone",    title: "Phone",           type: "input", deletable: true, placeholder: "Phone Number",   required: true, showIcon: true, iconId: "phone" },
  { id: "address",  title: "Address",         type: "input", deletable: true, placeholder: "Street Address", required: true, showIcon: true, iconId: "location" },
  { id: "postal",   title: "Postal code",     type: "input", deletable: true, placeholder: "Postal Code",    required: true, showIcon: true, iconId: "note" },
  { id: "province", title: "Province (State)",type: "input", deletable: true, placeholder: "State",          required: true, showIcon: false, isSelect: true },
  { id: "city",     title: "City",            type: "input", deletable: true, placeholder: "City",           required: true, showIcon: true, iconId: "location" },
  { id: "marketing",title: "Buyer accepts marketing", type: "checkbox", deletable: true },
  { id: "submit",   title: "BUY IT NOW - {total}",    type: "submit",   deletable: false },
];

const DEFAULT_CONFIG = {
  formType:           "popup" as const,
  formBgColor:        "#ffffff",
  formTextColor:      "#202223",
  formBorderColor:    "#e1e3e5",
  formBorderRadiusPx: 12,
  formBorderWidthPx:  1,
  formShadowPx:       8,
  formPaddingPx:      20,
  formTextBold:       false,
  formTextItalic:     false,
  fieldBgColor:       "#ffffff",
  fieldTextColor:     "#1a1a1a",
  fieldBorderColor:   "#cccccc",
  fieldBorderRadiusPx:6,
  fieldFontSizePx:    14,
  textAlign:          "left" as const,
  hideLabels:         false,
  showIcons:          true,
  rtl:                false,
  autocomplete:       true,
  stickyMobile:       true,
  errorRequired:      "This field is required.",
  errorInvalid:       "This field is invalid.",
  errorSoldOut:       "Sold Out",
  isVisible:          true,
};

// ─── ColorPickerControl ───────────────────────────────────────────────────────

type ColorPickerControlProps = {
  id: string;
  label: string;
  color: HSBAColor;
  onChange: (c: HSBAColor) => void;
  openColorPicker: string | null;
  onToggle: (id: string) => void;
  onClose: () => void;
};

function ColorPickerControl({
  id, label, color, onChange, openColorPicker, onToggle, onClose,
}: ColorPickerControlProps): ReactElement {
  return (
    <Labelled id={id} label={label}>
      <Popover
        active={openColorPicker === id}
        preferredPosition="below"
        preferredAlignment="left"
        activator={
          <UnstyledButton
            type="button"
            accessibilityLabel={`Select ${label.toLowerCase()}`}
            onClick={() => onToggle(id)}
            style={{
              display: "block", width: "100%", cursor: "pointer",
              padding: "var(--p-space-200) var(--p-space-300)",
              borderRadius: "var(--p-border-radius-200)",
              border: "var(--p-border-width-025) solid var(--p-color-input-border)",
              background: "var(--p-color-bg-surface-secondary)",
              color: "var(--p-color-text)", font: "inherit", textAlign: "left",
            }}
          >
            <InlineStack gap="200" blockAlign="center">
              <div style={{
                width: "16px", height: "16px", background: hsbToHex(color),
                border: "1px solid var(--p-color-border-secondary)",
                borderRadius: "var(--p-border-radius-100)",
              }} />
              <span>{hsbToHex(color)}</span>
            </InlineStack>
          </UnstyledButton>
        }
        onClose={onClose}
      >
        <Box padding="400">
          <ColorPicker onChange={onChange} color={color} />
        </Box>
      </Popover>
    </Labelled>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormDesignerWorkspace({
  onNavigateToBuyButton,
}: {
  onNavigateToBuyButton?: () => void;
}): ReactElement {
  const shopify = useShopifyBridge();

  const [shopDomain, setShopDomain] = useState("");
  useEffect(() => {
    const domain = window.shopify?.config?.shop ?? "";
    if (domain) setShopDomain(domain);
  }, []);

  // Remote state
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [dirty,    setDirty]    = useState(false);
  const savedRef      = useRef<string | null>(null);
  const dirtyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form type
  const [formType, setFormType] = useState<"popup" | "embedded">(DEFAULT_CONFIG.formType);

  // Fields
  const [fields, setFields] = useState<FieldDef[]>(INITIAL_FIELDS);

  // Form colours
  const [formBgColor,     setFormBgColor]     = useState<HSBAColor>(hexToHsb(DEFAULT_CONFIG.formBgColor));
  const [formBorderColor, setFormBorderColor] = useState<HSBAColor>(hexToHsb(DEFAULT_CONFIG.formBorderColor));
  const [formTextColor,   setFormTextColor]   = useState<HSBAColor>(hexToHsb(DEFAULT_CONFIG.formTextColor));

  // Form shape
  const [formTextSize,     setFormTextSize]     = useState(DEFAULT_CONFIG.fieldFontSizePx);
  const [formBorderWidth,  setFormBorderWidth]  = useState(DEFAULT_CONFIG.formBorderWidthPx);
  const [formBorderRadius, setFormBorderRadius] = useState(DEFAULT_CONFIG.formBorderRadiusPx);
  const [formShadow,       setFormShadow]       = useState(DEFAULT_CONFIG.formShadowPx);
  const [formPaddingPx,    setFormPaddingPx]    = useState(DEFAULT_CONFIG.formPaddingPx);
  const [formLabelAlign,   setFormLabelAlign]   = useState<"left" | "center" | "right">(DEFAULT_CONFIG.textAlign);
  const [formTextBold,     setFormTextBold]     = useState(DEFAULT_CONFIG.formTextBold);
  const [formTextItalic,   setFormTextItalic]   = useState(DEFAULT_CONFIG.formTextItalic);

  // Field colours
  const [fieldBgColor,      setFieldBgColor]      = useState<HSBAColor>(hexToHsb(DEFAULT_CONFIG.fieldBgColor));
  const [fieldBorderColor,  setFieldBorderColor]  = useState<HSBAColor>(hexToHsb(DEFAULT_CONFIG.fieldBorderColor));
  const [fieldTextColor,    setFieldTextColor]    = useState<HSBAColor>(hexToHsb(DEFAULT_CONFIG.fieldTextColor));
  const [fieldBorderRadius, setFieldBorderRadius] = useState(DEFAULT_CONFIG.fieldBorderRadiusPx);

  // Preferences
  const [hideLabels,          setHideLabels]          = useState(DEFAULT_CONFIG.hideLabels);
  const [showIcons,           setShowIcons]           = useState(DEFAULT_CONFIG.showIcons);
  const [enableRtl,           setEnableRtl]           = useState(DEFAULT_CONFIG.rtl);
  const [disableAutocomplete, setDisableAutocomplete] = useState(!DEFAULT_CONFIG.autocomplete);
  const [stickyMobile,        setStickyMobile]        = useState(DEFAULT_CONFIG.stickyMobile);
  const [isVisible,           setIsVisible]           = useState(DEFAULT_CONFIG.isVisible);

  // Error messages
  const [requiredMsg,  setRequiredMsg]  = useState(DEFAULT_CONFIG.errorRequired);
  const [invalidMsg,   setInvalidMsg]   = useState(DEFAULT_CONFIG.errorInvalid);
  const [soldOutLabel, setSoldOutLabel] = useState(DEFAULT_CONFIG.errorSoldOut);

  // UI toggles
  const [draggedIndex,          setDraggedIndex]          = useState<number | null>(null);
  const [dragOverIndex,         setDragOverIndex]         = useState<number | null>(null);
  const [expandedFieldId,       setExpandedFieldId]       = useState<string | null>(null);
  const [iconPopoverId,         setIconPopoverId]         = useState<string | null>(null);
  const [addFieldPopoverActive, setAddFieldPopoverActive] = useState(false);
  const [addFieldTab,           setAddFieldTab]           = useState(0);
  const [openColorPicker,       setOpenColorPicker]       = useState<string | null>(null);
  const [showTemplatesModal,    setShowTemplatesModal]    = useState(false);

  // ── Derived preview strings ────────────────────────────────────────────────
  const previewFormBg     = useMemo(() => hsbaToRgbaString(formBgColor),     [formBgColor]);
  const previewFormBorder = useMemo(() => hsbaToRgbaString(formBorderColor), [formBorderColor]);
  const previewFormText   = useMemo(() => hsbaToRgbaString(formTextColor),   [formTextColor]);
  const previewFieldBg    = useMemo(() => hsbaToRgbaString(fieldBgColor),    [fieldBgColor]);
  const previewFieldBorder= useMemo(() => hsbaToRgbaString(fieldBorderColor),[fieldBorderColor]);
  const previewFieldText  = useMemo(() => hsbaToRgbaString(fieldTextColor),  [fieldTextColor]);

  // ── Build / apply ──────────────────────────────────────────────────────────

  const buildPayload = useCallback((): ApiConfig => ({
    formType,
    fields: fields.map((f) => ({
      id:        f.id,
      title:     f.title,
      type:      f.type,
      deletable: f.deletable,
      ...(f.placeholder      !== undefined && { placeholder:      f.placeholder }),
      ...(f.required         !== undefined && { required:         f.required }),
      ...(f.hideLabel        !== undefined && { hideLabel:        f.hideLabel }),
      ...(f.errorMessage     !== undefined && { errorMessage:     f.errorMessage }),
      ...(f.isSelect         !== undefined && { isSelect:         f.isSelect }),
      ...(f.showIcon         !== undefined && { showIcon:         f.showIcon }),
      ...(f.iconId           !== undefined && { iconId:           f.iconId }),
      ...(f.hidden           !== undefined && { hidden:           f.hidden }),
      ...(f.prefixText       !== undefined && { prefixText:       f.prefixText }),
      ...(f.minLength        !== undefined && { minLength:        f.minLength }),
      ...(f.maxLength        !== undefined && { maxLength:        f.maxLength }),
      ...(f.options          !== undefined && { options:          f.options.map((o) => o.value) }),
      ...(f.noneOptionLabel  !== undefined && { noneOptionLabel:  f.noneOptionLabel }),
    })),
    formBgColor:         hsbToHex(formBgColor),
    formTextColor:       hsbToHex(formTextColor),
    formBorderColor:     hsbToHex(formBorderColor),
    formBorderRadiusPx:  formBorderRadius,
    formBorderWidthPx:   formBorderWidth,
    formShadowPx:        formShadow,
    formPaddingPx,
    formTextBold,
    formTextItalic,
    fieldBgColor:        hsbToHex(fieldBgColor),
    fieldTextColor:      hsbToHex(fieldTextColor),
    fieldBorderColor:    hsbToHex(fieldBorderColor),
    fieldBorderRadiusPx: fieldBorderRadius,
    fieldFontSizePx:     formTextSize,
    textAlign:           formLabelAlign,
    hideLabels,
    showIcons,
    rtl:                 enableRtl,
    autocomplete:        !disableAutocomplete,
    stickyMobile,
    errorRequired:       requiredMsg,
    errorInvalid:        invalidMsg,
    errorSoldOut:        soldOutLabel,
    isVisible,
  }), [
    formType, fields,
    formBgColor, formTextColor, formBorderColor,
    formBorderRadius, formBorderWidth, formShadow, formPaddingPx,
    formTextBold, formTextItalic,
    fieldBgColor, fieldTextColor, fieldBorderColor, fieldBorderRadius,
    formTextSize, formLabelAlign,
    hideLabels, showIcons, enableRtl, disableAutocomplete, stickyMobile,
    requiredMsg, invalidMsg, soldOutLabel, isVisible,
  ]);

  const applyConfig = useCallback((cfg: ApiConfig): void => {
    setFormType((cfg.formType as "popup" | "embedded") ?? "popup");
    if (Array.isArray(cfg.fields) && cfg.fields.length > 0) {
      setFields(cfg.fields.map((f) => ({
        ...f,
        options: f.options?.map((v) => ({ id: crypto.randomUUID(), value: v })),
      })));
    }
    setFormBgColor(hexToHsb(cfg.formBgColor));
    setFormTextColor(hexToHsb(cfg.formTextColor));
    setFormBorderColor(hexToHsb(cfg.formBorderColor));
    setFormBorderRadius(cfg.formBorderRadiusPx);
    setFormBorderWidth(cfg.formBorderWidthPx);
    setFormShadow(cfg.formShadowPx);
    setFormPaddingPx(cfg.formPaddingPx);
    setFormTextBold(cfg.formTextBold);
    setFormTextItalic(cfg.formTextItalic);
    setFieldBgColor(hexToHsb(cfg.fieldBgColor));
    setFieldTextColor(hexToHsb(cfg.fieldTextColor));
    setFieldBorderColor(hexToHsb(cfg.fieldBorderColor));
    setFieldBorderRadius(cfg.fieldBorderRadiusPx);
    setFormTextSize(cfg.fieldFontSizePx);
    setFormLabelAlign((cfg.textAlign as "left" | "center" | "right") ?? "left");
    setHideLabels(cfg.hideLabels);
    setShowIcons(cfg.showIcons);
    setEnableRtl(cfg.rtl);
    setDisableAutocomplete(!cfg.autocomplete);
    setStickyMobile(cfg.stickyMobile);
    setRequiredMsg(cfg.errorRequired);
    setInvalidMsg(cfg.errorInvalid);
    setSoldOutLabel(cfg.errorSoldOut);
    setIsVisible(cfg.isVisible);
  }, []);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const res = await fetch("/api/cod-form-config", {
          headers: { Authorization: `Bearer ${await shopify.idToken()}` },
        });
        if (cancelled) return;
        if (res.ok) {
          const data: ApiConfig = await res.json();
          applyConfig(data);
          savedRef.current = JSON.stringify(data);
        } else if (res.status !== 404) {
          setError("Failed to load form configuration.");
        }
      } catch {
        if (!cancelled) setError("Unable to connect. Please check your connection and reload.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [shopify, applyConfig]);

  // ── Dirty tracking (debounced 150 ms) ─────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (dirtyTimerRef.current) clearTimeout(dirtyTimerRef.current);
    dirtyTimerRef.current = setTimeout(() => {
      const current = JSON.stringify(buildPayload());
      if (savedRef.current === null) {
        // New merchant (404): use current defaults as the baseline — no dirty on first load.
        savedRef.current = current;
        setDirty(false);
        return;
      }
      setDirty(current !== savedRef.current);
    }, 150);
    return () => {
      if (dirtyTimerRef.current) clearTimeout(dirtyTimerRef.current);
    };
  }, [loading, buildPayload]);

  // ── Save / discard ─────────────────────────────────────────────────────────
  const handleSave = useCallback(async (): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      const res = await fetch("/api/cod-form-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await shopify.idToken()}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data: ApiConfig = await res.json();
        savedRef.current = JSON.stringify(data);
        setDirty(false);
        shopify.toast.show("Form configuration saved");
      } else {
        const err = await res.json().catch(() => null);
        const msg = (err?.details?.[0]?.message ?? err?.error) || "Save failed. Please try again.";
        setError(msg);
      }
    } catch {
      setError("Unable to save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }, [shopify, buildPayload]);

  const handleDiscard = useCallback((): void => {
    if (savedRef.current) {
      try { applyConfig(JSON.parse(savedRef.current) as ApiConfig); } catch { /* ignore */ }
    }
    setDirty(false);
    setError(null);
  }, [applyConfig]);

  // ── Field operations ───────────────────────────────────────────────────────
  const updateField = useCallback((id: string, updates: Partial<FieldDef>): void => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const removeField = useCallback((id: string): void => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addField = useCallback((title: string, iconId?: string, extras?: Partial<FieldDef>): void => {
    setFields((prev) => [
      ...prev,
      {
        id: `field_${crypto.randomUUID()}`, title, type: "input", deletable: true,
        required: false, hidden: false, iconId: iconId ?? "text", showIcon: !!iconId,
        ...extras,
      },
    ]);
    setAddFieldPopoverActive(false);
  }, []);

  const handleDragStart = useCallback((index: number, e: React.DragEvent): void => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((index: number, e: React.DragEvent): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((targetIndex: number, e: React.DragEvent): void => {
    e.preventDefault();
    setDraggedIndex((dragged) => {
      if (dragged === null || dragged === targetIndex) return null;
      setFields((prev) => {
        const next = [...prev];
        const [item] = next.splice(dragged, 1);
        next.splice(targetIndex, 0, item!);
        return next;
      });
      return null;
    });
    setDragOverIndex(null);
  }, []);

  const handleDragEnd = useCallback((): void => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const applyShapeTemplate = useCallback((tmpl: ShapeTemplate): void => {
    setFormBorderRadius(tmpl.formBorderRadius);
    setFieldBorderRadius(tmpl.fieldBorderRadius);
    setShowTemplatesModal(false);
  }, []);

  const applyColorTemplate = useCallback((tmpl: ColorTemplate): void => {
    setFormBgColor(hexToHsb(tmpl.formBg));
    setFormBorderColor(hexToHsb(tmpl.formBorder));
    setFormTextColor(hexToHsb(tmpl.formText));
    setFieldBgColor(hexToHsb(tmpl.fieldBg));
    setFieldBorderColor(hexToHsb(tmpl.fieldBorder));
    setFieldTextColor(hexToHsb(tmpl.fieldText));
    setShowTemplatesModal(false);
  }, []);

  const toggleColorPicker = useCallback((id: string): void => {
    setOpenColorPicker((prev) => (prev === id ? null : id));
  }, []);

  const closeColorPicker = useCallback((): void => setOpenColorPicker(null), []);

  // ── Preview renderer ───────────────────────────────────────────────────────

  const renderPreviewField = useCallback((field: FieldDef): ReactElement | null => {
    switch (field.type) {
      case "header":
        return (
          <div style={{ paddingRight: "32px", marginBottom: "14px" }}>
            <p style={{
              margin: 0,
              fontWeight: formTextBold ? 800 : 700,
              fontSize: Math.max(formTextSize, 15),
              color: previewFormText,
              lineHeight: 1.35,
              fontStyle: formTextItalic ? "italic" : "normal",
            }}>
              {field.title}
            </p>
          </div>
        );

      case "cart":
        return (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "8px",
                background: "rgba(0,0,0,0.07)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.35"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.35"/>
                  <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: previewFormText }}>Example Product</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: previewFormText, opacity: 0.55 }}>Default Title</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: previewFormText }}>$29.99</span>
                <div style={{
                  display: "flex", alignItems: "center",
                  border: `1px solid ${previewFormBorder}`, borderRadius: "6px", overflow: "hidden",
                }}>
                  <button style={{ padding: "2px 8px", border: "none", background: "transparent", cursor: "default", fontSize: 13, color: previewFormText, lineHeight: 1 }}>−</button>
                  <span style={{ padding: "2px 6px", fontSize: 12, color: previewFormText, borderLeft: `1px solid ${previewFormBorder}`, borderRight: `1px solid ${previewFormBorder}` }}>1</span>
                  <button style={{ padding: "2px 8px", border: "none", background: "transparent", cursor: "default", fontSize: 13, color: previewFormText, lineHeight: 1 }}>+</button>
                </div>
              </div>
            </div>
            <div style={{ height: "1px", background: previewFormBorder, margin: "12px 0 0", opacity: 0.35 }} />
          </div>
        );

      case "summary":
        return (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: 12, color: previewFormText, opacity: 0.6 }}>Subtotal</span>
              <span style={{ fontSize: 12, color: previewFormText }}>$29.99</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: 12, color: previewFormText, opacity: 0.6 }}>Shipping</span>
              <span style={{ fontSize: 12, color: previewFormText }}>Free</span>
            </div>
            <div style={{ height: "1px", background: previewFormBorder, marginBottom: "10px", opacity: 0.35 }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: previewFormText }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: previewFormText }}>$29.99</span>
            </div>
            <div style={{ height: "1px", background: previewFormBorder, margin: "12px 0 0", opacity: 0.35 }} />
          </div>
        );

      case "shipping":
        return (
          <div style={{ marginBottom: "14px" }}>
            <p style={{ margin: "0 0 8px", fontWeight: 600, fontSize: 12, color: previewFormText }}>
              {field.title}
            </p>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px",
              border: `1.5px solid ${previewFormText}`,
              borderRadius: `${fieldBorderRadius}px`,
              cursor: "default",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: 15, height: 15, borderRadius: "50%",
                  border: `2px solid ${previewFormText}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: previewFormText }} />
                </div>
                <span style={{ fontSize: 12, color: previewFormText }}>Free Shipping</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: previewFormText }}>Free</span>
            </div>
            <div style={{ height: "1px", background: previewFormBorder, margin: "12px 0 0", opacity: 0.35 }} />
          </div>
        );

      case "input":
        if (field.hidden) return null;
        return (
          <div style={{ marginBottom: "10px" }}>
            {!hideLabels && !field.hideLabel && (
              <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: formTextBold ? 700 : 600,
                marginBottom: "4px",
                color: previewFormText,
                textAlign: formLabelAlign,
                fontStyle: formTextItalic ? "italic" : "normal",
              }}>
                {field.title}
                {field.required && <span style={{ color: "#e53e3e", marginLeft: "2px" }}>*</span>}
              </label>
            )}
            <div style={{
              display: "flex", alignItems: "stretch",
              background: previewFieldBg,
              border: `1px solid ${previewFieldBorder}`,
              borderRadius: `${fieldBorderRadius}px`,
              overflow: "hidden",
            }}>
              {showIcons && field.showIcon && field.iconId && getFormIcon(field.iconId) && (
                <div style={{
                  background: "rgba(0,0,0,0.04)", padding: "0 10px",
                  display: "flex", alignItems: "center",
                  borderRight: `1px solid ${previewFieldBorder}`, flexShrink: 0,
                }}>
                  <Icon source={getFormIcon(field.iconId)!.source} tone="subdued" />
                </div>
              )}
              {field.isSelect ? (
                <>
                  <select style={{
                    flex: 1, border: "none", padding: "9px 10px",
                    background: "transparent", color: previewFieldText,
                    fontSize: `${formTextSize}px`, outline: "none", appearance: "none",
                  }}>
                    {field.noneOptionLabel && (
                      <option value="">{field.noneOptionLabel}</option>
                    )}
                    {field.options && field.options.length > 0
                      ? field.options.map((opt) => <option key={opt.id}>{opt.value}</option>)
                      : !field.noneOptionLabel && <option>{field.placeholder ?? field.title}</option>
                    }
                  </select>
                  <div style={{ padding: "0 10px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <Icon source={ChevronDownIcon} tone="subdued" />
                  </div>
                </>
              ) : (
                <input
                  placeholder={field.placeholder ?? field.title}
                  readOnly
                  style={{
                    flex: 1, border: "none", padding: "9px 10px",
                    background: "transparent", color: previewFieldText,
                    fontSize: `${formTextSize}px`, outline: "none",
                  }}
                />
              )}
            </div>
          </div>
        );

      case "checkbox":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <div style={{
              width: 15, height: 15,
              border: `1.5px solid ${previewFormBorder}`,
              borderRadius: "3px", flexShrink: 0,
            }} />
            <span style={{ fontSize: "12px", color: previewFormText }}>{field.title}</span>
          </div>
        );

      case "submit":
        return (
          <div style={{ marginTop: "8px" }}>
            <button style={{
              width: "100%",
              background: previewFormText,
              color: previewFormBg,
              padding: "13px 20px",
              borderRadius: `${fieldBorderRadius}px`,
              border: "none",
              fontWeight: 700,
              fontSize: `${formTextSize}px`,
              cursor: "default",
              letterSpacing: "0.3px",
            }}>
              {field.title.replace("{total}", "$29.99")}
            </button>
          </div>
        );

      default:
        return null;
    }
  }, [
    formTextSize, formTextBold, formTextItalic, formLabelAlign, fieldBorderRadius,
    hideLabels, showIcons,
    previewFormBg, previewFormBorder, previewFormText,
    previewFieldBg, previewFieldBorder, previewFieldText,
  ]);

  const renderFormContent = useCallback((): ReactElement => (
    <div style={{ fontStyle: formTextItalic ? "italic" : "normal" }}>
      {fields
        .filter((f) => !f.hidden)
        .map((field) => {
          const el = renderPreviewField(field);
          return el ? <div key={field.id}>{el}</div> : null;
        })}
    </div>
  ), [fields, formTextItalic, renderPreviewField]);

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <BlockStack gap="400">
      <SaveBar id="cod-form-save-bar" open={dirty}>
        <button variant="primary" onClick={handleSave} disabled={saving} loading={saving} />
        <button onClick={handleDiscard} disabled={saving} />
      </SaveBar>

      {error && (
        <Banner tone="critical" onDismiss={() => setError(null)}>
          <Text as="p" variant="bodyMd">{error}</Text>
        </Banner>
      )}

      {!isVisible && !loading && (
        <Banner tone="warning" icon={AlertCircleIcon}>
          <Text as="p" variant="bodyMd">
            The COD form is currently hidden on your store. Enable "Show form on storefront" in Preferences to make it visible.
          </Text>
        </Banner>
      )}

      <InlineGrid
        columns={{ xs: 1, md: ["twoThirds", "oneThird"] }}
        gap="400"
        alignItems="start"
      >
        <BlockStack gap="400">

          {/* Form Type */}
          <Card padding="400">
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">Form type</Text>
              <InlineGrid columns={2} gap="300">
                {(["popup", "embedded"] as const).map((type) => (
                  <div
                    key={type}
                    onClick={() => setFormType(type)}
                    style={{
                      cursor: "pointer", borderRadius: "8px",
                      border: formType === type ? "2px solid #000000" : "1px solid #d2d5d8",
                      overflow: "hidden", display: "flex", flexDirection: "column",
                    }}
                  >
                    <div style={{
                      height: "90px",
                      backgroundColor: type === "popup" ? "#5c5f62" : "#f4f6f8",
                      backgroundImage: type === "popup"
                        ? "linear-gradient(45deg,#454749 25%,transparent 25%),linear-gradient(-45deg,#454749 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#454749 75%),linear-gradient(-45deg,transparent 75%,#454749 75%)"
                        : "none",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0,0 10px,10px -10px,-10px 0px",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "16px",
                    }}>
                      {type === "popup" ? (
                        <div style={{
                          backgroundColor: "#fff", borderRadius: "12px", padding: "8px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: "44px", height: "44px",
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="5" y="6" width="5" height="4" rx="1" stroke="#5c5f62" strokeWidth="1.5"/>
                            <rect x="13" y="7" width="6" height="2" rx="1" fill="#5c5f62"/>
                            <rect x="5" y="14" width="5" height="4" rx="1" stroke="#5c5f62" strokeWidth="1.5"/>
                            <rect x="13" y="15" width="6" height="2" rx="1" fill="#5c5f62"/>
                          </svg>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              {[0, 1].map((i) => (
                                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8c9196" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                                  <circle cx="8.5" cy="8.5" r="1.5"/>
                                  <polyline points="21 15 16 10 5 21"/>
                                </svg>
                              ))}
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              {[0, 1].map((i) => (
                                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <div style={{ height: "2px", width: "18px", background: "#8c9196", borderRadius: "1px" }} />
                                  <div style={{ height: "2px", width: "12px", background: "#8c9196", borderRadius: "1px" }} />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{
                            backgroundColor: "#fff", borderRadius: "12px", padding: "8px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "44px", height: "44px", border: "1px solid #e1e3e5",
                          }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <rect x="5" y="6" width="5" height="4" rx="1" stroke="#5c5f62" strokeWidth="1.5"/>
                              <rect x="13" y="7" width="6" height="2" rx="1" fill="#5c5f62"/>
                              <rect x="5" y="14" width="5" height="4" rx="1" stroke="#5c5f62" strokeWidth="1.5"/>
                              <rect x="13" y="15" width="6" height="2" rx="1" fill="#5c5f62"/>
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                    <div style={{ backgroundColor: "#fff", padding: "12px", textAlign: "center" }}>
                      <Text as="span" variant="bodyMd" fontWeight="bold">
                        {type === "popup" ? "Pop-up Form" : "Embedded Form"}
                      </Text>
                    </div>
                  </div>
                ))}
              </InlineGrid>
              <Text as="p" variant="bodyMd" tone="subdued">
                Form will open when the customer clicks the app's Buy Button.
              </Text>
            </BlockStack>
          </Card>

          {/* Form Fields */}
          <Card padding="0">
            <Box padding="400">
              <Text as="h2" variant="headingSm">Form Fields</Text>
            </Box>
            <Divider />
            <Box padding="200">
              {loading ? (
                <Box padding="400"><SkeletonBodyText lines={6} /></Box>
              ) : (
                <BlockStack gap="100">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={(e) => handleDragStart(index, e)}
                      onDragOver={(e) => handleDragOver(index, e)}
                      onDrop={(e) => handleDrop(index, e)}
                      onDragEnd={handleDragEnd}
                      style={{
                        opacity: draggedIndex === index ? 0.4 : 1,
                        outline: dragOverIndex === index && draggedIndex !== index
                          ? "2px solid var(--p-color-border-focus)" : "none",
                        borderRadius: "8px",
                        transition: "opacity 0.15s",
                      }}
                    >
                      <Box background="bg-surface" borderWidth="025" borderColor="border" borderRadius="200">
                        <div style={{ padding: "12px" }}>
                          <InlineStack align="space-between" blockAlign="center" wrap={false}>
                            <InlineStack gap="300" blockAlign="center" wrap={false}>
                              <div style={{ cursor: "grab", display: "flex" }}>
                                <Icon source={DragHandleIcon} tone="subdued" />
                              </div>
                              {field.iconId && getFormIcon(field.iconId) && (
                                <div style={{ background: "rgba(0,0,0,0.05)", padding: "4px", borderRadius: "4px", display: "flex" }}>
                                  <Icon source={getFormIcon(field.iconId)!.source} tone="subdued" />
                                </div>
                              )}
                              <Text as="span" variant="bodyMd" fontWeight="semibold">
                                {field.title}
                              </Text>
                              {field.hidden && (
                                <Text as="span" variant="bodySm" tone="subdued">(hidden)</Text>
                              )}
                            </InlineStack>
                            <InlineStack gap="100" wrap={false} blockAlign="center">
                              {field.type === "input" && (
                                <Button
                                  icon={expandedFieldId === field.id ? ChevronUpIcon : ChevronDownIcon}
                                  variant="plain"
                                  accessibilityLabel="Expand field settings"
                                  onClick={() => setExpandedFieldId(expandedFieldId === field.id ? null : field.id)}
                                />
                              )}
                              <Tooltip content={field.hidden ? "Show field" : "Hide field"}>
                                <Button
                                  icon={HideIcon}
                                  variant="plain"
                                  accessibilityLabel={field.hidden ? "Show field" : "Hide field"}
                                  tone={field.hidden ? "critical" : undefined}
                                  onClick={() => updateField(field.id, { hidden: !field.hidden })}
                                />
                              </Tooltip>
                              <Tooltip content={field.deletable ? "Delete field" : "Required field"}>
                                <Button
                                  icon={DeleteIcon}
                                  variant="plain"
                                  tone="critical"
                                  disabled={!field.deletable}
                                  onClick={() => removeField(field.id)}
                                  accessibilityLabel="Delete field"
                                />
                              </Tooltip>
                            </InlineStack>
                          </InlineStack>
                        </div>

                        {expandedFieldId === field.id && field.type === "input" && (
                          <div style={{ padding: "16px", borderTop: "1px solid var(--p-color-border-subdued)" }}>
                            <BlockStack gap="400">
                              <Checkbox
                                label={<span style={{ color: "var(--p-color-text-critical)" }}>Mark this field as required</span>}
                                checked={!!field.required}
                                onChange={(v) => updateField(field.id, { required: v })}
                              />
                              <Checkbox
                                label="Hide label"
                                checked={!!field.hideLabel}
                                onChange={(v) => updateField(field.id, { hideLabel: v })}
                              />
                              <TextField
                                label="Label"
                                value={field.title}
                                onChange={(v) => updateField(field.id, { title: v })}
                                autoComplete="off"
                              />
                              <TextField
                                label="Placeholder"
                                value={field.placeholder ?? ""}
                                onChange={(v) => updateField(field.id, { placeholder: v })}
                                autoComplete="off"
                              />
                              <TextField
                                label="Error message"
                                value={field.errorMessage ?? ""}
                                onChange={(v) => updateField(field.id, { errorMessage: v })}
                                autoComplete="off"
                                placeholder={requiredMsg}
                              />
                              <Checkbox
                                label="Display as a select list"
                                checked={!!field.isSelect}
                                onChange={(v) => updateField(field.id, { isSelect: v })}
                              />
                              {field.isSelect && (
                                <BlockStack gap="300">
                                  <Text as="h4" variant="headingSm">Select Options</Text>

                                  {/* None / Default option */}
                                  <Box
                                    background="bg-surface-secondary"
                                    borderWidth="025"
                                    borderColor="border"
                                    borderRadius="200"
                                    padding="300"
                                  >
                                    <BlockStack gap="200">
                                      <Checkbox
                                        label={<Text as="span" variant="bodySm" fontWeight="semibold">Include a "None / Default" option</Text>}
                                        checked={!!field.noneOptionLabel}
                                        onChange={(v) =>
                                          updateField(field.id, { noneOptionLabel: v ? "— None —" : undefined })
                                        }
                                      />
                                      {!!field.noneOptionLabel && (
                                        <TextField
                                          label="Label for the empty/default option"
                                          value={field.noneOptionLabel}
                                          autoComplete="off"
                                          placeholder="— None —"
                                          onChange={(v) => updateField(field.id, { noneOptionLabel: v })}
                                        />
                                      )}
                                    </BlockStack>
                                  </Box>

                                  {(field.options ?? []).length === 0 && (
                                    <Text as="p" variant="bodySm" tone="subdued">
                                      No options yet. Add options for customers to choose from.
                                    </Text>
                                  )}
                                  <BlockStack gap="150">
                                    {(field.options ?? []).map((opt) => (
                                      <InlineStack key={opt.id} gap="200" blockAlign="center" wrap={false}>
                                        <div style={{ flex: 1 }}>
                                          <TextField
                                            label=""
                                            labelHidden
                                            value={opt.value}
                                            placeholder="Option label"
                                            autoComplete="off"
                                            onChange={(v) => {
                                              updateField(field.id, {
                                                options: (field.options ?? []).map((o) =>
                                                  o.id === opt.id ? { ...o, value: v } : o
                                                ),
                                              });
                                            }}
                                          />
                                        </div>
                                        <Button
                                          icon={DeleteIcon}
                                          variant="plain"
                                          tone="critical"
                                          accessibilityLabel="Remove option"
                                          onClick={() => {
                                            updateField(field.id, {
                                              options: (field.options ?? []).filter((o) => o.id !== opt.id),
                                            });
                                          }}
                                        />
                                      </InlineStack>
                                    ))}
                                  </BlockStack>
                                  <div>
                                    <Button
                                      icon={PlusIcon}
                                      variant="plain"
                                      onClick={() => {
                                        updateField(field.id, {
                                          options: [...(field.options ?? []), { id: crypto.randomUUID(), value: "" }],
                                        });
                                      }}
                                    >
                                      Add option
                                    </Button>
                                  </div>
                                </BlockStack>
                              )}
                              <InlineStack gap="300" blockAlign="center">
                                <Checkbox
                                  label="Show icon"
                                  checked={!!field.showIcon}
                                  onChange={(v) => updateField(field.id, { showIcon: v })}
                                />
                                {field.showIcon && (
                                  <div style={{ maxWidth: "140px" }}>
                                    <Labelled id={`icon-picker-${field.id}`} label="">
                                      <Popover
                                        active={iconPopoverId === field.id}
                                        autofocusTarget="first-node"
                                        preferredPosition="below"
                                        preferredAlignment="left"
                                        activator={
                                          <Button
                                            fullWidth textAlign="left"
                                            icon={FORM_ICONS.find((i) => i.id === field.iconId)?.source ?? LocationIcon}
                                            disclosure={iconPopoverId === field.id ? "up" : "down"}
                                            onClick={() => setIconPopoverId(iconPopoverId === field.id ? null : field.id)}
                                          >
                                            Change icon
                                          </Button>
                                        }
                                        onClose={() => setIconPopoverId(null)}
                                      >
                                        <Box minWidth="280px" maxWidth="min(100vw - 32px, 320px)" borderRadius="300" background="bg-surface" shadow="400">
                                          <Box padding="300" background="bg-surface">
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(38px, 1fr))", gap: "4px" }}>
                                              {FORM_ICONS.map((entry) => (
                                                <div
                                                  key={entry.id}
                                                  onClick={() => { updateField(field.id, { iconId: entry.id }); setIconPopoverId(null); }}
                                                  style={{
                                                    width: "38px", height: "38px",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    borderRadius: "4px", cursor: "pointer",
                                                    background: field.iconId === entry.id ? "var(--p-color-bg-surface-active)" : "transparent",
                                                  }}
                                                >
                                                  <Icon source={entry.source} tone={field.iconId === entry.id ? "base" : "subdued"} />
                                                </div>
                                              ))}
                                            </div>
                                            <div style={{ marginTop: "12px" }}>
                                              <Button tone="critical" variant="plain" icon={DeleteIcon}
                                                onClick={() => { updateField(field.id, { showIcon: false }); setIconPopoverId(null); }}>
                                                Remove
                                              </Button>
                                            </div>
                                          </Box>
                                        </Box>
                                      </Popover>
                                    </Labelled>
                                  </div>
                                )}
                              </InlineStack>
                            </BlockStack>
                          </div>
                        )}
                      </Box>
                    </div>
                  ))}
                </BlockStack>
              )}

              <div style={{ marginTop: "16px" }}>
                <Popover
                  active={addFieldPopoverActive}
                  activator={
                    <Button fullWidth variant="primary" icon={PlusIcon}
                      onClick={() => setAddFieldPopoverActive(!addFieldPopoverActive)}>
                      Add new fields
                    </Button>
                  }
                  onClose={() => setAddFieldPopoverActive(false)}
                  autofocusTarget="first-node"
                  fullWidth
                >
                  <Box padding="0">
                    <Tabs
                      tabs={[
                        { id: "shopify-fields", content: "Shopify fields" },
                        { id: "custom-fields",  content: "Custom fields" },
                      ]}
                      selected={addFieldTab}
                      onSelect={setAddFieldTab}
                      fitted
                    >
                      <div style={{ minHeight: "300px", maxHeight: "400px", overflowY: "auto" }}>
                        <Box padding="300" background="bg-surface">
                          {addFieldTab === 0 ? (
                            <ActionList actionRole="menuitem" items={[
                              { content: "Discount Code", icon: NoteIcon,    onAction: () => addField("Discount Code", "note") },
                              { content: "Quantity",      icon: PlusIcon,    onAction: () => addField("Quantity",      "note") },
                              { content: "Last Name",     icon: ProfileIcon, onAction: () => addField("Last Name",     "profile") },
                              { content: "Email",         icon: EmailIcon,   onAction: () => addField("Email",         "email") },
                              { content: "Address 2",     icon: LocationIcon,onAction: () => addField("Address 2",     "location") },
                              { content: "Country",       icon: LocationIcon,onAction: () => addField("Country",       "location") },
                              { content: "Company",       icon: HomeIcon,    onAction: () => addField("Company",       "location") },
                              { content: "Note",          icon: NoteIcon,    onAction: () => addField("Note",          "note") },
                            ]} />
                          ) : (
                            <ActionList actionRole="menuitem" sections={[
                              { title: "Buttons", items: [
                                { content: "Shopify Checkout Button", icon: CartIcon, onAction: () => addField("Shopify Checkout Button", "note") },
                                { content: "WhatsApp Button",         icon: ChatIcon, onAction: () => addField("WhatsApp Button",         "chat") },
                                { content: "Link Button",             icon: LinkIcon, onAction: () => addField("Link Button",             "note") },
                              ]},
                              { title: "Inputs", items: [
                                { content: "Text input",       icon: TextIcon,      onAction: () => addField("Text input",       "text") },
                                { content: "Multi-line input", icon: NoteIcon,      onAction: () => addField("Multi-line input", "note") },
                                { content: "Single Choice",    icon: CheckIcon,     onAction: () => addField("Single Choice",    "note") },
                                { content: "Multiple Choices", icon: NoteIcon,      onAction: () => addField("Multiple Choices", "note") },
                                { content: "Drop-down List",   icon: CaretDownIcon, onAction: () => addField("Drop-down List",   "note", { isSelect: true, options: [] }) },
                                { content: "Date input",       icon: CalendarIcon,  onAction: () => addField("Date input",       "note") },
                                { content: "Privacy Policy",   icon: LockIcon,      onAction: () => addField("Privacy Policy",   "note") },
                              ]},
                              { title: "Content", items: [
                                { content: "Text / HTML", icon: TextIcon,  onAction: () => addField("Text / HTML", "text") },
                                { content: "Image",       icon: ImageIcon, onAction: () => addField("Image",       "note") },
                              ]},
                              { title: "Conversion", items: [
                                { content: "Urgency Countdown", icon: ClockIcon, onAction: () => addField("Urgency Countdown", "note") },
                                { content: "1-Tick Upsells",    icon: CheckIcon, onAction: () => addField("1-Tick Upsells",    "note") },
                              ]},
                            ]} />
                          )}
                        </Box>
                      </div>
                    </Tabs>
                  </Box>
                </Popover>
              </div>
            </Box>
          </Card>

          {/* Design Settings */}
          <Card padding="400">
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">Design Settings</Text>

              {/* ── Shape templates (all 6 inline) ── */}
              <Text as="h3" variant="headingSm">Shapes</Text>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
                {SHAPE_TEMPLATES.map((tmpl) => {
                  const isActive = formBorderRadius === tmpl.formBorderRadius && fieldBorderRadius === tmpl.fieldBorderRadius;
                  return (
                    <Tooltip key={tmpl.id} content={tmpl.name}>
                      <div
                        onClick={() => applyShapeTemplate(tmpl)}
                        style={{
                          cursor: "pointer",
                          borderRadius: "8px",
                          border: `2px solid ${isActive ? "#000" : "#e5e7eb"}`,
                          padding: "6px",
                          background: "#fff",
                          transition: "border-color 0.15s",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <div style={{
                          background: "#f9fafb",
                          borderRadius: `${Math.min(tmpl.formBorderRadius, 10)}px`,
                          border: "1px solid #e5e7eb",
                          padding: "5px",
                          width: "100%",
                        }}>
                          {[1, 2].map((i) => (
                            <div key={i} style={{
                              height: "10px",
                              background: "#fff",
                              border: "1px solid #d1d5db",
                              borderRadius: `${tmpl.fieldBorderRadius}px`,
                              marginBottom: i === 1 ? "4px" : 0,
                            }} />
                          ))}
                          <div style={{ height: "14px", background: "#111827", borderRadius: `${tmpl.fieldBorderRadius}px`, marginTop: "4px" }} />
                        </div>
                        <Text as="span" variant="bodySm" alignment="center">{tmpl.name}</Text>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>

              <Divider />

              {/* ── Color templates ── */}
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm">Color Templates</Text>
                <Button variant="plain" onClick={() => setShowTemplatesModal(true)}>
                  Browse advanced
                </Button>
              </InlineStack>
              <InlineStack gap="200" wrap>
                {COLOR_TEMPLATES.map((tmpl) => (
                  <Tooltip key={tmpl.id} content={tmpl.name}>
                    <div
                      onClick={() => applyColorTemplate(tmpl)}
                      style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: tmpl.formBg, border: `2px solid ${tmpl.formBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        outline: hsbToHex(formBgColor) === tmpl.formBg ? "3px solid #000" : "none",
                        outlineOffset: "2px",
                      }}
                    >
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: tmpl.formText }} />
                    </div>
                  </Tooltip>
                ))}
              </InlineStack>

              <Divider />

              <Text as="h3" variant="headingSm">Form Style</Text>
              <FormLayout>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <ColorPickerControl id="formBg"     label="Background color" color={formBgColor}     onChange={setFormBgColor}     openColorPicker={openColorPicker} onToggle={toggleColorPicker} onClose={closeColorPicker} />
                  <ColorPickerControl id="formText"   label="Text color"       color={formTextColor}   onChange={setFormTextColor}   openColorPicker={openColorPicker} onToggle={toggleColorPicker} onClose={closeColorPicker} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <ColorPickerControl id="formBorder" label="Border color"     color={formBorderColor} onChange={setFormBorderColor} openColorPicker={openColorPicker} onToggle={toggleColorPicker} onClose={closeColorPicker} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <TextField
                    label="Text size"
                    value={String(formTextSize)}
                    autoComplete="off"
                    type="number"
                    suffix="px"
                    onChange={(v) => setFormTextSize(Number(v))}
                  />
                  <Labelled id="form-style" label="Style">
                    <ButtonGroup variant="segmented" fullWidth>
                      <Button pressed={formTextBold}   onClick={() => setFormTextBold((p) => !p)}>B</Button>
                      <Button pressed={formTextItalic} onClick={() => setFormTextItalic((p) => !p)}>I</Button>
                    </ButtonGroup>
                  </Labelled>
                  <Labelled id="form-align" label="Alignment">
                    <ButtonGroup variant="segmented" fullWidth>
                      <Button icon={TextAlignLeftIcon}   pressed={formLabelAlign === "left"}   onClick={() => setFormLabelAlign("left")} />
                      <Button icon={TextAlignCenterIcon} pressed={formLabelAlign === "center"} onClick={() => setFormLabelAlign("center")} />
                      <Button icon={TextAlignRightIcon}  pressed={formLabelAlign === "right"}  onClick={() => setFormLabelAlign("right")} />
                    </ButtonGroup>
                  </Labelled>
                </div>

                <FormLayout.Group>
                  <RangeSlider
                    label="Rounded corners" value={formBorderRadius} min={0} max={32}
                    onChange={(v) => setFormBorderRadius(v as number)}
                    output suffix={`${formBorderRadius}px`}
                  />
                  <RangeSlider
                    label="Border width" value={formBorderWidth} min={0} max={8}
                    onChange={(v) => setFormBorderWidth(v as number)}
                    output suffix={`${formBorderWidth}px`}
                  />
                </FormLayout.Group>
                <FormLayout.Group>
                  <RangeSlider
                    label="Shadow" value={formShadow} min={0} max={40}
                    onChange={(v) => setFormShadow(v as number)}
                    output suffix={`${formShadow}px`}
                  />
                  <RangeSlider
                    label="Padding" value={formPaddingPx} min={8} max={48}
                    onChange={(v) => setFormPaddingPx(v as number)}
                    output suffix={`${formPaddingPx}px`}
                  />
                </FormLayout.Group>
              </FormLayout>

              <Divider />

              <Text as="h3" variant="headingSm">Field Style</Text>
              <FormLayout>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <ColorPickerControl id="fieldBg"     label="Field background"  color={fieldBgColor}     onChange={setFieldBgColor}     openColorPicker={openColorPicker} onToggle={toggleColorPicker} onClose={closeColorPicker} />
                  <ColorPickerControl id="fieldText"   label="Field text color"  color={fieldTextColor}   onChange={setFieldTextColor}   openColorPicker={openColorPicker} onToggle={toggleColorPicker} onClose={closeColorPicker} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <ColorPickerControl id="fieldBorder" label="Field border color" color={fieldBorderColor} onChange={setFieldBorderColor} openColorPicker={openColorPicker} onToggle={toggleColorPicker} onClose={closeColorPicker} />
                  <RangeSlider
                    label="Field rounded corners" value={fieldBorderRadius} min={0} max={20}
                    onChange={(v) => setFieldBorderRadius(v as number)}
                    output suffix={`${fieldBorderRadius}px`}
                  />
                </div>
              </FormLayout>
            </BlockStack>
          </Card>

          {/* Preferences */}
          <Card padding="400">
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">Preferences</Text>
              <BlockStack gap="200">
                <Checkbox label="Show form on storefront"            checked={isVisible}           onChange={setIsVisible} />
                <Checkbox label="Hide fields label"                  checked={hideLabels}           onChange={setHideLabels} />
                <Checkbox label="Show the field's icon"              checked={showIcons}            onChange={setShowIcons} />
                <Checkbox label="Enable RTL (Arabic languages)"      checked={enableRtl}            onChange={setEnableRtl} />
                <Checkbox label="Disable autocomplete"               checked={disableAutocomplete}  onChange={setDisableAutocomplete} />
                <Checkbox label="Enable sticky button (mobile only)" checked={stickyMobile}         onChange={setStickyMobile} />
              </BlockStack>
              <Divider />
              <Text as="h3" variant="headingSm">Form error messages</Text>
              <FormLayout>
                <FormLayout.Group>
                  <TextField label="Field required message" value={requiredMsg}   onChange={setRequiredMsg}   autoComplete="off" />
                  <TextField label="Field invalid message"  value={invalidMsg}    onChange={setInvalidMsg}    autoComplete="off" />
                </FormLayout.Group>
                <TextField label="Sold out label" value={soldOutLabel} onChange={setSoldOutLabel} autoComplete="off" />
              </FormLayout>
            </BlockStack>
          </Card>

          <Banner tone="info" title="Need help?">
            <BlockStack gap="100">
              <Text as="p" variant="bodyMd">
                <Link url="https://help.buyease.com/integrations/gempages" target="_blank" removeUnderline>
                  How to integrate BuyEase with GemPages
                </Link>
              </Text>
              <Text as="p" variant="bodyMd">
                <Link url="https://help.buyease.com/integrations/pagefly" target="_blank" removeUnderline>
                  How to integrate BuyEase with PageFly
                </Link>
              </Text>
              <Text as="p" variant="bodyMd">
                Add the form at a specific position using the app block in your theme editor.{" "}
                <Link url="https://help.buyease.com/app-block" target="_blank" removeUnderline>
                  Learn how
                </Link>
              </Text>
            </BlockStack>
          </Banner>
        </BlockStack>

        {/* Right column — sticky live preview */}
        <Box position="sticky" insetBlockStart="400" zIndex="400" width="100%">
          <BlockStack gap="300">
            {formType === "popup" && (
              <Card padding="400">
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingSm">Buy Button</Text>
                    {onNavigateToBuyButton && (
                      <Button variant="plain" onClick={onNavigateToBuyButton}>Customize</Button>
                    )}
                  </InlineStack>
                  <BuyButtonLivePreview />
                </BlockStack>
              </Card>
            )}

            <InlineStack align="center">
              <span style={{ borderBottom: "1px dashed var(--p-color-border-secondary)", paddingBottom: "4px" }}>
                <Text as="h3" variant="headingSm">Live preview</Text>
              </span>
            </InlineStack>

            {/* Browser chrome mockup */}
            <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #d1d5db", boxShadow: "0 2px 12px rgba(0,0,0,0.09)" }}>
              {/* Address bar */}
              <div style={{ background: "#f1f3f4", borderBottom: "1px solid #e5e7eb", padding: "7px 10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", gap: "5px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, background: "#fff", borderRadius: "4px", height: "20px", display: "flex", alignItems: "center", padding: "0 8px", border: "1px solid #d1d5db", overflow: "hidden" }}>
                  <span style={{ fontSize: "10px", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", width: "100%" }}>
                    {shopDomain || "yourstore.myshopify.com"}/products/example
                  </span>
                </div>
              </div>

              {/* Store page */}
              <div style={{
                background: "#f9fafb", position: "relative",
                ...(formType === "popup"
                  ? { height: "520px", overflow: "hidden" }
                  : { maxHeight: "560px", overflowY: "auto" }),
              }}>
                {/* Nav */}
                <div style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ height: 10, background: "#e5e7eb", borderRadius: 3, width: "28%" }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    {[30, 30, 30].map((w, i) => <div key={i} style={{ height: 8, background: "#e5e7eb", borderRadius: 3, width: w }} />)}
                  </div>
                </div>

                {/* Product */}
                <div style={{ padding: "14px 14px 10px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: 66, height: 66, background: "#e5e7eb", borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9ca3af" strokeWidth="1.5"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="#9ca3af"/>
                        <path d="M21 15L16 10L5 21" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 11, background: "#d1d5db", borderRadius: 3, width: "68%", marginBottom: 7 }} />
                      <div style={{ height: 9,  background: "#e5e7eb", borderRadius: 3, width: "42%", marginBottom: 7 }} />
                      <div style={{ height: 13, background: "#cbd5e1", borderRadius: 3, width: "26%" }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 12, height: 34, background: "#1f2937", borderRadius: 6, opacity: 0.1 }} />
                </div>

                {/* Popup overlay */}
                {formType === "popup" && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "18px 10px", overflowY: "auto", zIndex: 10 }}>
                    <div style={{
                      background: previewFormBg,
                      border: `${formBorderWidth}px solid ${previewFormBorder}`,
                      borderRadius: `${formBorderRadius}px`,
                      padding: `${formPaddingPx}px`,
                      boxShadow: formShadow > 0 ? `0 ${Math.round(formShadow / 2)}px ${formShadow * 2}px rgba(0,0,0,0.3)` : "none",
                      color: previewFormText,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontSize: `${formTextSize}px`,
                      direction: enableRtl ? "rtl" : "ltr",
                      width: "100%", position: "relative",
                    }}>
                      <button style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.07)", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "default", fontSize: "15px", color: previewFormText, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
                      {renderFormContent()}
                    </div>
                  </div>
                )}

                {/* Embedded form */}
                {formType === "embedded" && (
                  <div style={{ padding: "0 14px 14px" }}>
                    <div style={{
                      background: previewFormBg,
                      border: `${formBorderWidth}px solid ${previewFormBorder}`,
                      borderRadius: `${formBorderRadius}px`,
                      padding: `${formPaddingPx}px`,
                      boxShadow: formShadow > 0 ? `0 ${Math.round(formShadow / 2)}px ${formShadow * 2}px rgba(0,0,0,0.15)` : "none",
                      color: previewFormText,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontSize: `${formTextSize}px`,
                      direction: enableRtl ? "rtl" : "ltr",
                    }}>
                      {renderFormContent()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </BlockStack>
        </Box>
      </InlineGrid>

      {/* Templates Modal */}
      <Modal
        open={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        title="Advanced Color Templates"
        size="large"
        primaryAction={{ content: "Done", onAction: () => setShowTemplatesModal(false) }}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h3" variant="headingMd">Advanced Templates</Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Apply a complete color scheme to your form instantly. Click any template to apply it.
              </Text>
            </BlockStack>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "16px" }}>
              {COLOR_TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div
                    onClick={() => applyColorTemplate(tmpl)}
                    style={{
                      cursor: "pointer",
                      borderRadius: "10px",
                      border: `2px solid ${hsbToHex(formBgColor) === tmpl.formBg ? "#3b82f6" : "#e5e7eb"}`,
                      padding: "8px",
                      background: "#fff",
                      transition: "border-color 0.15s",
                      width: "100%",
                    }}
                  >
                    <div style={{
                      background: tmpl.formBg,
                      border: `1px solid ${tmpl.formBorder}`,
                      borderRadius: "8px",
                      padding: "12px",
                    }}>
                      <div style={{ height: "6px", background: tmpl.formText, opacity: 0.6, borderRadius: "3px", width: "60%", marginBottom: "10px" }} />
                      {[1, 2].map((i) => (
                        <div key={i} style={{
                          height: "20px",
                          background: tmpl.fieldBg,
                          border: `1px solid ${tmpl.fieldBorder}`,
                          borderRadius: "4px",
                          marginBottom: "6px",
                        }} />
                      ))}
                      <div style={{ height: "24px", background: tmpl.formText, borderRadius: "4px" }} />
                    </div>
                  </div>
                  <Text as="p" variant="bodySm" alignment="center">{tmpl.name}</Text>
                </div>
              ))}
            </div>
          </BlockStack>
        </Modal.Section>

        <Modal.Section>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h3" variant="headingMd">Premium Templates</Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                High-contrast and dark-mode themes for bold, conversion-focused designs.
              </Text>
            </BlockStack>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "16px" }}>
              {PREMIUM_COLOR_TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div
                    onClick={() => applyColorTemplate(tmpl)}
                    style={{
                      cursor: "pointer",
                      borderRadius: "10px",
                      border: `2px solid ${hsbToHex(formBgColor) === tmpl.formBg ? "#3b82f6" : "#e5e7eb"}`,
                      padding: "8px",
                      background: "#fff",
                      transition: "border-color 0.15s",
                      width: "100%",
                    }}
                  >
                    <div style={{
                      background: tmpl.formBg,
                      border: `1px solid ${tmpl.formBorder}`,
                      borderRadius: "8px",
                      padding: "12px",
                    }}>
                      <div style={{ height: "6px", background: tmpl.formText, opacity: 0.6, borderRadius: "3px", width: "60%", marginBottom: "10px" }} />
                      {[1, 2].map((i) => (
                        <div key={i} style={{
                          height: "20px",
                          background: tmpl.fieldBg,
                          border: `1px solid ${tmpl.fieldBorder}`,
                          borderRadius: "4px",
                          marginBottom: "6px",
                        }} />
                      ))}
                      <div style={{ height: "24px", background: tmpl.formText, borderRadius: "4px" }} />
                    </div>
                  </div>
                  <Text as="p" variant="bodySm" alignment="center">{tmpl.name}</Text>
                </div>
              ))}
            </div>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </BlockStack>
  );
}
