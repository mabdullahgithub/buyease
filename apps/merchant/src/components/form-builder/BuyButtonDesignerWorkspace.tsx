"use client";

import { useCallback, useId, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { HSBAColor } from "@shopify/polaris";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Card,
  Checkbox,
  ColorPicker,
  Divider,
  FormLayout,
  InlineGrid,
  InlineStack,
  RangeSlider,
  Select,
  Text,
  TextField,
  hsbToRgb,
  rgbaString,
} from "@shopify/polaris";
import { ChatIcon } from "@shopify/polaris-icons";

/** Shopping-cart glyph (24×24) for SVG preview — scaled inside the preview canvas. */
const CART_ICON_PATH =
  "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z";

/** Cursor-style glyph for “button icon” option (24×24). */
const POINTER_ICON_PATH =
  "M13.64 21.97 3.43 11.76a1.75 1.75 0 0 1-.08-2.47l.09-.09a1.75 1.75 0 0 1 2.35-.12l3.47 2.84V4.25c0-.97.78-1.75 1.75-1.75h.1c.97 0 1.75.78 1.75 1.75v7.67l3.47-2.84c.72-.6 1.78-.5 2.35.12l.09.09c.65.72.58 1.83-.15 2.47l-10.21 10.21a1.75 1.75 0 0 1-2.47 0z";

const BUY_BUTTON_INSTRUCTION =
  "This is the button customers tap to open your COD form on product or cart pages. Customize the label and look here so it matches your brand. On the storefront the button uses your theme’s font family.";

const ANIMATION_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Pulse", value: "pulse" },
  { label: "Soft glow", value: "glow" },
];

const ICON_OPTIONS = [
  { label: "No icon", value: "none" },
  { label: "Shopping cart", value: "cart" },
  { label: "Button icon", value: "button-icon" },
];

const STICKY_POSITION_OPTIONS = [
  { label: "Bottom", value: "bottom" },
  { label: "Top", value: "top" },
  { label: "Off (inline only)", value: "off" },
];

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

function truncatePreviewLabel(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, maxChars - 1))}…`;
}

/** Preview canvas width — button spans nearly full width like Dawn product form CTAs. */
const PRODUCT_PREVIEW_VIEW_WIDTH = 400;
const PRODUCT_PREVIEW_SIDE_PAD = 16;

type ButtonIconOption = "none" | "cart" | "button-icon";

type BuyButtonPreviewSvgProps = {
  filterId: string;
  label: string;
  subtitle: string;
  icon: ButtonIconOption;
  animation: string;
  bg: HSBAColor;
  fg: HSBAColor;
  border: HSBAColor;
  fontSizePx: number;
  borderRadiusPx: number;
  borderWidthPx: number;
  shadowStrength: number;
};

function BuyButtonPreviewSvg({
  filterId,
  label,
  subtitle,
  icon,
  animation,
  bg,
  fg,
  border,
  fontSizePx,
  borderRadiusPx,
  borderWidthPx,
  shadowStrength,
}: BuyButtonPreviewSvgProps): ReactElement {
  const bgFill = hsbaToRgbaString(bg);
  const textFill = hsbaToRgbaString(fg);
  const borderStroke = hsbaToRgbaString(border);
  const safeLabel = truncatePreviewLabel(label.length > 0 ? label : "Buy with Cash on Delivery", 48);
  const subtitleTrim = subtitle.trim();
  const iconGap = 8;
  const iconSize = icon === "none" ? 0 : Math.min(24, Math.round(fontSizePx * 1.15));
  const charEstimate = 0.52 * fontSizePx;
  const textWidthEstimate = safeLabel.length * charEstimate;
  const padX = Math.round(fontSizePx * 0.75);
  const padY = Math.round(fontSizePx * 0.55);
  const subFontSize = Math.max(11, Math.round(fontSizePx * 0.78));
  const lineGap = 6;
  const iconSlot = icon === "none" ? 0 : iconSize + iconGap;

  const btnWidth = PRODUCT_PREVIEW_VIEW_WIDTH - PRODUCT_PREVIEW_SIDE_PAD * 2;
  const mainBlockHeight =
    subtitleTrim.length > 0 ? fontSizePx + lineGap + subFontSize : fontSizePx;
  const btnHeight = Math.max(52, padY * 2 + mainBlockHeight);
  const viewHeight = btnHeight + 16;
  const blur = Math.min(14, Math.max(0, shadowStrength / 2));

  const pulseAnimation = animation === "pulse";
  const glowAnimation = animation === "glow";

  let iconPath: string | null = null;
  if (icon === "cart") {
    iconPath = CART_ICON_PATH;
  } else if (icon === "button-icon") {
    iconPath = POINTER_ICON_PATH;
  }

  const originX = PRODUCT_PREVIEW_SIDE_PAD;
  const originY = 8;

  const textPartWidth = Math.min(textWidthEstimate, btnWidth - padX * 2 - iconSlot);
  const clusterWidth = iconSlot + textPartWidth;
  const rowStartX = Math.max(padX, (btnWidth - clusterWidth) / 2);

  const labelBaseline =
    subtitleTrim.length > 0 ? padY + fontSizePx * 0.82 : btnHeight / 2;
  const subtitleBaseline =
    subtitleTrim.length > 0 ? padY + fontSizePx + lineGap + subFontSize * 0.82 : labelBaseline;

  return (
    <svg
      viewBox={`0 0 ${PRODUCT_PREVIEW_VIEW_WIDTH} ${viewHeight}`}
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Live preview of the COD buy button on a product page"
    >
      <title>Product page buy button preview</title>
      <defs>
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={blur} result="blur" />
          <feOffset in="blur" dy={Math.min(6, blur / 2)} result="offsetBlur" />
          <feMerge>
            <feMergeNode in="offsetBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`translate(${originX}, ${originY})`}>
        {pulseAnimation ? (
          <animate attributeName="opacity" values="1;0.88;1" dur="1.5s" repeatCount="indefinite" />
        ) : null}
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
          {glowAnimation ? (
            <animate attributeName="opacity" values="1;0.85;1" dur="2.2s" repeatCount="indefinite" />
          ) : null}
        </rect>
        {iconPath !== null ? (
          <g
            transform={`translate(${rowStartX}, ${
              subtitleTrim.length > 0
                ? padY + fontSizePx * 0.42 - iconSize / 2
                : padY + (mainBlockHeight - iconSize) / 2
            })`}
          >
            <path d={iconPath} fill={textFill} transform={`scale(${iconSize / 24})`} />
          </g>
        ) : null}
        <text
          x={iconPath === null ? btnWidth / 2 : rowStartX + iconSlot}
          y={subtitleTrim.length > 0 ? padY + fontSizePx * 0.82 : btnHeight / 2}
          dominantBaseline={subtitleTrim.length > 0 ? undefined : "middle"}
          textAnchor={iconPath === null ? "middle" : "start"}
          fill={textFill}
          fontSize={fontSizePx}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="600"
        >
          {safeLabel}
        </text>
        {subtitleTrim.length > 0 ? (
          <text
            x={btnWidth / 2}
            y={subtitleBaseline}
            textAnchor="middle"
            fill={textFill}
            fontSize={subFontSize}
            fontFamily="system-ui, -apple-system, sans-serif"
            opacity={0.92}
          >
            {truncatePreviewLabel(subtitleTrim, 52)}
          </text>
        ) : null}
      </g>
    </svg>
  );
}

/**
 * Buy Button workspace: storefront-style controls and a single-surface live preview (Polaris-only).
 */
export function BuyButtonDesignerWorkspace(): ReactElement {
  const previewFilterId = useId().replace(/:/g, "");

  const [buttonText, setButtonText] = useState("Buy with Cash on Delivery");
  const [buttonSubtitle, setButtonSubtitle] = useState("");
  const [animation, setAnimation] = useState("none");
  const [icon, setIcon] = useState<ButtonIconOption>("cart");
  const [stickyPosition, setStickyPosition] = useState("bottom");
  const [stickyMobile, setStickyMobile] = useState(true);

  const [bgColor, setBgColor] = useState<HSBAColor>(DEFAULT_BG);
  const [textColor, setTextColor] = useState<HSBAColor>(DEFAULT_TEXT);
  const [borderColor, setBorderColor] = useState<HSBAColor>(DEFAULT_BORDER);

  const [fontSizePx, setFontSizePx] = useState(15);
  const [borderRadiusPx, setBorderRadiusPx] = useState(6);
  const [borderWidthPx, setBorderWidthPx] = useState(1);
  const [shadowStrength, setShadowStrength] = useState(8);

  const bgRgbaDisplay = useMemo(() => hsbaToRgbaString(bgColor), [bgColor]);
  const textRgbaDisplay = useMemo(() => hsbaToRgbaString(textColor), [textColor]);
  const borderRgbaDisplay = useMemo(() => hsbaToRgbaString(borderColor), [borderColor]);

  const handleFontSizeChange = useCallback((value: number | [number, number]): void => {
    if (typeof value === "number") {
      setFontSizePx(value);
    }
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

              <FormLayout.Group>
                <Select
                  id="buy-button-animation"
                  label="Button animation"
                  options={ANIMATION_OPTIONS}
                  value={animation}
                  onChange={(v): void => setAnimation(v)}
                />
                <Select
                  id="buy-button-icon"
                  label="Button icon"
                  options={ICON_OPTIONS}
                  value={icon}
                  onChange={(v): void => setIcon(v as ButtonIconOption)}
                />
              </FormLayout.Group>

              <Select
                id="buy-button-sticky"
                label="Sticky button position"
                options={STICKY_POSITION_OPTIONS}
                value={stickyPosition}
                onChange={(v): void => setStickyPosition(v)}
              />

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

              <RangeSlider
                id="buy-button-font-size"
                label="Font size"
                min={12}
                max={22}
                step={1}
                value={fontSizePx}
                output
                onChange={handleFontSizeChange}
                suffix={<Text as="span">{`${fontSizePx}px`}</Text>}
              />

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
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text as="h2" variant="headingSm">
                  Live preview
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Sample product page—your COD button appears as a full-width primary action, like on
                  Online Store 2.0 themes. Typography on the live store follows the theme; colors and
                  scale match your settings here.
                </Text>
              </BlockStack>
              <Box
                background="bg-surface"
                borderWidth="025"
                borderColor="border"
                borderRadius="300"
                padding="400"
                width="100%"
              >
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">
                      storename.com
                    </Text>
                    <Text as="h3" variant="headingLg">
                      Sample product
                    </Text>
                    <InlineStack align="space-between" blockAlign="center" wrap={false} gap="200">
                      <Badge tone="success">In stock</Badge>
                      <Text as="p" variant="headingLg">
                        $29.99
                      </Text>
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Shown with sample title and price. Your real product data appears on the
                      storefront.
                    </Text>
                  </BlockStack>
                  <Divider />
                  <Box
                    background="bg-surface-secondary"
                    borderRadius="200"
                    padding="300"
                    width="100%"
                  >
                    <BuyButtonPreviewSvg
                      filterId={previewFilterId}
                      label={buttonText}
                      subtitle={buttonSubtitle}
                      icon={icon}
                      animation={animation}
                      bg={bgColor}
                      fg={textColor}
                      border={borderColor}
                      fontSizePx={fontSizePx}
                      borderRadiusPx={borderRadiusPx}
                      borderWidthPx={borderWidthPx}
                      shadowStrength={shadowStrength}
                    />
                  </Box>
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>
        </Box>
      </InlineGrid>
    </BlockStack>
  );
}
