"use client";

import { useState, useEffect } from "react";
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
  Popover,
  RangeSlider,
  Tabs,
  Text,
  TextField,
  Tooltip,
  UnstyledButton,
  hsbToRgb,
  rgbaString,
} from "@shopify/polaris";
import type { HSBAColor } from "@shopify/polaris";
import { BUY_BUTTON_STORE_ICONS, getBuyButtonIconDefinition } from "@/components/form-builder/buy-button-icon-registry";
import { BuyButtonLivePreview } from "@/components/form-builder/BuyButtonLivePreview";
import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChatIcon,
  DeleteIcon,
  DragHandleIcon,
  EditIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  ViewIcon,
  LocationIcon,
  PhoneIcon,
  EmailIcon,
  NoteIcon,
  ProfileIcon,
  TextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HideIcon,
  MobileIcon,
  PlusIcon,
  HomeIcon,
  CartIcon,
  LinkIcon,
  CheckIcon,
  CaretDownIcon,
  CalendarIcon,
  LockIcon,
  ImageIcon,
  ClockIcon,
} from "@shopify/polaris-icons";

// Helper function to get context-aware icons
const getRelevantIconsForField = (fieldId: string) => {
  const normalizedId = fieldId.toLowerCase();
  if (normalizedId.includes('phone')) {
    return [
      { id: "phone", source: PhoneIcon },
      { id: "mobile", source: MobileIcon },
      { id: "chat", source: ChatIcon }
    ];
  }
  if (normalizedId.includes('name') || normalizedId.includes('profile')) {
    return [
      { id: "profile", source: ProfileIcon },
      { id: "email", source: EmailIcon },
      { id: "text", source: TextIcon }
    ];
  }
  if (normalizedId.includes('address') || normalizedId.includes('city') || normalizedId.includes('province') || normalizedId.includes('postal')) {
    return [
      { id: "location", source: LocationIcon },
      { id: "note", source: NoteIcon },
      { id: "text", source: TextIcon }
    ];
  }
  return [
    { id: "text", source: TextIcon },
    { id: "note", source: NoteIcon },
    { id: "alert", source: AlertCircleIcon }
  ];
};

const FORM_ICONS = [
  { id: "location", source: LocationIcon },
  { id: "phone", source: PhoneIcon },
  { id: "mobile", source: MobileIcon },
  { id: "chat", source: ChatIcon },
  { id: "email", source: EmailIcon },
  { id: "profile", source: ProfileIcon },
  { id: "note", source: NoteIcon },
  { id: "text", source: TextIcon },
  { id: "alert", source: AlertCircleIcon },
  { id: "view", source: ViewIcon },
  { id: "edit", source: EditIcon },
];

function getFormIcon(id: string) {
  return FORM_ICONS.find((entry) => entry.id === id);
}

// Helper to convert HSB to RGBA string
function hsbaToRgbaString(color: HSBAColor): string {
  return rgbaString(hsbToRgb(color));
}

// Pre-defined templates for quick styling
const TEMPLATES = [
  {
    id: "clean",
    name: "Clean",
    bg: "#ffffff",
    border: "#e1e3e5",
    text: "#202223",
  },
  {
    id: "dark",
    name: "Dark",
    bg: "#111213",
    border: "#303236",
    text: "#ffffff",
  },
  {
    id: "ocean",
    name: "Ocean",
    bg: "#f4f8fb",
    border: "#b4d5eb",
    text: "#005ea6",
  },
  {
    id: "rose",
    name: "Rose",
    bg: "#fdf8f8",
    border: "#f3d1d1",
    text: "#8c2a2a",
  },
];

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
};

const INITIAL_FIELDS: FieldDef[] = [
  { id: "header", title: "Please fill in the form to order", type: "header", deletable: false },
  { id: "cart", title: "Cart Content / Quantity Offers", type: "cart", deletable: false },
  { id: "summary", title: "Order summary", type: "summary", deletable: false },
  { id: "shipping", title: "Shipping options", type: "shipping", deletable: false },
  { id: "firstName", title: "First Name", type: "input", deletable: true, placeholder: "First Name", required: true, showIcon: true, iconId: "profile" },
  { id: "phone", title: "Phone", type: "input", deletable: true, placeholder: "Phone Number", required: true, showIcon: true, iconId: "phone" },
  { id: "address", title: "Address", type: "input", deletable: true, placeholder: "Street Address", required: true, showIcon: true, iconId: "location" },
  { id: "postal", title: "Postal code", type: "input", deletable: true, placeholder: "Postal Code", required: true, showIcon: true, iconId: "note" },
  { id: "province", title: "Province (State)", type: "input", deletable: true, placeholder: "State", required: true, showIcon: false, isSelect: true },
  { id: "city", title: "City", type: "input", deletable: true, placeholder: "City", required: true, showIcon: true, iconId: "location" },
  { id: "marketing", title: "Buyer accepts marketing", type: "checkbox", deletable: true },
  { id: "submit", title: "BUY IT NOW - {total}", type: "submit", deletable: false },
];

export function FormDesignerWorkspace({
  onNavigateToBuyButton,
}: {
  onNavigateToBuyButton?: () => void;
}): ReactElement {
  // Live shop domain from App Bridge
  const [shopDomain, setShopDomain] = useState("");
  useEffect(() => {
    const domain = window.shopify?.config?.shop ?? "";
    if (domain) setShopDomain(domain);
  }, []);

  // Form Type
  const [formType, setFormType] = useState<"popup" | "embedded">("popup");

  // Fields State
  const [fields, setFields] = useState<FieldDef[]>(INITIAL_FIELDS);

  // Preferences
  const [hideLabels, setHideLabels] = useState(false);
  const [showIcons, setShowIcons] = useState(true);
  const [enableRtl, setEnableRtl] = useState(false);
  const [disableAutocomplete, setDisableAutocomplete] = useState(false);
  const [stickyMobile, setStickyMobile] = useState(true);

  // Error Messages
  const [requiredMsg, setRequiredMsg] = useState("This field is required.");
  const [invalidMsg, setInvalidMsg] = useState("This field is invalid.");
  const [soldOutLabel, setSoldOutLabel] = useState("Sold Out");

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  const [iconPopoverId, setIconPopoverId] = useState<string | null>(null);
  const [addFieldPopoverActive, setAddFieldPopoverActive] = useState(false);
  const [addFieldTab, setAddFieldTab] = useState(0);

  const addField = (title: string, iconId?: string) => {
    const newField: FieldDef = {
      id: `field_${Date.now()}`,
      title,
      type: "input",
      required: false,
      hidden: false,
      deletable: true,
      iconId: iconId || "text",
      showIcon: !!iconId
    };
    setFields([...fields, newField]);
    setAddFieldPopoverActive(false);
  };

  const updateField = (id: string, updates: Partial<FieldDef>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  // Design Settings: Form Style
  const [formBgColor, setFormBgColor] = useState<HSBAColor>({ hue: 0, saturation: 0, brightness: 1, alpha: 1 });
  const [formBorderColor, setFormBorderColor] = useState<HSBAColor>({ hue: 0, saturation: 0, brightness: 0.9, alpha: 1 });
  const [formTextColor, setFormTextColor] = useState<HSBAColor>({ hue: 0, saturation: 0, brightness: 0, alpha: 1 });
  const [formTextSize, setFormTextSize] = useState(16);
  const [formBorderWidth, setFormBorderWidth] = useState(1);
  const [formBorderRadius, setFormBorderRadius] = useState(12);
  const [formShadow, setFormShadow] = useState(8);
  const [formLabelAlign, setFormLabelAlign] = useState<"left" | "center" | "right">("left");
  const [formTextBold, setFormTextBold] = useState(false);
  const [formTextItalic, setFormTextItalic] = useState(false);

  // Design Settings: Field Style
  const [fieldBgColor, setFieldBgColor] = useState<HSBAColor>({ hue: 0, saturation: 0, brightness: 1, alpha: 1 });
  const [fieldBorderColor, setFieldBorderColor] = useState<HSBAColor>({ hue: 0, saturation: 0, brightness: 0.8, alpha: 1 });
  const [fieldTextColor, setFieldTextColor] = useState<HSBAColor>({ hue: 0, saturation: 0, brightness: 0.1, alpha: 1 });
  const [fieldBorderRadius, setFieldBorderRadius] = useState(6);

  const moveField = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= fields.length) return;
    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[index + direction];
    newFields[index + direction] = temp;
    setFields(newFields);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  // Convert states to CSS values for preview
  const previewFormBg = hsbaToRgbaString(formBgColor);
  const previewFormBorder = hsbaToRgbaString(formBorderColor);
  const previewFormText = hsbaToRgbaString(formTextColor);
  
  const previewFieldBg = hsbaToRgbaString(fieldBgColor);
  const previewFieldBorder = hsbaToRgbaString(fieldBorderColor);
  const previewFieldText = hsbaToRgbaString(fieldTextColor);

  // Render each form field exactly as customers see it on the storefront
  const renderPreviewField = (field: FieldDef): ReactElement | null => {
    switch (field.type) {
      case "header":
        return (
          <div style={{ paddingRight: "32px", marginBottom: "14px" }}>
            <p style={{
              margin: 0,
              fontWeight: 700,
              fontSize: Math.max(formTextSize, 15),
              color: previewFormText,
              lineHeight: 1.35,
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
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: previewFormText }}>Product's name</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: previewFormText, opacity: 0.55 }}>Default Title</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: previewFormText }}>$19.99</span>
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
              <span style={{ fontSize: 12, color: previewFormText }}>$19.99</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: 12, color: previewFormText, opacity: 0.6 }}>Shipping</span>
              <span style={{ fontSize: 12, color: previewFormText }}>Free</span>
            </div>
            <div style={{ height: "1px", background: previewFormBorder, marginBottom: "10px", opacity: 0.35 }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: previewFormText }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: previewFormText }}>$19.99</span>
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
                display: "block", fontSize: "12px", fontWeight: 600,
                marginBottom: "4px", color: previewFormText, textAlign: formLabelAlign,
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
                    fontSize: "13px", outline: "none", appearance: "none",
                  }}>
                    <option>{field.placeholder || field.title}</option>
                  </select>
                  <div style={{ padding: "0 10px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <Icon source={ChevronDownIcon} tone="subdued" />
                  </div>
                </>
              ) : (
                <input
                  placeholder={field.placeholder || field.title}
                  readOnly
                  style={{
                    flex: 1, border: "none", padding: "9px 10px",
                    background: "transparent", color: previewFieldText,
                    fontSize: "13px", outline: "none",
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
              borderRadius: "3px", flexShrink: 0, background: "transparent",
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
              fontSize: "14px",
              cursor: "default",
              letterSpacing: "0.3px",
            }}>
              {field.title.replace("{total}", "$19.99")}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFormContent = (): ReactElement => (
    <div style={{ textAlign: formLabelAlign, fontStyle: formTextItalic ? "italic" : "normal" }}>
      {fields
        .filter((f) => !f.hidden)
        .map((field) => {
          const el = renderPreviewField(field);
          if (!el) return null;
          return <div key={field.id}>{el}</div>;
        })}
    </div>
  );

  return (
    <BlockStack gap="400">
      <Banner tone="warning" icon={AlertCircleIcon}>
        <InlineStack align="space-between" blockAlign="center">
          <Text as="p" variant="bodyMd">
            The COD form is currently disabled on your store. You can enable it anytime through the app's Visibility settings.
          </Text>
          <Button size="slim">Visibility</Button>
        </InlineStack>
      </Banner>

      <InlineGrid
        columns={{
          xs: 1,
          md: ["twoThirds", "oneThird"],
        }}
        gap="400"
        alignItems="start"
      >
        <BlockStack gap="400">
          {/* Form Type Card */}
          <Card padding="400">
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Form type
              </Text>
              <InlineGrid columns={2} gap="300">
                <div 
                  onClick={() => setFormType("popup")}
                  style={{ 
                    cursor: "pointer",
                    borderRadius: "8px",
                    border: formType === "popup" ? "2px solid #000000" : "1px solid #d2d5d8",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{
                    height: "90px",
                    backgroundColor: "#5c5f62",
                    backgroundImage: "linear-gradient(45deg, #454749 25%, transparent 25%), linear-gradient(-45deg, #454749 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #454749 75%), linear-gradient(-45deg, transparent 75%, #454749 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <div style={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "44px",
                      height: "44px"
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="6" width="5" height="4" rx="1" stroke="#5c5f62" strokeWidth="1.5"/>
                        <rect x="13" y="7" width="6" height="2" rx="1" fill="#5c5f62"/>
                        <rect x="5" y="14" width="5" height="4" rx="1" stroke="#5c5f62" strokeWidth="1.5"/>
                        <rect x="13" y="15" width="6" height="2" rx="1" fill="#5c5f62"/>
                      </svg>
                    </div>
                  </div>
                  <div style={{ backgroundColor: "#fff", padding: "12px", textAlign: "center" }}>
                    <Text as="span" variant="bodyMd" fontWeight="bold">
                      Pop-up Form
                    </Text>
                  </div>
                </div>

                <div 
                  onClick={() => setFormType("embedded")}
                  style={{ 
                    cursor: "pointer",
                    borderRadius: "8px",
                    border: formType === "embedded" ? "2px solid #000000" : "1px solid #d2d5d8",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{
                    height: "90px",
                    backgroundColor: "#f4f6f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "16px"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8c9196" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8c9196" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ height: "2px", width: "18px", background: "#8c9196", borderRadius: "1px" }}></div>
                          <div style={{ height: "2px", width: "12px", background: "#8c9196", borderRadius: "1px" }}></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ height: "2px", width: "18px", background: "#8c9196", borderRadius: "1px" }}></div>
                          <div style={{ height: "2px", width: "12px", background: "#8c9196", borderRadius: "1px" }}></div>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "44px",
                      height: "44px",
                      border: "1px solid #e1e3e5"
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="6" width="5" height="4" rx="1" stroke="#5c5f62" strokeWidth="1.5"/>
                        <rect x="13" y="7" width="6" height="2" rx="1" fill="#5c5f62"/>
                        <rect x="5" y="14" width="5" height="4" rx="1" stroke="#5c5f62" strokeWidth="1.5"/>
                        <rect x="13" y="15" width="6" height="2" rx="1" fill="#5c5f62"/>
                      </svg>
                    </div>
                  </div>
                  <div style={{ backgroundColor: "#fff", padding: "12px", textAlign: "center" }}>
                    <Text as="span" variant="bodyMd" fontWeight="bold">
                      Embedded Form
                    </Text>
                  </div>
                </div>
              </InlineGrid>
              <Text as="p" variant="bodyMd" tone="subdued">
                Form will open when the customer clicks the app's Buy Button.
              </Text>
            </BlockStack>
          </Card>

          {/* Form Fields Card */}
          <Card padding="0">
            <Box padding="400">
              <Text as="h2" variant="headingSm">
                Form Fields
              </Text>
            </Box>
            <Divider />
            <Box padding="200">
              <BlockStack gap="100">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedIndex(index);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault(); // Necessary to allow dropping
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIndex === null || draggedIndex === index) return;
                      const newFields = [...fields];
                      const draggedItem = newFields[draggedIndex];
                      newFields.splice(draggedIndex, 1);
                      newFields.splice(index, 0, draggedItem);
                      setFields(newFields);
                      setDraggedIndex(null);
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    style={{
                      opacity: draggedIndex === index ? 0.5 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <Box
                      background="bg-surface"
                      borderWidth="025"
                      borderColor="border"
                      borderRadius="200"
                    >
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
                          </InlineStack>
                          <InlineStack gap="100" wrap={false} blockAlign="center">
                            {field.type === "input" && (
                              <Button
                                icon={expandedFieldId === field.id ? ChevronUpIcon : ChevronDownIcon}
                                variant="plain"
                                accessibilityLabel="Expand field"
                                onClick={() => setExpandedFieldId(expandedFieldId === field.id ? null : field.id)}
                              />
                            )}
                            <Button
                              icon={HideIcon}
                              variant="plain"
                              accessibilityLabel="Hide field"
                              tone={field.hidden ? "critical" : undefined}
                              onClick={() => updateField(field.id, { hidden: !field.hidden })}
                            />
                            <Button
                              icon={DeleteIcon}
                              variant="plain"
                              tone="critical"
                              disabled={!field.deletable}
                              onClick={() => removeField(field.id)}
                              accessibilityLabel="Delete field"
                            />
                          </InlineStack>
                        </InlineStack>
                      </div>

                      {expandedFieldId === field.id && field.type === "input" && (
                        <div style={{ padding: "16px", borderTop: "1px solid var(--p-color-border-subdued)" }}>
                          <BlockStack gap="400">
                            <Checkbox
                              label={<span style={{ color: "var(--p-color-text-critical)" }}>Mark this field as required</span>}
                              checked={field.required}
                              onChange={(v) => updateField(field.id, { required: v })}
                            />
                            <Checkbox
                              label="Hide label"
                              checked={field.hidden}
                              onChange={(v) => updateField(field.id, { hidden: v })}
                            />
                            <TextField
                              label="Label"
                              value={field.title}
                              onChange={(v) => updateField(field.id, { title: v })}
                              autoComplete="off"
                            />
                            <TextField
                              label="Placeholder"
                              value={field.placeholder || ""}
                              onChange={(v) => updateField(field.id, { placeholder: v })}
                              autoComplete="off"
                            />
                            <TextField
                              label="Error message"
                              value={field.errorMessage || ""}
                              onChange={(v) => updateField(field.id, { errorMessage: v })}
                              autoComplete="off"
                            />
                            <Checkbox
                              label="Display as a select list"
                              checked={field.isSelect}
                              onChange={(v) => updateField(field.id, { isSelect: v })}
                            />
                            <InlineStack gap="300" blockAlign="center">
                              <Checkbox
                                label="Show icon"
                                checked={field.showIcon}
                                onChange={(v) => updateField(field.id, { showIcon: v })}
                              />
                              {field.showIcon && (
                                <div style={{ maxWidth: '140px' }}>
                                  <Labelled id={`icon-picker-${field.id}`} label="">
                                    <Popover
                                      active={iconPopoverId === field.id}
                                      autofocusTarget="first-node"
                                      preferredPosition="below"
                                      preferredAlignment="left"
                                      activator={
                                        <Button
                                          fullWidth
                                          textAlign="left"
                                          icon={field.iconId ? FORM_ICONS.find(i => i.id === field.iconId)?.source || LocationIcon : LocationIcon}
                                          disclosure={iconPopoverId === field.id ? "up" : "down"}
                                          onClick={() => setIconPopoverId(iconPopoverId === field.id ? null : field.id)}
                                        >
                                          Change icon
                                        </Button>
                                      }
                                      onClose={() => setIconPopoverId(null)}
                                    >
                                      <Box
                                        minWidth="280px"
                                        maxWidth="min(100vw - 32px, 320px)"
                                        borderRadius="300"
                                        background="bg-surface"
                                        shadow="400"
                                      >
                                        <Box padding="300" background="bg-surface">
                                          <div
                                            style={{
                                              display: "grid",
                                              gridTemplateColumns: "repeat(auto-fill, minmax(38px, 1fr))",
                                              gap: "4px",
                                            }}
                                          >
                                            {FORM_ICONS.map((entry) => (
                                              <div
                                                key={entry.id}
                                                onClick={() => {
                                                  updateField(field.id, { iconId: entry.id });
                                                  setIconPopoverId(null);
                                                }}
                                                style={{
                                                  width: "38px",
                                                  height: "38px",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  borderRadius: "4px",
                                                  cursor: "pointer",
                                                  background: field.iconId === entry.id ? "var(--p-color-bg-surface-active)" : "transparent",
                                                }}
                                              >
                                                <Icon source={entry.source} tone={field.iconId === entry.id ? "base" : "subdued"} />
                                              </div>
                                            ))}
                                          </div>
                                          <div style={{ marginTop: '12px' }}>
                                            <Button
                                              tone="critical"
                                              variant="plain"
                                              icon={DeleteIcon}
                                              onClick={() => {
                                                updateField(field.id, { showIcon: false });
                                                setIconPopoverId(null);
                                              }}
                                            >
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
              
              <div style={{ marginTop: '16px' }}>
                <Popover
                  active={addFieldPopoverActive}
                  activator={
                    <Button 
                      fullWidth 
                      variant="primary" 
                      icon={PlusIcon}
                      onClick={() => setAddFieldPopoverActive(!addFieldPopoverActive)}
                    >
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
                        { id: 'shopify-fields', content: 'Shopify fields' },
                        { id: 'custom-fields', content: 'Custom fields' }
                      ]}
                      selected={addFieldTab}
                      onSelect={setAddFieldTab}
                      fitted
                    >
                      <div
                        style={{
                          minHeight: "300px",
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        <Box padding="300" background="bg-surface">
                        {addFieldTab === 0 ? (
                          <ActionList
                            actionRole="menuitem"
                            items={[
                              { content: 'Discount Code', icon: NoteIcon, onAction: () => addField('Discount Code', 'note') },
                              { content: 'Quantity', icon: PlusIcon, onAction: () => addField('Quantity', 'note') },
                              { content: 'Last Name', icon: ProfileIcon, onAction: () => addField('Last Name', 'profile') },
                              { content: 'Email', icon: EmailIcon, onAction: () => addField('Email', 'email') },
                              { content: 'Address 2', icon: LocationIcon, onAction: () => addField('Address 2', 'location') },
                              { content: 'Country', icon: LocationIcon, onAction: () => addField('Country', 'location') },
                              { content: 'Company', icon: HomeIcon, onAction: () => addField('Company', 'location') },
                              { content: 'Note', icon: NoteIcon, onAction: () => addField('Note', 'note') },
                            ]}
                          />
                        ) : (
                          <ActionList
                            actionRole="menuitem"
                            sections={[
                              {
                                title: "Buttons",
                                items: [
                                  { content: "Shopify checkout Button", icon: CartIcon, onAction: () => addField("Shopify checkout Button", "note") },
                                  { content: "WhatsApp Button", icon: ChatIcon, onAction: () => addField("WhatsApp Button", "chat") },
                                  { content: "Link Button", icon: LinkIcon, onAction: () => addField("Link Button", "note") },
                                ],
                              },
                              {
                                title: "Inputs",
                                items: [
                                  { content: "Text input", icon: TextIcon, onAction: () => addField("Text input", "text") },
                                  { content: "Multi-line input", icon: NoteIcon, onAction: () => addField("Multi-line input", "note") },
                                  { content: "Single Choice", icon: CheckIcon, onAction: () => addField("Single Choice", "note") },
                                  { content: "Multiple Choices", icon: NoteIcon, onAction: () => addField("Multiple Choices", "note") },
                                  { content: "Drop-down List", icon: CaretDownIcon, onAction: () => addField("Drop-down List", "note") },
                                  { content: "Date input", icon: CalendarIcon, onAction: () => addField("Date input", "note") },
                                  { content: "Privacy Policy", icon: LockIcon, onAction: () => addField("Privacy Policy", "note") },
                                ],
                              },
                              {
                                title: "Content",
                                items: [
                                  { content: "Text / HTML", icon: TextIcon, onAction: () => addField("Text / HTML", "text") },
                                  { content: "Image", icon: ImageIcon, onAction: () => addField("Image", "note") },
                                ],
                              },
                              {
                                title: "Conversion",
                                items: [
                                  { content: "Urgency Countdown", icon: ClockIcon, onAction: () => addField("Urgency Countdown", "note") },
                                  { content: "1-Tick Upsells", icon: CheckIcon, onAction: () => addField("1-Tick Upsells", "note") },
                                ],
                              },
                            ]}
                          />
                        )}
                        </Box>
                      </div>
                    </Tabs>
                  </Box>
                </Popover>
              </div>
            </Box>
          </Card>

          {/* Design Settings Card */}
          <Card padding="400">
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">Design Settings</Text>
              
              <Text as="h3" variant="headingSm">Templates</Text>
              <InlineStack gap="300" wrap>
                {TEMPLATES.map((tmpl) => (
                  <Tooltip key={tmpl.id} content={tmpl.name}>
                    <div 
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: tmpl.bg,
                        border: `2px solid ${tmpl.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: tmpl.text }} />
                    </div>
                  </Tooltip>
                ))}
              </InlineStack>

              <Divider />

              <Text as="h3" variant="headingSm">Form Style</Text>
              <FormLayout>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <Labelled id="form-color" label="Background color">
                    <Popover
                      active={false}
                      activator={
                        <UnstyledButton
                          type="button"
                          accessibilityLabel="Select background color"
                          style={{
                            display: "block",
                            width: "100%",
                            cursor: "pointer",
                            padding: "var(--p-space-200) var(--p-space-300)",
                            borderRadius: "var(--p-border-radius-200)",
                            border: "var(--p-border-width-025) solid var(--p-color-input-border)",
                            background: "var(--p-color-bg-surface-secondary)",
                            color: "var(--p-color-text)",
                            font: "inherit",
                            textAlign: "left",
                          }}
                        >
                          <InlineStack gap="200" blockAlign="center">
                            <div style={{ width: "16px", height: "16px", background: previewFormBg, border: "1px solid var(--p-color-border-secondary)", borderRadius: "var(--p-border-radius-100)" }} />
                            <span>Select Color</span>
                          </InlineStack>
                        </UnstyledButton>
                      }
                      onClose={() => {}}
                    >
                      <Box padding="400">
                        <ColorPicker onChange={setFormBgColor} color={formBgColor} />
                      </Box>
                    </Popover>
                  </Labelled>
                  
                  <Labelled id="form-text-color" label="Text color">
                    <Popover
                      active={false}
                      activator={
                        <UnstyledButton
                          type="button"
                          accessibilityLabel="Select text color"
                          style={{
                            display: "block",
                            width: "100%",
                            cursor: "pointer",
                            padding: "var(--p-space-200) var(--p-space-300)",
                            borderRadius: "var(--p-border-radius-200)",
                            border: "var(--p-border-width-025) solid var(--p-color-input-border)",
                            background: "var(--p-color-bg-surface-secondary)",
                            color: "var(--p-color-text)",
                            font: "inherit",
                            textAlign: "left",
                          }}
                        >
                          <InlineStack gap="200" blockAlign="center">
                            <div style={{ width: "16px", height: "16px", background: previewFormText, border: "1px solid var(--p-color-border-secondary)", borderRadius: "var(--p-border-radius-100)" }} />
                            <span>Select Color</span>
                          </InlineStack>
                        </UnstyledButton>
                      }
                      onClose={() => {}}
                    >
                      <Box padding="400">
                        <ColorPicker onChange={setFormTextColor} color={formTextColor} />
                      </Box>
                    </Popover>
                  </Labelled>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <TextField
                    id="form-text-size"
                    label="Text size"
                    value={String(formTextSize)}
                    autoComplete="off"
                    type="number"
                    suffix="px"
                    onChange={(v) => setFormTextSize(Number(v))}
                  />
                  <Labelled id="form-style" label="Style">
                    <ButtonGroup variant="segmented" fullWidth>
                      <Button pressed={formTextBold} onClick={() => setFormTextBold(!formTextBold)}>B</Button>
                      <Button pressed={formTextItalic} onClick={() => setFormTextItalic(!formTextItalic)}>I</Button>
                    </ButtonGroup>
                  </Labelled>
                  <Labelled id="form-align" label="Alignment">
                    <ButtonGroup variant="segmented" fullWidth>
                      <Button icon={TextAlignLeftIcon} pressed={formLabelAlign === "left"} onClick={() => setFormLabelAlign("left")} />
                      <Button icon={TextAlignCenterIcon} pressed={formLabelAlign === "center"} onClick={() => setFormLabelAlign("center")} />
                    </ButtonGroup>
                  </Labelled>
                </div>
                
                <FormLayout.Group>
                  <RangeSlider
                    label="Rounded corners"
                    value={formBorderRadius}
                    min={0}
                    max={32}
                    onChange={(v) => setFormBorderRadius(v as number)}
                    output
                    suffix={`${formBorderRadius}px`}
                  />
                  <RangeSlider
                    label="Shadow"
                    value={formShadow}
                    min={0}
                    max={24}
                    onChange={(v) => setFormShadow(v as number)}
                    output
                    suffix={`${formShadow}px`}
                  />
                </FormLayout.Group>
              </FormLayout>
            </BlockStack>
          </Card>

          {/* Preferences Card */}
          <Card padding="400">
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Preferences
              </Text>
              <BlockStack gap="200">
                <Checkbox label="Hide fields label" checked={hideLabels} onChange={setHideLabels} />
                <Checkbox
                  label="Show the field's icon"
                  checked={showIcons}
                  onChange={setShowIcons}
                />
                <Checkbox
                  label="Enable RTL (Arabic Languages)"
                  checked={enableRtl}
                  onChange={setEnableRtl}
                />
                <Checkbox
                  label="Disable Autocomplete"
                  checked={disableAutocomplete}
                  onChange={setDisableAutocomplete}
                />
                <Checkbox
                  label="Enable Sticky Button (Mobile only)"
                  checked={stickyMobile}
                  onChange={setStickyMobile}
                />
              </BlockStack>
              <Divider />
              <Text as="h3" variant="headingSm">
                Form error messages
              </Text>
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    label="Field required message"
                    value={requiredMsg}
                    onChange={setRequiredMsg}
                    autoComplete="off"
                  />
                  <TextField
                    label="Field invalid message"
                    value={invalidMsg}
                    onChange={setInvalidMsg}
                    autoComplete="off"
                  />
                </FormLayout.Group>
                <TextField
                  label="Sold out label"
                  value={soldOutLabel}
                  onChange={setSoldOutLabel}
                  autoComplete="off"
                />
              </FormLayout>
            </BlockStack>
          </Card>

          <Banner tone="info" title="Need help?">
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.2rem",
                fontSize: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <li>How to integrate BuyEase with GemPages?</li>
              <li>How to integrate BuyEase with PageFly?</li>
              <li>
                You can add the form to a specific position by adding the app block using the theme
                editor. <a href="#">Add app block</a>
              </li>
            </ul>
          </Banner>
        </BlockStack>

        <Box position="sticky" insetBlockStart="400" zIndex="400" width="100%">
          <BlockStack gap="300">
            {/* Buy Button Preview — popup only */}
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
                <Text as="h3" variant="headingSm">Live preview:</Text>
              </span>
            </InlineStack>

            {/* Browser-chrome + store-page mockup */}
            <div style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #d1d5db",
              boxShadow: "0 2px 12px rgba(0,0,0,0.09)",
            }}>
              {/* Browser address bar */}
              <div style={{
                background: "#f1f3f4",
                borderBottom: "1px solid #e5e7eb",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <div style={{ display: "flex", gap: "5px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
                </div>
                <div style={{
                  flex: 1, background: "#fff", borderRadius: "4px", height: "20px",
                  display: "flex", alignItems: "center", padding: "0 8px",
                  border: "1px solid #d1d5db",
                }}>
                  <span style={{ fontSize: "10px", color: "#9ca3af" }}>{shopDomain || "yourstore.myshopify.com"}/products/example</span>
                </div>
              </div>

              {/* Simulated store page */}
              <div style={{
                background: "#f9fafb",
                position: "relative",
                ...(formType === "popup"
                  ? { height: "520px", overflow: "hidden" }
                  : { maxHeight: "560px", overflowY: "auto" }),
              }}>
                {/* Store nav strip */}
                <div style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ height: 10, background: "#e5e7eb", borderRadius: 3, width: "28%" }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ height: 8, background: "#e5e7eb", borderRadius: 3, width: 30 }} />
                    <div style={{ height: 8, background: "#e5e7eb", borderRadius: 3, width: 30 }} />
                    <div style={{ height: 8, background: "#e5e7eb", borderRadius: 3, width: 30 }} />
                  </div>
                </div>

                {/* Product section */}
                <div style={{ padding: "14px 14px 10px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    {/* Product image */}
                    <div style={{
                      width: 66, height: 66, background: "#e5e7eb", borderRadius: 8,
                      flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9ca3af" strokeWidth="1.5"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="#9ca3af"/>
                        <path d="M21 15L16 10L5 21" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    {/* Product info skeleton */}
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 11, background: "#d1d5db", borderRadius: 3, width: "68%", marginBottom: 7 }} />
                      <div style={{ height: 9, background: "#e5e7eb", borderRadius: 3, width: "42%", marginBottom: 7 }} />
                      <div style={{ height: 13, background: "#cbd5e1", borderRadius: 3, width: "26%" }} />
                    </div>
                  </div>
                  {/* Add to cart skeleton */}
                  <div style={{ marginTop: 12, height: 34, background: "#1f2937", borderRadius: 6, opacity: 0.1 }} />
                </div>

                {/* Popup: dark overlay + floating modal */}
                {formType === "popup" && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    display: "flex", alignItems: "flex-start", justifyContent: "center",
                    padding: "18px 10px",
                    overflowY: "auto",
                    zIndex: 10,
                  }}>
                    <div style={{
                      background: previewFormBg,
                      border: `${formBorderWidth}px solid ${previewFormBorder}`,
                      borderRadius: `${formBorderRadius}px`,
                      padding: "20px",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                      color: previewFormText,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontSize: `${formTextSize}px`,
                      direction: enableRtl ? "rtl" : "ltr",
                      width: "100%",
                      position: "relative",
                    }}>
                      {/* × close button */}
                      <button style={{
                        position: "absolute", top: "10px", right: "10px",
                        background: "rgba(0,0,0,0.07)", border: "none", borderRadius: "50%",
                        width: "26px", height: "26px", cursor: "default",
                        fontSize: "15px", color: previewFormText,
                        display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                      }}>×</button>
                      {renderFormContent()}
                    </div>
                  </div>
                )}

                {/* Embedded: form inline on page */}
                {formType === "embedded" && (
                  <div style={{ padding: "0 14px 14px" }}>
                    <div style={{
                      background: previewFormBg,
                      border: `${formBorderWidth}px solid ${previewFormBorder}`,
                      borderRadius: `${formBorderRadius}px`,
                      padding: "20px",
                      boxShadow: `0 4px ${Math.max(formShadow * 2, 4)}px rgba(0,0,0,${Math.min(0.18, formShadow / 100)})`,
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
    </BlockStack>
  );
}
