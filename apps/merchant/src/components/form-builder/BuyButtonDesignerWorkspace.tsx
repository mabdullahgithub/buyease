"use client";

import { useCallback, useId, useMemo, useState } from "react";
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
  Icon,
  InlineGrid,
  InlineStack,
  Labelled,
  Popover,
  RangeSlider,
  Select,
  Text,
  TextField,
  UnstyledButton,
  hsbToRgb,
  rgbaString,
} from "@shopify/polaris";
import {
  BlankIcon,
  ChatIcon,
  DeleteIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
} from "@shopify/polaris-icons";

import type { BuyButtonIconDefinition, BuyButtonIconId, SvgPathSpec } from "@/components/form-builder/buy-button-icon-registry";
import { BUY_BUTTON_STORE_ICONS, getBuyButtonIconDefinition } from "@/components/form-builder/buy-button-icon-registry";

const BUY_BUTTON_INSTRUCTION =
  "This is the button customers tap to open your COD form on product or cart pages. Customize the label and look here so it matches your brand. On the storefront the button uses your theme’s font family.";

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

const DEFAULT_BG: HSBAColor = {
  hue: 0,
  saturation: 0,
  brightness: 0,
  alpha: 1,
};

const DEFAULT_TEXT: HSBAColor = {
  hue: 0,
  saturation: 0,
  brightness: 1,
  alpha: 1,
};

const DEFAULT_BORDER: HSBAColor = {
  hue: 0,
  saturation: 0,
  brightness: 0,
  alpha: 1,
};

function hsbaToRgbaString(color: HSBAColor): string {
  return rgbaString(hsbToRgb(color));
}

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

/** Greedy word-wrap for SVG (`tspan`); breaks long tokens; ellipsizes only when exceeding `maxLines`. */
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

/** Preview canvas width — button spans nearly full width like Dawn product form CTAs. */
const PRODUCT_PREVIEW_VIEW_WIDTH = 400;
const PRODUCT_PREVIEW_SIDE_PAD = 16;
const PREVIEW_LABEL_FALLBACK = "Buy with Cash on Delivery";

type IconTextAlign = "start" | "end";

type BuyButtonPreviewSvgProps = {
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
  fontBold: boolean;
  fontItalic: boolean;
  /** When true, the SVG viewBox is cropped to the button only (no side canvas padding). */
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

function BuyButtonPreviewSvg({
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

  const btnWidth = PRODUCT_PREVIEW_VIEW_WIDTH - PRODUCT_PREVIEW_SIDE_PAD * 2;
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
  const titleClusterWidthPx = iconSlot + Math.min(titleColumnWidth, widestTitlePx);

  const titleLineAdvance = Math.round(fontSizePx * 1.2);
  const subtitleLineAdvance = Math.round(subFontSize * 1.2);

  const firstTitleBaseline = padY + Math.round(fontSizePx * 0.92);
  const lastTitleBaseline =
    labelLines.length > 0
      ? firstTitleBaseline + Math.max(0, labelLines.length - 1) * titleLineAdvance
      : firstTitleBaseline;

  const firstSubtitleBaseline =
    subtitleLines.length > 0 ? lastTitleBaseline + lineGap + Math.round(subFontSize * 0.92) : 0;

  const lastSubtitleBaseline =
    subtitleLines.length > 0
      ? firstSubtitleBaseline + Math.max(0, subtitleLines.length - 1) * subtitleLineAdvance
      : firstTitleBaseline;

  const titleDescent = Math.round(fontSizePx * 0.28);
  const subDescent = Math.round(subFontSize * 0.28);
  const lastVisualBottom = hasSubtitle ? lastSubtitleBaseline + subDescent : lastTitleBaseline + titleDescent;
  const btnHeight = Math.max(52, lastVisualBottom + padY);

  /** Optical vertical center of wrapped title (baseline math alone misaligns icons vs text). */
  const TITLE_CAP_ASCENT = 0.72;
  const TITLE_BASE_DESCENT = 0.24;
  const titleInkTopY =
    firstTitleBaseline - TITLE_CAP_ASCENT * fontSizePx;
  const titleInkBottomY =
    lastTitleBaseline + TITLE_BASE_DESCENT * fontSizePx;
  const titleVisualMidY = (titleInkTopY + titleInkBottomY) / 2;

  let iconX = 0;
  let iconY = 0;
  let labelX = btnWidth / 2;
  let labelAnchor: "start" | "middle" = "middle";

  const clusterInnerStart = padX + Math.max(0, (innerContentWidth - titleClusterWidthPx) / 2);

  if (hasIcon && previewPaths) {
    iconY = titleVisualMidY - iconSize / 2;
    const textStripePx = Math.min(titleColumnWidth, widestTitlePx);
    if (iconAlign === "start") {
      iconX = clusterInnerStart;
      labelX = clusterInnerStart + iconSlot;
      labelAnchor = "start";
    } else {
      labelX = clusterInnerStart;
      labelAnchor = "start";
      iconX = clusterInnerStart + textStripePx + iconGap;
    }
  } else {
    labelX = btnWidth / 2;
    labelAnchor = "middle";
  }

  const viewHeight = btnHeight + 16;
  const blur = Math.min(14, Math.max(0, shadowStrength / 2));
  const pulseLayer = animation === "pulse";
  const glowLayer = animation === "fanfare";
  const originX = PRODUCT_PREVIEW_SIDE_PAD;
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
      >
        {glowLayer ? (
          <animate attributeName="opacity" values="1;0.88;1" dur="1.25s" repeatCount="indefinite" />
        ) : null}
        {pulseLayer ? (
          <animate attributeName="opacity" values="1;0.88;1" dur="1.5s" repeatCount="indefinite" />
        ) : null}
      </rect>
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
  hovered: boolean;
  onSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
};

function BuyButtonIconSwatch({
  entry,
  selected,
  hovered,
  onSelect,
  onHoverStart,
  onHoverEnd,
}: BuyButtonIconSwatchProps): ReactElement {
  const interactiveHover = hovered && !selected;
  return (
    <UnstyledButton
      accessibilityLabel={entry.label}
      onClick={onSelect}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "52px",
          height: "52px",
          borderRadius: "10px",
          border: selected
            ? "2px solid var(--p-color-border-emphasis)"
            : "1.5px solid var(--p-color-border-secondary)",
          background: selected
            ? "var(--p-color-bg-surface-selected)"
            : interactiveHover
              ? "var(--p-color-bg-surface-hover)"
              : "var(--p-color-bg-surface)",
          transition: "background 120ms ease, border-color 120ms ease",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "scale(1.25)",
            transformOrigin: "center center",
            filter: selected ? "brightness(0) saturate(100%)" : undefined,
          }}
        >
          <Icon source={entry.source} tone={selected ? "emphasis" : "base"} />
        </span>
      </span>
    </UnstyledButton>
  );
}

export function BuyButtonDesignerWorkspace(): ReactElement {
  const previewFilterId = useId().replace(/:/g, "");

  const [buttonText, setButtonText] = useState("Buy with Cash on Delivery");
  const [buttonSubtitle, setButtonSubtitle] = useState("");
  const [animation, setAnimation] = useState("none");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSwatchHoverId, setIconSwatchHoverId] = useState<
    Exclude<BuyButtonIconId, "none"> | null
  >(null);
  const [buttonIconId, setButtonIconId] = useState<BuyButtonIconId>("cart-filled");
  const [iconAlign, setIconAlign] = useState<IconTextAlign>("start");
  const [textBold, setTextBold] = useState(true);
  const [textItalic, setTextItalic] = useState(false);
  const [stickyPosition, setStickyPosition] = useState("bottom");
  const [stickyMobile, setStickyMobile] = useState(true);

  const [bgColor, setBgColor] = useState<HSBAColor>(DEFAULT_BG);
  const [textColor, setTextColor] = useState<HSBAColor>(DEFAULT_TEXT);
  const [borderColor, setBorderColor] = useState<HSBAColor>(DEFAULT_BORDER);

  const [fontSizePx, setFontSizePx] = useState(16);
  const [borderRadiusPx, setBorderRadiusPx] = useState(6);
  const [borderWidthPx, setBorderWidthPx] = useState(1);
  const [shadowStrength, setShadowStrength] = useState(8);

  const bgRgbaDisplay = useMemo(() => hsbaToRgbaString(bgColor), [bgColor]);
  const textRgbaDisplay = useMemo(() => hsbaToRgbaString(textColor), [textColor]);
  const borderRgbaDisplay = useMemo(() => hsbaToRgbaString(borderColor), [borderColor]);

  const activeIcon = useMemo(() => getBuyButtonIconDefinition(buttonIconId), [buttonIconId]);

  const previewPaths = useMemo(() => activeIcon?.previewPaths, [activeIcon]);

  const handleFontSizeChange = useCallback((value: string): void => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return;
    }
    setFontSizePx(clampFontSizePx(parsed));
  }, []);

  const handleBorderRadiusChange = useCallback((value: number | [number, number]): void => {
    if (typeof value === "number") {
      setBorderRadiusPx(value);
    }
  }, []);

  const handleBorderWidthChange = useCallback((value: number | [number, number]): void => {
    if (typeof value === "number") {
      setBorderWidthPx(value);
    }
  }, []);

  const handleShadowChange = useCallback((value: number | [number, number]): void => {
    if (typeof value === "number") {
      setShadowStrength(value);
    }
  }, []);

  const iconActivatorSource = activeIcon?.source;

  return (
    <BlockStack gap="400">
      <Card roundedAbove="sm">
        <BlockStack gap="300">
          <Text as="p" variant="bodyMd">
            {BUY_BUTTON_INSTRUCTION}
          </Text>
        </BlockStack>
      </Card>

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
              <FormLayout.Group>
                <TextField
                  id="buy-button-label"
                  label="Button text"
                  value={buttonText}
                  onChange={setButtonText}
                  autoComplete="off"
                />
                <TextField
                  id="buy-button-subtitle"
                  label="Button subtitle"
                  value={buttonSubtitle}
                  onChange={setButtonSubtitle}
                  autoComplete="off"
                  placeholder="Optional"
                />
              </FormLayout.Group>

              <InlineGrid columns={{ xs: "1fr", sm: "1fr 1fr 1fr" }} gap="300" alignItems="start">
                <Box minWidth="0" width="100%">
                  <TextField
                    id="buy-button-text-size"
                    label="Text size"
                    value={String(fontSizePx)}
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    suffix="px"
                    onChange={(value): void => handleFontSizeChange(value)}
                  />
                </Box>
                <Box minWidth="0" width="100%">
                  <Labelled id="buy-button-style" label="Style">
                    <ButtonGroup variant="segmented" fullWidth>
                      <Button
                        pressed={textBold}
                        onClick={(): void => setTextBold((previous) => !previous)}
                        accessibilityLabel="Bold"
                      >
                        B
                      </Button>
                      <Button
                        pressed={textItalic}
                        onClick={(): void => setTextItalic((previous) => !previous)}
                        accessibilityLabel="Italic"
                      >
                        I
                      </Button>
                    </ButtonGroup>
                  </Labelled>
                </Box>
                <Box minWidth="0" width="100%">
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
                          onClick={(): void => setIconPickerOpen((active) => !active)}
                        >
                          Change icon
                        </Button>
                      }
                      onClose={(): void => setIconPickerOpen(false)}
                    >
                    <Box
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
                              onClick={(): void => setIconAlign("start")}
                            />
                            <Button
                              pressed={iconAlign === "end"}
                              icon={TextAlignRightIcon}
                              accessibilityLabel="Icon after text"
                              onClick={(): void => setIconAlign("end")}
                            />
                          </ButtonGroup>
                          <Button
                            tone="critical"
                            variant="plain"
                            icon={DeleteIcon}
                            onClick={(): void => {
                              setButtonIconId("none");
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
                            gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))",
                            gap: "8px",
                          }}
                        >
                          {BUY_BUTTON_STORE_ICONS.map((entry) => (
                            <BuyButtonIconSwatch
                              key={entry.id}
                              entry={entry}
                              selected={buttonIconId === entry.id}
                              hovered={iconSwatchHoverId === entry.id}
                              onHoverStart={(): void => setIconSwatchHoverId(entry.id)}
                              onHoverEnd={(): void => setIconSwatchHoverId(null)}
                              onSelect={(): void => {
                                setButtonIconId(entry.id);
                                setIconPickerOpen(false);
                              }}
                            />
                          ))}
                        </div>
                      </Box>
                    </Box>
                  </Popover>
                </Labelled>
                </Box>
              </InlineGrid>

              <FormLayout.Group>
                <Select
                  id="buy-button-animation"
                  label="Animation"
                  options={ANIMATION_OPTIONS}
                  value={animation}
                  onChange={(v): void => setAnimation(v)}
                />
                <Select
                  id="buy-button-sticky"
                  label="Sticky button position"
                  options={STICKY_POSITION_OPTIONS}
                  value={stickyPosition}
                  onChange={(v): void => setStickyPosition(v)}
                />
              </FormLayout.Group>

              <FormLayout.Group>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Background color
                  </Text>
                  <ColorPicker onChange={setBgColor} color={bgColor} allowAlpha fullWidth />
                  <TextField
                    id="buy-button-bg-rgba"
                    label="RGBA"
                    value={bgRgbaDisplay}
                    autoComplete="off"
                    readOnly
                    onChange={() => {}}
                  />
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Text color
                  </Text>
                  <ColorPicker onChange={setTextColor} color={textColor} allowAlpha fullWidth />
                  <TextField
                    id="buy-button-text-rgba"
                    label="RGBA"
                    value={textRgbaDisplay}
                    autoComplete="off"
                    readOnly
                    onChange={() => {}}
                  />
                </BlockStack>
              </FormLayout.Group>

              <BlockStack gap="200">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  Border color
                </Text>
                <ColorPicker onChange={setBorderColor} color={borderColor} allowAlpha fullWidth />
                <TextField
                  id="buy-button-border-rgba"
                  label="RGBA"
                  value={borderRgbaDisplay}
                  autoComplete="off"
                  readOnly
                  onChange={() => {}}
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

              <Checkbox
                id="buy-button-sticky-mobile"
                label="Enable sticky button on mobile devices (product pages only)"
                checked={stickyMobile}
                onChange={setStickyMobile}
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
                  fontBold={textBold}
                  fontItalic={textItalic}
                  cropToButton
                />
              </Box>
            </Card>

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
