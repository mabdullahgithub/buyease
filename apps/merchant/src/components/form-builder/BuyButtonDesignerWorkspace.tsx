"use client";

import { useCallback, useId, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { HSBAColor } from "@shopify/polaris";
import {
  Badge,
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
  Popover,
  RangeSlider,
  Select,
  Text,
  TextField,
  UnstyledButton,
  hsbToRgb,
  rgbaString,
} from "@shopify/polaris";
import { ChatIcon, TextAlignLeftIcon, TextAlignRightIcon } from "@shopify/polaris-icons";

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

function truncatePreviewLabel(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, maxChars - 1))}…`;
}

function clampFontSizePx(value: number): number {
  return Math.min(FONT_MAX_PX, Math.max(FONT_MIN_PX, Math.round(value)));
}

/** Preview canvas width — button spans nearly full width like Dawn product form CTAs. */
const PRODUCT_PREVIEW_VIEW_WIDTH = 400;
const PRODUCT_PREVIEW_SIDE_PAD = 16;

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
}: BuyButtonPreviewSvgProps): ReactElement {
  const bgFill = hsbaToRgbaString(bg);
  const textFill = hsbaToRgbaString(fg);
  const borderStroke = hsbaToRgbaString(border);
  const safeLabel = truncatePreviewLabel(label.length > 0 ? label : "Buy with Cash on Delivery", 48);
  const subtitleTrim = subtitle.trim();
  const iconGap = 8;
  const hasIcon = Boolean(previewPaths && previewPaths.length > 0);
  const iconSize = hasIcon ? Math.min(28, Math.round(fontSizePx * 1.3)) : 0;
  const charEstimate = 0.52 * fontSizePx;
  const textWidthEstimate = safeLabel.length * charEstimate;
  const padX = Math.round(fontSizePx * 0.75);
  const padY = Math.round(fontSizePx * 0.55);
  const subFontSize = Math.max(11, Math.round(fontSizePx * 0.78));
  const lineGap = 6;
  const iconSlot = hasIcon ? iconSize + iconGap : 0;

  const btnWidth = PRODUCT_PREVIEW_VIEW_WIDTH - PRODUCT_PREVIEW_SIDE_PAD * 2;
  const textPartWidth = Math.min(textWidthEstimate, btnWidth - padX * 2 - iconSlot);
  const clusterWidth = iconSlot + textPartWidth;
  const rowStartX = Math.max(padX, (btnWidth - clusterWidth) / 2);

  const mainBlockHeight =
    subtitleTrim.length > 0 ? fontSizePx + lineGap + subFontSize : fontSizePx;
  const btnHeight = Math.max(52, padY * 2 + mainBlockHeight);
  const viewHeight = btnHeight + 16;
  const blur = Math.min(14, Math.max(0, shadowStrength / 2));

  const pulseLayer = animation === "pulse";
  const glowLayer = animation === "fanfare";

  const originX = PRODUCT_PREVIEW_SIDE_PAD;
  const originY = 8;

  const labelBaseline =
    subtitleTrim.length > 0 ? padY + fontSizePx * 0.82 : btnHeight / 2;
  const subtitleBaseline =
    subtitleTrim.length > 0 ? padY + fontSizePx + lineGap + subFontSize * 0.82 : labelBaseline;

  const fontWeightAttr = fontBold ? "700" : "600";
  const fontStyleAttr = fontItalic ? "italic" : "normal";

  const iconScale = iconSize / ICON_VIEWBOX;

  let iconX = 0;
  let iconY = 0;
  let labelX = btnWidth / 2;
  let labelAnchor: "start" | "middle" = "middle";

  if (hasIcon && previewPaths) {
    if (iconAlign === "start") {
      iconX = rowStartX;
      iconY =
        subtitleTrim.length > 0
          ? padY + fontSizePx * 0.42 - iconSize / 2
          : padY + (mainBlockHeight - iconSize) / 2;
      labelX = rowStartX + iconSlot;
      labelAnchor = "start";
    } else {
      labelX = rowStartX;
      labelAnchor = "start";
      iconX = rowStartX + textPartWidth + iconGap;
      iconY =
        subtitleTrim.length > 0
          ? padY + fontSizePx * 0.42 - iconSize / 2
          : padY + (mainBlockHeight - iconSize) / 2;
    }
  }

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
        y={subtitleTrim.length > 0 ? padY + fontSizePx * 0.82 : btnHeight / 2}
        dominantBaseline={subtitleTrim.length > 0 ? undefined : "middle"}
        textAnchor={labelAnchor}
        fill={textFill}
        fontSize={fontSizePx}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={fontWeightAttr}
        fontStyle={fontStyleAttr}
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
          fontWeight={fontBold ? "600" : "500"}
          fontStyle={fontItalic ? "italic" : "normal"}
          opacity={0.92}
        >
          {truncatePreviewLabel(subtitleTrim, 52)}
        </text>
      ) : null}
    </g>
  );

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
      <Box
        padding="300"
        minHeight="48px"
        background={
          selected
            ? "bg-surface-selected"
            : interactiveHover
              ? "bg-surface-tertiary"
              : "bg-surface-secondary"
        }
        borderRadius="200"
        borderWidth={selected ? "050" : "025"}
        borderColor={selected ? "border-emphasis" : "border"}
        shadow={selected ? "100" : undefined}
      >
        <Box width="100%" minHeight="36px">
          <InlineStack align="center" blockAlign="center" wrap={false}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "scale(1.32)",
                transformOrigin: "center center",
              }}
            >
              <Icon source={entry.source} tone={selected ? "emphasis" : "base"} />
            </span>
          </InlineStack>
        </Box>
      </Box>
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

              <Box maxWidth="100%" paddingBlockEnd="100">
                <Box minWidth="520px">
                  <InlineGrid columns={3} gap="400">
                    <Box minWidth="0">
                      <TextField
                        id="buy-button-text-size"
                        label="Text size"
                        type="integer"
                        value={String(fontSizePx)}
                        min={FONT_MIN_PX}
                        max={FONT_MAX_PX}
                        autoComplete="off"
                        suffix="px"
                        onChange={(value): void => handleFontSizeChange(value)}
                      />
                    </Box>
                    <Box minWidth="0">
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          Style
                        </Text>
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
                      </BlockStack>
                    </Box>
                    <Box minWidth="0">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Button icon
                      </Text>
                      <Box paddingBlockStart="200">
                        <Popover
                          active={iconPickerOpen}
                          autofocusTarget="first-node"
                          preferredPosition="below"
                          activator={
                            <Button
                              disclosure="down"
                              variant="secondary"
                              icon={iconActivatorSource}
                              fullWidth
                              textAlign="start"
                              onClick={(): void => setIconPickerOpen((active) => !active)}
                            >
                              Change icon
                            </Button>
                          }
                          onClose={(): void => setIconPickerOpen(false)}
                        >
                          <Box padding="400" maxWidth="496px">
                            <BlockStack gap="400">
                              <InlineStack align="space-between" blockAlign="center" wrap={false}>
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
                                  variant="tertiary"
                                  onClick={(): void => {
                                    setButtonIconId("none");
                                    setIconPickerOpen(false);
                                  }}
                                >
                                  Remove
                                </Button>
                              </InlineStack>

                              <Divider />

                              <InlineStack gap="300" blockAlign="center" wrap={false}>
                                <Box
                                  padding="300"
                                  background="bg-surface-secondary"
                                  borderWidth="025"
                                  borderColor="border"
                                  borderRadius="200"
                                  minWidth="56px"
                                  minHeight="56px"
                                >
                                  <InlineStack align="center" blockAlign="center">
                                    {iconActivatorSource ? (
                                      <span
                                        style={{
                                          display: "inline-flex",
                                          transform: "scale(1.65)",
                                          transformOrigin: "center center",
                                        }}
                                      >
                                        <Icon source={iconActivatorSource} tone="base" />
                                      </span>
                                    ) : (
                                      <Text as="span" variant="bodyLg" tone="subdued">
                                        —
                                      </Text>
                                    )}
                                  </InlineStack>
                                </Box>
                                <BlockStack gap="100">
                                  <Text as="p" variant="bodySm" fontWeight="semibold">
                                    {activeIcon ? activeIcon.label : "No icon"}
                                  </Text>
                                  <Text as="p" variant="bodySm" tone="subdued">
                                    How the icon appears on your live preview and storefront.
                                  </Text>
                                </BlockStack>
                              </InlineStack>

                              <Text as="h3" variant="headingSm">
                                All icons
                              </Text>
                              <InlineGrid columns={{ xs: 4, sm: 5 }} gap="200">
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
                              </InlineGrid>
                            </BlockStack>
                          </Box>
                        </Popover>
                      </Box>
                    </Box>
                  </InlineGrid>
                </Box>
              </Box>

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
          <Card roundedAbove="sm">
            <BlockStack gap="500">
              <InlineStack
                align="space-between"
                blockAlign="start"
                gap="300"
                wrap
              >
                <BlockStack gap="150">
                  <Text as="h2" variant="headingLg">
                    Live preview
                  </Text>
                  <Box maxWidth="420px">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Sample product page—your COD button is the full-width primary action. Live typography
                      follows the theme; colors, weight, and size match these controls.
                    </Text>
                  </Box>
                </BlockStack>
                <Badge tone="info">Product page</Badge>
              </InlineStack>

              <Box
                background="bg-surface-secondary"
                borderRadius="400"
                padding="300"
                borderWidth="025"
                borderColor="border"
              >
                <Box
                  background="bg-surface"
                  borderRadius="300"
                  overflowX="hidden"
                  overflowY="hidden"
                  shadow="200"
                  width="100%"
                >
                  <BlockStack gap="0">
                    <Box padding="500" paddingBlockEnd="400">
                      <BlockStack gap="300">
                        <Text
                          as="p"
                          variant="bodySm"
                          tone="subdued"
                        >
                          <span
                            style={{
                              letterSpacing: "0.04em",
                              textTransform: "lowercase",
                              fontSize: "0.8125rem",
                            }}
                          >
                            storename.com
                          </span>
                        </Text>
                        <Text as="h3" variant="headingLg">
                          Sample product
                        </Text>
                        <InlineStack align="space-between" blockAlign="center" wrap={false} gap="300">
                          <Badge tone="success">In stock</Badge>
                          <Text as="p" variant="headingLg" fontWeight="bold">
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>$29.99</span>
                          </Text>
                        </InlineStack>
                        <Text as="p" variant="bodySm" tone="subdued">
                          Shown with sample title and price. Your catalog appears on the storefront.
                        </Text>
                      </BlockStack>
                    </Box>
                    <Divider />
                    <Box
                      background="bg-surface-secondary"
                      padding="400"
                      paddingBlockStart="400"
                      width="100%"
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
                      />
                    </Box>
                  </BlockStack>
                </Box>
              </Box>
            </BlockStack>
          </Card>
        </Box>
      </InlineGrid>
    </BlockStack>
  );
}
