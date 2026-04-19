"use client";

import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Button,
  Banner,
  BlockStack,
  Text,
} from "@shopify/polaris";
import { useState } from "react";

type CodFormConfig = {
  formTitle: string;
  buttonLabel: string;
  codFeePercent: string;
  collectPhone: boolean;
  collectEmail: boolean;
  autoConfirm: boolean;
  thankYouMessage: string;
  currency: string;
};

const CURRENCY_OPTIONS = [
  { label: "USD — US Dollar", value: "USD" },
  { label: "EUR — Euro", value: "EUR" },
  { label: "GBP — British Pound", value: "GBP" },
  { label: "SAR — Saudi Riyal", value: "SAR" },
  { label: "AED — UAE Dirham", value: "AED" },
  { label: "PKR — Pakistani Rupee", value: "PKR" },
];

export default function CodFormPage() {
  const [config, setConfig] = useState<CodFormConfig>({
    formTitle: "Complete Your Order",
    buttonLabel: "Place Order",
    codFeePercent: "0",
    collectPhone: true,
    collectEmail: false,
    autoConfirm: false,
    thankYouMessage: "Thank you! Your order has been placed.",
    currency: "USD",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Page
      title="COD Form Settings"
      primaryAction={
        <Button variant="primary" loading={saving} onClick={handleSave}>
          Save
        </Button>
      }
    >
      <Layout>
        {saved && (
          <Layout.Section>
            <Banner tone="success">Settings saved successfully.</Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Form Appearance
              </Text>
              <FormLayout>
                <TextField
                  label="Form Title"
                  value={config.formTitle}
                  onChange={(v) => setConfig((c) => ({ ...c, formTitle: v }))}
                  autoComplete="off"
                />
                <TextField
                  label="Submit Button Label"
                  value={config.buttonLabel}
                  onChange={(v) => setConfig((c) => ({ ...c, buttonLabel: v }))}
                  autoComplete="off"
                />
                <TextField
                  label="Thank You Message"
                  value={config.thankYouMessage}
                  onChange={(v) =>
                    setConfig((c) => ({ ...c, thankYouMessage: v }))
                  }
                  multiline={3}
                  autoComplete="off"
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Order Configuration
              </Text>
              <FormLayout>
                <Select
                  label="Currency"
                  options={CURRENCY_OPTIONS}
                  value={config.currency}
                  onChange={(v) => setConfig((c) => ({ ...c, currency: v }))}
                />
                <TextField
                  label="COD Fee (%)"
                  type="number"
                  value={config.codFeePercent}
                  onChange={(v) =>
                    setConfig((c) => ({ ...c, codFeePercent: v }))
                  }
                  helpText="Extra fee added to the order total for cash-on-delivery (0 = no fee)"
                  autoComplete="off"
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Customer Fields
              </Text>
              <Checkbox
                label="Collect phone number"
                checked={config.collectPhone}
                onChange={(v) => setConfig((c) => ({ ...c, collectPhone: v }))}
              />
              <Checkbox
                label="Collect email address"
                checked={config.collectEmail}
                onChange={(v) => setConfig((c) => ({ ...c, collectEmail: v }))}
              />
              <Checkbox
                label="Auto-confirm orders (skip manual review)"
                checked={config.autoConfirm}
                onChange={(v) => setConfig((c) => ({ ...c, autoConfirm: v }))}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
