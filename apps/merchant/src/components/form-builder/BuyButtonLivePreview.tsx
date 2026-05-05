"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { BlockStack, Box, SkeletonBodyText, Text } from "@shopify/polaris";

import { useShopifyBridge } from "@/lib/use-shopify-bridge";
import { getBuyButtonIconDefinition } from "@/components/form-builder/buy-button-icon-registry";
import { BuyButtonPreviewSvg, hexToHsb } from "@/components/form-builder/BuyButtonDesignerWorkspace";

type BuyButtonConfig = {
  buttonText: string;
  buttonSubtitle: string | null;
  iconId: string;
  iconAlign: string;
  showIcon: boolean;
  animation: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  fontSizePx: number;
  borderRadiusPx: number;
  borderWidthPx: number;
  shadowStrength: number;
  isBold: boolean;
  isItalic: boolean;
};

export function BuyButtonLivePreview(): ReactElement {
  const filterId = useId().replace(/:/g, "");
  const shopify = useShopifyBridge();
  const [config, setConfig] = useState<BuyButtonConfig | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch_config(): Promise<void> {
      try {
        const response = await fetch("/api/buy-button-config", {
          headers: { Authorization: `Bearer ${await shopify.idToken()}` },
        });
        if (!cancelled && response.ok) {
          setConfig(await response.json());
        }
      } catch {
        // Silently fail — preview is non-critical
      }
    }

    fetch_config();
    return () => { cancelled = true; };
  }, [shopify]);

  const iconDef = useMemo(
    () => config?.showIcon ? getBuyButtonIconDefinition(config.iconId as never) : undefined,
    [config?.iconId, config?.showIcon],
  );

  if (!config) {
    return (
      <Box padding="400" background="bg-surface-secondary" borderRadius="200">
        <SkeletonBodyText lines={1} />
      </Box>
    );
  }

  return (
    <BlockStack gap="200">
      <Box padding="300" background="bg-surface-secondary" borderRadius="200">
        <BuyButtonPreviewSvg
          filterId={filterId}
          label={config.buttonText}
          subtitle={config.buttonSubtitle ?? ""}
          previewPaths={iconDef?.previewPaths}
          iconAlign={config.iconAlign as "start" | "end"}
          animation={config.animation}
          bg={hexToHsb(config.bgColor)}
          fg={hexToHsb(config.textColor)}
          border={hexToHsb(config.borderColor)}
          fontSizePx={config.fontSizePx}
          borderRadiusPx={config.borderRadiusPx}
          borderWidthPx={config.borderWidthPx}
          shadowStrength={config.shadowStrength}
          fontBold={config.isBold}
          fontItalic={config.isItalic}
          cropToButton
        />
      </Box>
      <Text as="p" variant="bodySm" tone="subdued" alignment="center">
        This is the button that opens the form
      </Text>
    </BlockStack>
  );
}
