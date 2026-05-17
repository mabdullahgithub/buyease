"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { HSBAColor } from "@shopify/polaris";
import {
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
  InlineGrid,
  InlineStack,
  Labelled,
  Layout,
  Popover,
  RangeSlider,
  Select,
  SkeletonBodyText,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  BlankIcon,
  ChatIcon,
  DeleteIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
} from "@shopify/polaris-icons";
import { SaveBar } from "@shopify/app-bridge-react";

import { useShopifyBridge } from "@/lib/use-shopify-bridge";
import { hexToHsb, hsbToHex, hsbaToRgbaString } from "@/lib/color-utils";
import type { BuyButtonIconDefinition, BuyButtonIconId, SvgPathSpec } from "@/components/form-builder/buy-button-icon-registry";
import { BUY_BUTTON_STORE_ICONS, getBuyButtonIconDefinition } from "@/components/form-builder/buy-button-icon-registry";

const BUY_BUTTON_INSTRUCTION =
  "This is the button customers tap to open your COD form on product or cart pages. Customize the label and look here so it matches your brand. On the storefront the button uses your theme's font family.";

const FONT_MIN_PX = 12;
const FONT_MAX_PX = 28;

const ANIMATION_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Left/Right Shaking", value: "shake-lr" },
  { label: "Up/Down Shaking", value: "shake-ud" },
  { label: "Bottom Shaking", value: "shake-bottom" },
  { label: "Pulse", value: "pulse" },
  { label: "Bounce", value: "bounce" },
  { label: "Fanfare", value: "fanfare" },
];

const STICKY_POSITION_OPTIONS = [
  { label: "Bottom", value: "bottom" },
  { label: "Top", value: "top" },
  { label: "Off (inline only)", value: "off" },
];

const ICON_VIEWBOX = 20;


const PREVIEW_LABEL_MAX_LINES = 8;
const PREVIEW_SUBTITLE_MAX_LINES = 4;
const PREVIEW_CHAR_WIDTH_RATIO = 0.52;

function estimateTextWidthPx(text: string, fontSizePx: number): number {
  return text.length * fontSizePx * PREVIEW_CHAR_WIDTH_RATIO;
}

function ellipsizeLastLine(lines: string[], maxLines: number): string[] {
  const clipped = lines.slice(0, maxLines);
  if (clipped.length === 0) {
    return ["…"];
  }
  const idx = clipped.length - 1;
  let tail = clipped[idx]!;
  if (!tail.endsWith("…")) {
    tail = tail.length > 1 ? `${tail.slice(0, Math.max(0, tail.length - 1))}…` : "…";
  }
  clipped[idx] = tail;
  return clipped;
}

function wrapTextToLines(
  raw: string,
  maxWidthPx: number,
  fontSizePx: number,
  maxLines: number,
  emptyFallback: string,
): string[] {
  if (maxWidthPx <= fontSizePx * 0.5) {
    return [raw.trim().length > 0 ? raw.trim() : emptyFallback];
  }

  const source = raw.trim().length > 0 ? raw.trim() : emptyFallback;

  const breakLongWord = (word: string): string[] => {
    const parts: string[] = [];
    let rest = word;
    while (rest.length > 0) {
      if (estimateTextWidthPx(rest, fontSizePx) <= maxWidthPx) {
        parts.push(rest);
        break;
      }
      let low = 1;
      let high = rest.length;
      let fit = 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (estimateTextWidthPx(rest.slice(0, mid), fontSizePx) <= maxWidthPx) {
          fit = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      fit = Math.max(1, fit);
      parts.push(rest.slice(0, fit));
      rest = rest.slice(fit);
    }
    return parts;
  };

  const words = source.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let line = "";

  const flushLine = (): void => {
    if (line.length > 0) {
      out.push(line);
      line = "";
    }
  };

  for (const word of words) {
    const chunks =
      estimateTextWidthPx(word, fontSizePx) <= maxWidthPx ? [word] : breakLongWord(word);
    for (const chunk of chunks) {
      if (out.length >= maxLines) {
        return ellipsizeLastLine(out, maxLines);
      }
      const candidate = line.length === 0 ? chunk : `${line} ${chunk}`;
      if (line.length === 0 || estimateTextWidthPx(candidate, fontSizePx) <= maxWidthPx) {
        line = candidate;
      } else {
        flushLine();
        if (out.length >= maxLines) {
          return ellipsizeLastLine(out, maxLines);
        }
        line = chunk;
      }
    }
  }
  flushLine();

  if (out.length === 0) {
    return [emptyFallback];
  }
  if (out.length > maxLines) {
    return ellipsizeLastLine(out, maxLines);
  }
  return out;
}

function clampFontSizePx(value: number): number {
  return Math.min(FONT_MAX_PX, Math.max(FONT_MIN_PX, Math.round(value)));
}

const PRODUCT_PREVIEW_VIEW_WIDTH = 400;
const PRODUCT_PREVIEW_SIDE_PAD = 16;
const PREVIEW_LABEL_FALLBACK = "Buy with Cash on Delivery";

type IconTextAlign = "start" | "end";

export type BuyButtonPreviewSvgProps = {
  filterId: string;
  label: string;
  subtitle: string;
  previewPaths: readonly SvgPathSpec[] | undefined;
  iconAlign: IconTextAlign;
  animation: string;
  bg: HSBAColor;
  fg: HSBAColor;
  border: HSBAColor;
  fontSizePx: number;
  borderRadiusPx: number;
  borderWidthPx: number;
  shadowStrength: number;
  widthPercent?: number;
  fontBold: boolean;
  fontItalic: boolean;
  cropToButton?: boolean;
};

function PreviewMotionWrapper({
  animation,
  children,
}: {
  animation: string;
  children: ReactNode;
}): ReactElement {
  if (animation === "none") {
    return <g>{children}</g>;
  }

  if (animation === "shake-lr") {
    return (
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; -4 0; 4 0; -3 0; 3 0; 0 0"
          dur="0.65s"
          repeatCount="indefinite"
        />
        {children}
      </g>
    );
  }

  if (animation === "shake-ud") {
    return (
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -4; 0 4; 0 -3; 0 3; 0 0"
          dur="0.65s"
          repeatCount="indefinite"
        />
        {children}
      </g>
    );
  }

  if (animation === "shake-bottom") {
    return (
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 4; 0 1; 0 5; 0 0"
          dur="0.55s"
          repeatCount="indefinite"
        />
        {children}
      </g>
    );
  }

  if (animation === "pulse") {
    return (
      <g>
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1; 1.03; 1; 0.98; 1"
          dur="1.5s"
          repeatCount="indefinite"
        />
        {children}
      </g>
    );
  }

  if (animation === "bounce") {
    return (
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -8; 0 0; 0 -4; 0 0"
          dur="1.1s"
          repeatCount="indefinite"
        />
        {children}
      </g>
    );
  }

  if (animation === "fanfare") {
    return (
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 4 0; -4 0; 3 0; -3 0; 0 0"
          dur="1.15s"
          repeatCount="indefinite"
        />
        {children}
      </g>
    );
  }

  return <g>{children}</g>;
}

export function BuyButtonPreviewSvg({
  filterId,
  label,
  subtitle,
  previewPaths,
  iconAlign,
  animation,
  bg,
  fg,
  border,
  fontSizePx,
  borderRadiusPx,
  borderWidthPx,
  shadowStrength,
  widthPercent = 100,
  fontBold,
  fontItalic,
  cropToButton = false,
}: BuyButtonPreviewSvgProps): ReactElement {
  const bgFill = hsbaToRgbaString(bg);
  const textFill = hsbaToRgbaString(fg);
  const borderStroke = hsbaToRgbaString(border);

  const iconGap = 8;
  const hasIcon = Boolean(previewPaths && previewPaths.length > 0);
  const iconSize = hasIcon ? Math.min(28, Math.round(fontSizePx * 1.3)) : 0;
  const iconSlot = hasIcon ? iconSize + iconGap : 0;

  const padX = Math.round(fontSizePx * 0.75);
  const padY = Math.round(fontSizePx * 0.55);
  const subFontSize = Math.max(11, Math.round(fontSizePx * 0.78));
  const lineGap = 6;

  const containerWidth = PRODUCT_PREVIEW_VIEW_WIDTH - PRODUCT_PREVIEW_SIDE_PAD * 2;
  const widthScale = Math.max(40, Math.min(100, widthPercent)) / 100;
  const btnWidth = Math.round(containerWidth * widthScale);
  const innerContentWidth = Math.max(8, btnWidth - padX * 2);

  const subtitleTrim = subtitle.trim();
  const hasSubtitle = subtitleTrim.length > 0;

  const titleColumnWidth = Math.max(8, innerContentWidth - (hasIcon ? iconSlot : 0));

  const labelLines = wrapTextToLines(
    label.trim().length > 0 ? label : PREVIEW_LABEL_FALLBACK,
    titleColumnWidth,
    fontSizePx,
    PREVIEW_LABEL_MAX_LINES,
    PREVIEW_LABEL_FALLBACK,
  );
  const subtitleLines = hasSubtitle
    ? wrapTextToLines(subtitleTrim, innerContentWidth, subFontSize, PREVIEW_SUBTITLE_MAX_LINES, subtitleTrim)
    : [];

  const titleLineWidthsPx = labelLines.map((ln) => estimateTextWidthPx(ln, fontSizePx));
  const widestTitlePx = Math.max(...titleLineWidthsPx, fontSizePx);
  const TITLE_CAP_ASCENT = 0.72;
  const TITLE_BASE_DESCENT = 0.24;

  const titleLineAdvance = Math.round(fontSizePx * 1.2);
  const subtitleLineAdvance = Math.round(subFontSize * 1.2);

  const titleBlockH = Math.max(0, labelLines.length - 1) * titleLineAdvance + fontSizePx;
  const subtitleBlockH =
    subtitleLines.length > 0
      ? lineGap + Math.max(0, subtitleLines.length - 1) * subtitleLineAdvance + subFontSize
      : 0;
  const totalTextH = titleBlockH + subtitleBlockH;
  const btnHeight = Math.max(52, totalTextH + padY * 2);

  const blockStartY = (btnHeight - totalTextH) / 2;
  const firstTitleBaseline = Math.round(blockStartY + fontSizePx * TITLE_CAP_ASCENT);
  const lastTitleBaseline = firstTitleBaseline + Math.max(0, labelLines.length - 1) * titleLineAdvance;

  const firstSubtitleBaseline =
    subtitleLines.length > 0 ? lastTitleBaseline + lineGap + Math.round(subFontSize * TITLE_CAP_ASCENT) : 0;

  const titleInkTopY = firstTitleBaseline - TITLE_CAP_ASCENT * fontSizePx;
  const titleInkBottomY = lastTitleBaseline + TITLE_BASE_DESCENT * fontSizePx;
  const titleVisualMidY = (titleInkTopY + titleInkBottomY) / 2;

  let iconX = 0;
  let iconY = 0;
  const labelX = btnWidth / 2;
  const labelAnchor: "start" | "middle" = "middle";

  if (hasIcon && previewPaths) {
    iconY = titleVisualMidY - iconSize / 2;
    const halfTextPx = Math.min(titleColumnWidth / 2, widestTitlePx / 2);
    if (iconAlign === "start") {
      iconX = Math.max(padX, btnWidth / 2 - halfTextPx - iconGap - iconSize);
    } else {
      iconX = Math.min(btnWidth - padX - iconSize, btnWidth / 2 + halfTextPx + iconGap);
    }
  }

  const viewHeight = btnHeight + 16;
  const blur = Math.min(14, Math.max(0, shadowStrength / 2));
  // Centre the (possibly narrower) button within the preview frame so
  // widthPercent < 100 visibly shrinks toward the middle, matching the
  // storefront where margin: 0 auto centres the button.
  const originX = PRODUCT_PREVIEW_SIDE_PAD + (containerWidth - btnWidth) / 2;
  const originY = 8;

  const viewBoxRect = cropToButton
    ? `${originX} ${originY} ${btnWidth} ${btnHeight}`
    : `0 0 ${PRODUCT_PREVIEW_VIEW_WIDTH} ${viewHeight}`;

  const fontWeightAttr = fontBold ? "700" : "600";
  const fontStyleAttr = fontItalic ? "italic" : "normal";
  const iconScale = iconSize / ICON_VIEWBOX;

  const titleTspanElements = labelLines.map((titleLine, lineIndex) => (
    <tspan
      key={`buy-btn-title-line-${lineIndex}`}
      x={labelX}
      dy={lineIndex === 0 ? "0em" : `${titleLineAdvance}px`}
    >
      {titleLine}
    </tspan>
  ));

  const subtitleTspanElements = subtitleLines.map((subLine, lineIndex) => (
    <tspan
      key={`buy-btn-sub-line-${lineIndex}`}
      x={btnWidth / 2}
      dy={lineIndex === 0 ? "0em" : `${subtitleLineAdvance}px`}
    >
      {subLine}
    </tspan>
  ));

  const buttonInner = (
    <g transform={`translate(${originX}, ${originY})`}>
      <rect
        x={0}
        y={0}
        width={btnWidth}
        height={btnHeight}
        rx={borderRadiusPx}
        ry={borderRadiusPx}
        fill={bgFill}
        stroke={borderStroke}
        strokeWidth={borderWidthPx}
        filter={shadowStrength > 0 ? `url(#${filterId})` : undefined}
      />
      {hasIcon && previewPaths ? (
        <g
          transform={`translate(${iconX}, ${iconY}) scale(${iconScale})`}
          style={{ shapeRendering: "geometricPrecision" }}
        >
          {previewPaths.map((spec, index) => (
            <path
              key={`icon-path-${index}`}
              d={spec.d}
              fill={textFill}
              fillRule={spec.fillRule}
            />
          ))}
        </g>
      ) : null}
      <text
        x={labelX}
        y={firstTitleBaseline}
        textAnchor={labelAnchor}
        dominantBaseline="alphabetic"
        fill={textFill}
        fontSize={fontSizePx}
        fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
        fontWeight={fontWeightAttr}
        fontStyle={fontStyleAttr}
      >
        {titleTspanElements}
      </text>
      {subtitleLines.length > 0 ? (
        <text
          x={btnWidth / 2}
          y={firstSubtitleBaseline}
          textAnchor="middle"
          dominantBaseline="alphabetic"
          fill={textFill}
          fontSize={subFontSize}
          fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
          fontWeight={fontBold ? "600" : "500"}
          fontStyle={fontItalic ? "italic" : "normal"}
          opacity={0.92}
        >
          {subtitleTspanElements}
        </text>
      ) : null}
    </g>
  );

  return (
    <svg
      viewBox={viewBoxRect}
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"
      role="img"
      aria-label="Preview of the COD buy button"
    >
      <title>Buy button preview</title>
      <defs>
        <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={blur} result="blur" />
          <feOffset in="blur" dy={Math.min(6, blur / 2)} result="offsetBlur" />
          <feMerge>
            <feMergeNode in="offsetBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <PreviewMotionWrapper animation={animation}>{buttonInner}</PreviewMotionWrapper>
    </svg>
  );
}

type BuyButtonIconSwatchProps = {
  entry: BuyButtonIconDefinition;
  selected: boolean;
  onSelect: () => void;
};

function BuyButtonIconSwatch({
  entry,
  selected,
  onSelect,
}: BuyButtonIconSwatchProps): ReactElement {
  return (
    <Button
      icon={entry.source}
      pressed={selected}
      onClick={onSelect}
      accessibilityLabel={entry.label}
    />
  );
}

type BuyButtonConfig = {
  buttonText: string;
  buttonSubtitle: string | null;
  iconId: string;
  iconAlign: string;
  showIcon: boolean;
  animation: string;
  stickyPosition: string;
  stickyMobile: boolean;
  mobileFullWidth: boolean;
  bgColor: string;
  textColor: string;
  borderColor: string;
  fontSizePx: number;
  borderRadiusPx: number;
  borderWidthPx: number;
  shadowStrength: number;
  widthPercent: number;
  isBold: boolean;
  isItalic: boolean;
  isVisible: boolean;
  updatedAt?: string;
};

const DEFAULT_BUY_BUTTON_CONFIG: BuyButtonConfig = {
  buttonText: "Order via COD",
  buttonSubtitle: null,
  iconId: "cart",
  iconAlign: "start",
  showIcon: true,
  animation: "none",
  stickyPosition: "off",
  stickyMobile: true,
  mobileFullWidth: false,
  bgColor: "#000000",
  textColor: "#FFFFFF",
  borderColor: "#000000",
  fontSizePx: 16,
  borderRadiusPx: 8,
  borderWidthPx: 0,
  shadowStrength: 0,
  widthPercent: 100,
  isBold: false,
  isItalic: false,
  isVisible: true,
};


export function BuyButtonDesignerWorkspace(): ReactElement {
  const previewFilterId = useId().replace(/:/g, "");
  const shopify = useShopifyBridge();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [infoDismissed, setInfoDismissed] = useState(false);

  const [buttonText, setButtonText] = useState(DEFAULT_BUY_BUTTON_CONFIG.buttonText);
  const [buttonSubtitle, setButtonSubtitle] = useState(DEFAULT_BUY_BUTTON_CONFIG.buttonSubtitle ?? "");
  const [animation, setAnimation] = useState(DEFAULT_BUY_BUTTON_CONFIG.animation);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [buttonIconId, setButtonIconId] = useState<BuyButtonIconId>(DEFAULT_BUY_BUTTON_CONFIG.iconId as BuyButtonIconId);
  const [iconAlign, setIconAlign] = useState<IconTextAlign>(DEFAULT_BUY_BUTTON_CONFIG.iconAlign as IconTextAlign);
  const [showIcon, setShowIcon] = useState(DEFAULT_BUY_BUTTON_CONFIG.showIcon);
  const [textBold, setTextBold] = useState(DEFAULT_BUY_BUTTON_CONFIG.isBold);
  const [textItalic, setTextItalic] = useState(DEFAULT_BUY_BUTTON_CONFIG.isItalic);
  const [stickyPosition, setStickyPosition] = useState(DEFAULT_BUY_BUTTON_CONFIG.stickyPosition);
  const [stickyMobile, setStickyMobile] = useState(DEFAULT_BUY_BUTTON_CONFIG.stickyMobile);
  const [mobileFullWidth, setMobileFullWidth] = useState(DEFAULT_BUY_BUTTON_CONFIG.mobileFullWidth);
  const [isVisible, setIsVisible] = useState(DEFAULT_BUY_BUTTON_CONFIG.isVisible);

  const [bgColor, setBgColor] = useState<HSBAColor>(hexToHsb(DEFAULT_BUY_BUTTON_CONFIG.bgColor));
  const [textColor, setTextColor] = useState<HSBAColor>(hexToHsb(DEFAULT_BUY_BUTTON_CONFIG.textColor));
  const [borderColor, setBorderColor] = useState<HSBAColor>(hexToHsb(DEFAULT_BUY_BUTTON_CONFIG.borderColor));

  const [fontSizePx, setFontSizePx] = useState(DEFAULT_BUY_BUTTON_CONFIG.fontSizePx);
  const [borderRadiusPx, setBorderRadiusPx] = useState(DEFAULT_BUY_BUTTON_CONFIG.borderRadiusPx);
  const [borderWidthPx, setBorderWidthPx] = useState(DEFAULT_BUY_BUTTON_CONFIG.borderWidthPx);
  const [shadowStrength, setShadowStrength] = useState(DEFAULT_BUY_BUTTON_CONFIG.shadowStrength);
  const [widthPercent, setWidthPercent] = useState(DEFAULT_BUY_BUTTON_CONFIG.widthPercent);

  const savedConfigRef = useRef<BuyButtonConfig | null>(null);
  const updatedAtRef   = useRef<string | null>(null);

  const activeIcon = useMemo(() => getBuyButtonIconDefinition(buttonIconId), [buttonIconId]);
  const previewPaths = useMemo(() => {
    if (!showIcon) return undefined;
    return activeIcon?.previewPaths;
  }, [activeIcon, showIcon]);

  const applyConfigToState = useCallback((config: BuyButtonConfig): void => {
    setButtonText(config.buttonText);
    setButtonSubtitle(config.buttonSubtitle ?? "");
    setAnimation(config.animation);
    setButtonIconId((config.iconId || "none") as BuyButtonIconId);
    setIconAlign((config.iconAlign || "start") as IconTextAlign);
    setShowIcon(config.showIcon);
    setTextBold(config.isBold);
    setTextItalic(config.isItalic);
    setStickyPosition(config.stickyPosition);
    setStickyMobile(config.stickyMobile);
    setMobileFullWidth(config.mobileFullWidth);
    setIsVisible(config.isVisible);
    setBgColor(hexToHsb(config.bgColor));
    setTextColor(hexToHsb(config.textColor));
    setBorderColor(hexToHsb(config.borderColor));
    setFontSizePx(config.fontSizePx);
    setBorderRadiusPx(config.borderRadiusPx);
    setBorderWidthPx(config.borderWidthPx);
    setShadowStrength(config.shadowStrength);
    setWidthPercent(config.widthPercent ?? 100);
  }, []);

  const populateFromConfig = useCallback((config: BuyButtonConfig): void => {
    applyConfigToState(config);
    // Store updatedAt separately so it doesn't affect dirty comparison,
    // which compares savedConfigRef against buildPayload() (no updatedAt).
    updatedAtRef.current = config.updatedAt ?? null;
    const { updatedAt: _at, ...configData } = config;
    savedConfigRef.current = configData as BuyButtonConfig;
  }, [applyConfigToState]);

  const buildPayload = useCallback((): BuyButtonConfig => {
    return {
      buttonText: buttonText.trim() || "Order via COD",
      buttonSubtitle: buttonSubtitle.trim() || null,
      iconId: buttonIconId,
      iconAlign,
      showIcon,
      animation,
      stickyPosition,
      stickyMobile,
      mobileFullWidth,
      bgColor: hsbToHex(bgColor),
      textColor: hsbToHex(textColor),
      borderColor: hsbToHex(borderColor),
      fontSizePx,
      borderRadiusPx,
      borderWidthPx,
      shadowStrength,
      widthPercent,
      isBold: textBold,
      isItalic: textItalic,
      isVisible,
    };
  }, [
    buttonText, buttonSubtitle, buttonIconId, iconAlign, showIcon,
    animation, stickyPosition, stickyMobile, mobileFullWidth, bgColor,
    textColor, borderColor, fontSizePx, borderRadiusPx, borderWidthPx,
    shadowStrength, widthPercent, textBold, textItalic, isVisible,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function fetchConfig(): Promise<void> {
      try {
        const response = await fetch("/api/buy-button-config", {
          headers: {
            Authorization: `Bearer ${await shopify.idToken()}`,
          },
        });

        if (cancelled) return;

        if (response.ok) {
          const data: BuyButtonConfig = await response.json();
          populateFromConfig(data);
        } else if (response.status === 404) {
          savedConfigRef.current = null;
        } else {
          setError("Failed to load button configuration.");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to connect. Please check your connection and reload.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchConfig();
    return () => { cancelled = true; };
  }, [shopify, populateFromConfig]);

  useEffect(() => {
    if (loading) return;
    const current = buildPayload();
    const saved = savedConfigRef.current;
    if (!saved) {
      setDirty(true);
      return;
    }
    const isDirty = JSON.stringify(current) !== JSON.stringify(saved);
    setDirty(isDirty);
  }, [
    loading, buildPayload,
  ]);

  const handleSave = useCallback(async (): Promise<void> => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/buy-button-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await shopify.idToken()}`,
        },
        body: JSON.stringify({
          ...buildPayload(),
          ...(updatedAtRef.current ? { clientUpdatedAt: updatedAtRef.current } : {}),
        }),
      });

      if (response.ok) {
        const data: BuyButtonConfig = await response.json();
        updatedAtRef.current = data.updatedAt ?? null;
        const { updatedAt: _at, ...configData } = data;
        savedConfigRef.current = configData as BuyButtonConfig;
        setDirty(false);
        shopify.toast.show("Changes saved successfully");
      } else if (response.status === 409) {
        const err = await response.json().catch(() => null);
        setError(err?.error ?? "Your configuration was updated in another session. Refresh the page to get the latest version.");
      } else {
        const err = await response.json().catch(() => null);
        const msg = err?.details?.[0]?.message ?? err?.error ?? "Save failed. Please try again.";
        setError(msg);
      }
    } catch {
      setError("Unable to save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }, [shopify, buildPayload]);

  const handleDiscard = useCallback((): void => {
    if (savedConfigRef.current) {
      applyConfigToState(savedConfigRef.current);
    }
    setDirty(false);
    setError(null);
  }, [applyConfigToState]);

  const handleResetToDefault = useCallback((): void => {
    applyConfigToState(DEFAULT_BUY_BUTTON_CONFIG);
    setError(null);
  }, [applyConfigToState]);

  const handleFontSizeChange = useCallback((value: string): void => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    setFontSizePx(clampFontSizePx(parsed));
  }, []);

  const handleBorderRadiusChange = useCallback((value: number | [number, number]): void => {
    if (typeof value === "number") setBorderRadiusPx(value);
  }, []);

  const handleBorderWidthChange = useCallback((value: number | [number, number]): void => {
    if (typeof value === "number") setBorderWidthPx(value);
  }, []);

  const handleShadowChange = useCallback((value: number | [number, number]): void => {
    if (typeof value === "number") setShadowStrength(value);
  }, []);

  const handleWidthChange = useCallback((value: number | [number, number]): void => {
    if (typeof value === "number") setWidthPercent(value);
  }, []);

  const iconActivatorSource = activeIcon?.source;

  if (loading) {
    return (
      <BlockStack gap="400">
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Card padding="400">
                <BlockStack gap="300">
                  <SkeletonBodyText lines={3} />
                </BlockStack>
              </Card>
              <Card padding="400">
                <BlockStack gap="300">
                  <SkeletonBodyText lines={5} />
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card padding="400">
              <BlockStack gap="300">
                <SkeletonBodyText lines={1} />
                <Box background="bg-surface-secondary" borderRadius="300" padding="400" minHeight="300px">
                  <BlockStack gap="300">
                    <SkeletonBodyText lines={4} />
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    );
  }

  return (
    <BlockStack gap="400">
      <SaveBar id="buy-button-save-bar" open={dirty}>
        <button variant="primary" onClick={handleSave} disabled={saving} loading={saving} />
        <button onClick={handleDiscard} disabled={saving} />
      </SaveBar>

      {error ? (
        <Banner tone="critical" onDismiss={() => setError(null)}>
          <Text as="p" variant="bodyMd">{error}</Text>
        </Banner>
      ) : null}

      {!infoDismissed ? (
        <Banner tone="info" onDismiss={() => setInfoDismissed(true)}>
          <Text as="p" variant="bodyMd">
            {BUY_BUTTON_INSTRUCTION}
          </Text>
        </Banner>
      ) : null}

      <InlineGrid
        columns={{
          xs: 1,
          md: ["twoThirds", "oneThird"],
        }}
        gap="400"
        alignItems="start"
      >
        <Card roundedAbove="sm">
          <BlockStack gap="500">
            <FormLayout>
              <Checkbox
                label="Show buy button on storefront"
                checked={isVisible}
                onChange={setIsVisible}
              />

              <FormLayout.Group>
                <TextField
                  id="buy-button-label"
                  label="Button text"
                  value={buttonText}
                  onChange={setButtonText}
                  autoComplete="off"
                  maxLength={100}
                  showCharacterCount
                />
                <TextField
                  id="buy-button-subtitle"
                  label="Button subtitle"
                  value={buttonSubtitle}
                  onChange={setButtonSubtitle}
                  autoComplete="off"
                  placeholder="Optional"
                  maxLength={200}
                />
              </FormLayout.Group>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "var(--p-space-300)",
                  alignItems: "start",
                }}
              >
                <TextField
                  id="buy-button-text-size"
                  label="Text size"
                  value={String(fontSizePx)}
                  autoComplete="off"
                  type="number"
                  min={FONT_MIN_PX}
                  max={FONT_MAX_PX}
                  step={1}
                  suffix="px"
                  onChange={handleFontSizeChange}
                />

                <Labelled id="buy-button-style" label="Style">
                  <ButtonGroup variant="segmented" fullWidth>
                    <Button
                      pressed={textBold}
                      onClick={() => setTextBold((p) => !p)}
                      accessibilityLabel="Bold"
                    >
                      B
                    </Button>
                    <Button
                      pressed={textItalic}
                      onClick={() => setTextItalic((p) => !p)}
                      accessibilityLabel="Italic"
                    >
                      I
                    </Button>
                  </ButtonGroup>
                </Labelled>

                <Labelled id="buy-button-icon" label="Button icon">
                  <Popover
                    active={iconPickerOpen}
                    autofocusTarget="first-node"
                    preferredPosition="below"
                    preferredAlignment="left"
                    activator={
                      <Button
                        fullWidth
                        textAlign="left"
                        icon={iconActivatorSource ?? BlankIcon}
                        disclosure={iconPickerOpen ? "up" : "down"}
                        onClick={() => setIconPickerOpen((active) => !active)}
                      >
                        Change icon
                      </Button>
                    }
                    onClose={() => setIconPickerOpen(false)}
                  >
                    <Box
                      minWidth="380px"
                      maxWidth="min(100vw - 32px, 460px)"
                      borderRadius="300"
                      background="bg-surface"
                      shadow="400"
                    >
                      <Box paddingInline="300" paddingBlockStart="300" paddingBlockEnd="200">
                        <InlineStack align="space-between" blockAlign="center" wrap={false} gap="200">
                          <ButtonGroup variant="segmented">
                            <Button
                              pressed={iconAlign === "start"}
                              icon={TextAlignLeftIcon}
                              accessibilityLabel="Icon before text"
                              onClick={() => setIconAlign("start")}
                            />
                            <Button
                              pressed={iconAlign === "end"}
                              icon={TextAlignRightIcon}
                              accessibilityLabel="Icon after text"
                              onClick={() => setIconAlign("end")}
                            />
                          </ButtonGroup>
                          <Button
                            tone="critical"
                            variant="plain"
                            icon={DeleteIcon}
                            onClick={() => {
                              setButtonIconId("none");
                              setShowIcon(false);
                              setIconPickerOpen(false);
                            }}
                          >
                            Remove
                          </Button>
                        </InlineStack>
                      </Box>
                      <Divider />
                      <Box padding="300" background="bg-surface">
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(38px, 1fr))",
                            gap: "4px",
                          }}
                        >
                          {BUY_BUTTON_STORE_ICONS.map((entry) => (
                            <BuyButtonIconSwatch
                              key={entry.id}
                              entry={entry}
                              selected={buttonIconId === entry.id}
                              onSelect={() => {
                                setButtonIconId(entry.id);
                                setShowIcon(true);
                                setIconPickerOpen(false);
                              }}
                            />
                          ))}
                        </div>
                      </Box>
                    </Box>
                  </Popover>
                </Labelled>
              </div>

              <FormLayout.Group>
                <Select
                  id="buy-button-animation"
                  label="Animation"
                  options={ANIMATION_OPTIONS}
                  value={animation}
                  onChange={setAnimation}
                />
                <Select
                  id="buy-button-sticky"
                  label="Sticky button position"
                  options={STICKY_POSITION_OPTIONS}
                  value={stickyPosition}
                  onChange={setStickyPosition}
                />
              </FormLayout.Group>

              <FormLayout.Group>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Background color
                  </Text>
                  <ColorPicker onChange={setBgColor} color={bgColor} allowAlpha fullWidth />
                  <TextField
                    id="buy-button-bg-hex"
                    label="Hex"
                    value={hsbToHex(bgColor)}
                    autoComplete="off"
                    onChange={(v) => {
                      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                        setBgColor(hexToHsb(v));
                      }
                    }}
                    placeholder="#000000"
                  />
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Text color
                  </Text>
                  <ColorPicker onChange={setTextColor} color={textColor} allowAlpha fullWidth />
                  <TextField
                    id="buy-button-text-hex"
                    label="Hex"
                    value={hsbToHex(textColor)}
                    autoComplete="off"
                    onChange={(v) => {
                      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                        setTextColor(hexToHsb(v));
                      }
                    }}
                    placeholder="#FFFFFF"
                  />
                </BlockStack>
              </FormLayout.Group>

              <BlockStack gap="200">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  Border color
                </Text>
                <ColorPicker onChange={setBorderColor} color={borderColor} allowAlpha fullWidth />
                <TextField
                  id="buy-button-border-hex"
                  label="Hex"
                  value={hsbToHex(borderColor)}
                  autoComplete="off"
                  onChange={(v) => {
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                      setBorderColor(hexToHsb(v));
                    }
                  }}
                  placeholder="#000000"
                />
              </BlockStack>

              <FormLayout.Group>
                <RangeSlider
                  id="buy-button-radius"
                  label="Border radius"
                  min={0}
                  max={28}
                  step={1}
                  value={borderRadiusPx}
                  output
                  onChange={handleBorderRadiusChange}
                  suffix={<Text as="span">{`${borderRadiusPx}px`}</Text>}
                />
                <RangeSlider
                  id="buy-button-border-width"
                  label="Border width"
                  min={0}
                  max={8}
                  step={1}
                  value={borderWidthPx}
                  output
                  onChange={handleBorderWidthChange}
                  suffix={<Text as="span">{`${borderWidthPx}px`}</Text>}
                />
              </FormLayout.Group>

              <RangeSlider
                id="buy-button-shadow"
                label="Shadow"
                min={0}
                max={24}
                step={1}
                value={shadowStrength}
                output
                onChange={handleShadowChange}
              />

              <RangeSlider
                id="buy-button-width"
                label="Button width"
                helpText="Percentage of the available space the button occupies. 100% matches Add to cart."
                min={40}
                max={100}
                step={5}
                value={widthPercent}
                output
                onChange={handleWidthChange}
                suffix={<Text as="span">{`${widthPercent}%`}</Text>}
              />

              <Checkbox
                id="buy-button-sticky-mobile"
                label="Enable sticky button on mobile devices (product pages only)"
                checked={stickyMobile}
                onChange={setStickyMobile}
              />

              <Checkbox
                id="buy-button-mobile-full-width"
                label="Full width on mobile"
                helpText="Stretch the button to the full screen width on mobile devices."
                checked={mobileFullWidth}
                onChange={setMobileFullWidth}
              />
            </FormLayout>

            <Banner
              tone="info"
              icon={ChatIcon}
              title="Need a custom layout?"
              action={{
                content: "Contact us",
                url: "mailto:support@buyease.com",
              }}
            >
              <Text as="p" variant="bodyMd">
                Our team can help adapt placement, translations, or advanced styling for your theme.
              </Text>
            </Banner>
          </BlockStack>
        </Card>

        <Box position="sticky" insetBlockStart="400" zIndex="400" width="100%">
          <BlockStack gap="300">
            <InlineStack align="center">
              <span
                style={{
                  borderBottom: "1px dashed var(--p-color-border-secondary)",
                  paddingBottom: "4px",
                }}
              >
                <Text as="h3" variant="headingSm">
                  Live preview
                </Text>
              </span>
            </InlineStack>

            <Card padding="400">
              <Box
                padding="400"
                background="bg-surface-secondary"
                borderRadius="300"
                borderWidth="025"
                borderColor="border"
              >
                <BuyButtonPreviewSvg
                  filterId={previewFilterId}
                  label={buttonText}
                  subtitle={buttonSubtitle}
                  previewPaths={previewPaths}
                  iconAlign={iconAlign}
                  animation={animation}
                  bg={bgColor}
                  fg={textColor}
                  border={borderColor}
                  fontSizePx={fontSizePx}
                  borderRadiusPx={borderRadiusPx}
                  borderWidthPx={borderWidthPx}
                  shadowStrength={shadowStrength}
                  widthPercent={widthPercent}
                  fontBold={textBold}
                  fontItalic={textItalic}
                  cropToButton
                />
              </Box>
            </Card>

            <InlineStack align="center">
              <Button variant="secondary" onClick={handleResetToDefault} disabled={loading || saving}>
                Reset to default
              </Button>
            </InlineStack>

            <InlineStack align="center">
              <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                The button that opens the form
              </Text>
            </InlineStack>
          </BlockStack>
        </Box>
      </InlineGrid>
    </BlockStack>
  );
}
