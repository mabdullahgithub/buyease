"use client";

import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
import Image from "next/image";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Icon,
  InlineStack,
  Layout,
  Link,
  List,
  Page,
  RadioButton,
  Select,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  CashDollarFilledIcon,
  ChartVerticalIcon,
  ChatIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DataTableIcon,
  LocationIcon,
} from "@shopify/polaris-icons";

type IntegrationItem = {
  id: string;
  icon: IconSource;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

type ActiveView = "list" | "sms-whatsapp";

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "sms-whatsapp",
    icon: ChatIcon,
    title: "SMS & WhatsApp Messages",
    description:
      "Send personalized order confirmations, abandoned cart reminders and verify customer phone numbers using SMS or WhatsApp.",
    buttonLabel: "SMS & WhatsApp Messages",
    href: "/settings?tab=whatsapp",
    imageSrc: "/images/messaging.png",
    imageAlt: "SMS and WhatsApp messaging illustration",
    imageWidth: 80,
    imageHeight: 80,
  },
  {
    id: "google-sheets",
    icon: DataTableIcon,
    title: "Google Sheets",
    description:
      "Connect your form to Google Sheets to save all orders data in a spreadsheet",
    buttonLabel: "Google Sheets",
    href: "/settings?tab=google-sheets",
    imageSrc: "/images/sheet.svg",
    imageAlt: "Google Sheets icon",
    imageWidth: 80,
    imageHeight: 80,
  },
  {
    id: "google-autocomplete",
    icon: LocationIcon,
    title: "Google Address Autocomplete",
    description:
      "Use Google Autocomplete on your COD form to improve address accuracy and boost conversion rates.",
    buttonLabel: "Google Autocomplete",
    href: "/settings?tab=general",
    imageSrc: "/images/maps.svg",
    imageAlt: "Google Maps location pin",
    imageWidth: 80,
    imageHeight: 80,
  },
];

const INITIAL_SMS_SERVICES = [
  {
    id: "otp",
    title: "Phone number Verification (OTP)",
    description:
      "Verify your customers phone numbers using a verification code. Avoid false orders and reduce delivery problems!",
    isActive: true,
    message: "Your verification code is {otp}",
  },
  {
    id: "order-confirmation",
    title: "Order confirmation Message",
    description:
      "Send a personalized order confirmation message to your customers.",
    isActive: false,
    message: "Thanks for your purchase from {shop_name} {order_url}",
  },
  {
    id: "shipping-confirmation",
    title: "Shipping Confirmation Message",
    description:
      "Inform your customers by SMS or WhatsApp when you ship their order.",
    isActive: false,
    message: "Your order has been shipped from {shop_name} - Track your order at {tracking_url}",
  },
  {
    id: "abandoned-cart",
    title: "Abandoned Cart Recovery",
    description:
      "Automatically recover your abandoned orders from the COD form with a personalized message.",
    isActive: false,
    message: "We noticed you left something in your cart at {shop_name}. Don't miss out, finish your purchase today! {recovery_url}",
  },
];

const SMS_PRICING_ROWS = [
  { label: "Phone Number Verification", price: "$0.0207" },
  { label: "Order / Shipping Confirmation", price: "$0.0207" },
  { label: "Abandoned Cart Recovery", price: "$0.0207" },
];

const WHATSAPP_PRICING_ROWS = [
  { label: "Phone Number Verification", price: "$0.0350" },
  { label: "Order / Shipping Confirmation", price: "$0.0320" },
  { label: "Abandoned Cart Recovery", price: "$0.0320" },
];

type Channel = "sms" | "whatsapp";

function SmsWhatsAppPage({ onBack }: { onBack: () => void }): ReactElement {
  const [topUpAmount, setTopUpAmount] = useState("5.00");
  const [channel, setChannel] = useState<Channel>("sms");
  const [services, setServices] = useState(INITIAL_SMS_SERVICES);
  const [personalizeOpen, setPersonalizeOpen] = useState<Record<string, boolean>>({});
  const [showOtpHelp, setShowOtpHelp] = useState(true);
  const [showAbandonedCartHelp, setShowAbandonedCartHelp] = useState(true);
  const [abandonedCartAutoOpen, setAbandonedCartAutoOpen] = useState(false);
  
  const [testPhone, setTestPhone] = useState("");
  const [otpSettings, setOtpSettings] = useState({
    verificationCode: "Verify your phone number to complete your order",
    description: "We've sent a verification code via {channel} to your phone number {phone}. Please enter the code below to verify your number and complete your order",
    verifyButton: "Verify",
    resend: "Resend code",
    changeNumber: "Change number",
    invalidCode: "The code you entered is invalid.",
    codeSent: "A new verification code has been sent to your mobile number.",
    resentAttempts: "You've exceeded the maximum number of attempts.",
    askBeforeCreating: false,
    maxAttempts: "3",
  });

  const toggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    );
  };

  const togglePersonalize = (id: string) => {
    setPersonalizeOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateServiceMessage = (id: string, newMessage: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, message: newMessage } : s)),
    );
  };

  const generatePreview = (text: string) => {
    return text
      .replace(/\{otp\}/g, "1234")
      .replace(/\{first_name\}/g, "John")
      .replace(/\{customer_name\}/g, "John")
      .replace(/\{checkout_url\}/g, "https://store.com/c/123")
      .replace(/\{shop_name\}/g, "Product Store")
      .replace(/\{order_url\}/g, "product-store-122417.myshopify.com/abc")
      .replace(/\{order_id\}/g, "#1001")
      .replace(/\{order_total\}/g, "$50.00")
      .replace(/\{tracking_number\}/g, "TRK123456789")
      .replace(/\{recovery_url\}/g, "product-store-122417.myshopify.com/abc");
  };

  const numericAmount = parseFloat(topUpAmount);
  const buttonLabel =
    !isNaN(numericAmount) && numericAmount > 0
      ? `Top up $${numericAmount.toFixed(2)}`
      : "Top up";

  const pricingRows =
    channel === "whatsapp" ? WHATSAPP_PRICING_ROWS : SMS_PRICING_ROWS;
  const pricingTitle =
    channel === "whatsapp" ? "Pricing - WhatsApp" : "Pricing - SMS";

  return (
    <Page
      backAction={{ content: "Integrations", onAction: onBack }}
      title="SMS & WhatsApp Messages"
    >
      <BlockStack gap="400">
        {/* Left: Balance + Channel | Right: Pricing */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--p-space-300)",
            alignItems: "stretch",
          }}
        >
          {/* Left column */}
          <BlockStack gap="200">
            <Card>
              <BlockStack gap="300" inlineAlign="center">
                <BlockStack gap="100" inlineAlign="center">
                  <Text
                    as="h2"
                    variant="headingLg"
                    fontWeight="bold"
                    alignment="center"
                  >
                    Remaining balance
                  </Text>
                  <Text
                    as="p"
                    variant="heading3xl"
                    alignment="center"
                    fontWeight="bold"
                  >
                    $1.000
                  </Text>
                </BlockStack>
                <Box paddingBlockStart="100" paddingBlockEnd="100" width="100%">
                  <Divider />
                </Box>
                <BlockStack gap="200" inlineAlign="center">
                  <Text
                    as="p"
                    variant="headingSm"
                    fontWeight="semibold"
                    alignment="center"
                  >
                    Top up your balance
                  </Text>
                  <div style={{ width: "180px" }}>
                    <TextField
                      label="Top-up amount"
                      labelHidden
                      value={topUpAmount}
                      prefix={<Icon source={CashDollarFilledIcon} />}
                      type="number"
                      min={0}
                      step={0.01}
                      autoComplete="off"
                      onChange={(value) => setTopUpAmount(value)}
                    />
                  </div>
                  <Button variant="primary">{buttonLabel}</Button>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd">
                  Select how you would like to message your customers:
                </Text>
                <Select
                  label="Channel"
                  labelInline
                  options={[
                    { label: "SMS", value: "sms" },
                    { label: "WhatsApp", value: "whatsapp" },
                  ]}
                  value={channel}
                  onChange={(value) => setChannel(value as Channel)}
                />
              </BlockStack>
            </Card>
          </BlockStack>

          {/* Right column — Pricing, stretches to match left column height */}
          <Card>
            <BlockStack gap="300">
              <Text
                as="h2"
                variant="headingLg"
                fontWeight="bold"
                alignment="center"
              >
                {pricingTitle}
              </Text>

              <Box borderWidth="025" borderColor="border" borderRadius="300">
                <Box
                  padding="200"
                  borderBlockEndWidth="025"
                  borderColor="border"
                >
                  <Select
                    label="Select country"
                    labelInline
                    options={[
                      { label: "United States", value: "us" },
                      { label: "Mexico", value: "mx" },
                    ]}
                    value="mx"
                    onChange={() => {}}
                  />
                </Box>
                {pricingRows.map((row, index) => (
                  <div
                    key={row.label}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 100px",
                      borderBottom:
                        index < pricingRows.length - 1
                          ? "1px solid var(--p-color-border)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        padding: "var(--p-space-200) var(--p-space-300)",
                        borderRight: "1px solid var(--p-color-border)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        {row.label}
                      </Text>
                    </div>
                    <div
                      style={{
                        padding: "var(--p-space-200) var(--p-space-300)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        {row.price}
                      </Text>
                    </div>
                  </div>
                ))}
              </Box>
              <List>
                <List.Item>
                  <strong>Cost-Effective:</strong> Pay only for messages that
                  are successfully queued by the carrier.
                </List.Item>
                <List.Item>
                  <strong>Reliable Delivery:</strong> Our premium phone numbers
                  ensure fast, secure, and spam-free communication.
                </List.Item>
                <List.Item>
                  <strong>Transparent Pricing:</strong> Enjoy competitive,
                  country-specific rates with no hidden fees.
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </div>

        {services.map((service) => (
          <Card key={service.id}>
            <BlockStack gap="300">
              <InlineStack
                align="space-between"
                blockAlign="start"
                wrap={false}
                gap="400"
              >
                <BlockStack gap="100" inlineAlign="start">
                  <InlineStack
                    gap="200"
                    blockAlign="center"
                    align="start"
                    wrap={false}
                  >
                    <Text as="h3" variant="headingMd" fontWeight="semibold">
                      {service.title}
                    </Text>
                    <Text
                      as="span"
                      variant="bodyMd"
                      tone={service.isActive ? "success" : "caution"}
                      fontWeight="bold"
                    >
                      {service.isActive ? "Activated" : "Deactivated"}
                    </Text>
                  </InlineStack>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {service.description}
                  </Text>
                </BlockStack>
                <InlineStack gap="200" blockAlign="center">
                  {service.isActive ? (
                    <Button
                      tone="critical"
                      onClick={() => toggleService(service.id)}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => toggleService(service.id)}
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    icon={personalizeOpen[service.id] ? ChevronUpIcon : ChevronDownIcon}
                    onClick={() => togglePersonalize(service.id)}
                  >
                    Personalize
                  </Button>
                </InlineStack>
              </InlineStack>
              <Divider />
              <InlineStack
                gap="200"
                blockAlign="center"
                align="start"
                wrap={false}
              >
                <div style={{ flexShrink: 0, display: "flex" }}>
                  <Icon source={ChartVerticalIcon} tone="subdued" />
                </div>
                <Text as="p" variant="bodySm" tone="subdued">
                  Last 30 days: Data not available yet. Check back after sending
                  the first message
                </Text>
              </InlineStack>

              {personalizeOpen[service.id] && (
                <>
                  <Divider />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "var(--p-space-800)",
                      alignItems: "start",
                      paddingTop: "var(--p-space-200)",
                    }}
                  >
                    {/* Left side: Message text */}
                    <div style={{
                      border: "1px solid var(--p-color-border)",
                      backgroundColor: "#FAFAFA",
                      borderRadius: "var(--p-border-radius-200)",
                      padding: "var(--p-space-400)",
                      height: "100%",
                    }}>
                      <BlockStack gap="300">
                        <Text as="p" variant="bodyMd">
                          Message text
                        </Text>
                      <TextField
                        label="Message text"
                        labelHidden
                        value={service.message}
                        onChange={(val) => updateServiceMessage(service.id, val)}
                        multiline={3}
                        maxLength={280}
                        showCharacterCount
                        autoComplete="off"
                      />
                      <BlockStack gap="200">
                        {service.id === "otp" && (
                          <div style={{ display: "flex", gap: "var(--p-space-200)" }}>
                            <Text as="span" variant="bodySm">•</Text>
                            <Text as="span" variant="bodySm">
                              <strong>{`{otp}`}</strong> to insert the verification code (required).
                            </Text>
                          </div>
                        )}
                        {service.id === "order-confirmation" && (
                          <>
                            <div style={{ display: "flex", gap: "var(--p-space-200)" }}>
                              <Text as="span" variant="bodySm">•</Text>
                              <Text as="span" variant="bodySm">
                                <strong>{`{order_id}`}</strong> to insert the order number.
                              </Text>
                            </div>
                            <div style={{ display: "flex", gap: "var(--p-space-200)" }}>
                              <Text as="span" variant="bodySm">•</Text>
                              <Text as="span" variant="bodySm">
                                <strong>{`{order_url}`}</strong> to insert the order thank you page link.
                              </Text>
                            </div>
                            <div style={{ display: "flex", gap: "var(--p-space-200)" }}>
                              <Text as="span" variant="bodySm">•</Text>
                              <Text as="span" variant="bodySm">
                                <strong>{`{customer_name}`}</strong> to insert the customer's name.
                              </Text>
                            </div>
                            <div style={{ display: "flex", gap: "var(--p-space-200)" }}>
                              <Text as="span" variant="bodySm">•</Text>
                              <Text as="span" variant="bodySm">
                                <strong>{`{order_total}`}</strong> to insert the order total.
                              </Text>
                            </div>
                          </>
                        )}
                        {service.id === "shipping-confirmation" && (
                          <>
                            <div style={{ display: "flex", gap: "var(--p-space-200)" }}>
                              <Text as="span" variant="bodySm">•</Text>
                              <Text as="span" variant="bodySm">
                                <strong>{`{tracking_number}`}</strong> to insert the tracking number.
                              </Text>
                            </div>
                            <div style={{ display: "flex", gap: "var(--p-space-200)" }}>
                              <Text as="span" variant="bodySm">•</Text>
                              <Text as="span" variant="bodySm">
                                <strong>{`{tracking_url}`}</strong> to insert the url to track the shipment.
                              </Text>
                            </div>
                            <div style={{ display: "flex", gap: "var(--p-space-200)" }}>
                              <Text as="span" variant="bodySm">•</Text>
                              <Text as="span" variant="bodySm">
                                <strong>{`{customer_name}`}</strong> to insert the customer's name.
                              </Text>
                            </div>
                            <div style={{ display: "flex", gap: "var(--p-space-200)" }}>
                              <Text as="span" variant="bodySm">•</Text>
                              <Text as="span" variant="bodySm">
                                <strong>{`{order_id}`}</strong> to insert the order number.
                              </Text>
                            </div>
                          </>
                        )}
                        {service.id === "abandoned-cart" && (
                          <>
                            <div style={{ display: "flex", gap: "var(--p-space-200)" }}>
                              <Text as="span" variant="bodySm">•</Text>
                              <Text as="span" variant="bodySm">
                                <strong>{`{recovery_url}`}</strong> to insert the recovery link (required).
                              </Text>
                            </div>
                            <Box paddingBlockStart="200">
                              <Checkbox
                                label="Automatically open the form when recovery link is clicked."
                                checked={abandonedCartAutoOpen}
                                onChange={setAbandonedCartAutoOpen}
                              />
                            </Box>
                          </>
                        )}
                        <Text as="p" variant="bodySm" tone="subdued">
                          <strong>Important:</strong> Links are not allowed within the text of the message. Messages longer than 140 characters (English alphabet) and 70 characters (other alphabets) will be subject to higher costs.
                        </Text>
                      </BlockStack>
                    </BlockStack>
                    </div>

                    {/* Right side: Preview */}
                    <BlockStack gap="400">
                      <div style={{
                        backgroundColor: "var(--p-color-bg-surface-secondary)",
                        borderRadius: "var(--p-border-radius-200)",
                        padding: "var(--p-space-600)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "var(--p-space-400)",
                        height: "100%"
                      }}>
                        <Text as="p" variant="bodyMd" alignment="center">
                          Preview
                        </Text>
                        <div style={{
                          backgroundColor: "#000",
                          borderRadius: "16px",
                          padding: "var(--p-space-400)",
                          width: "100%",
                          maxWidth: "320px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "var(--p-space-200)",
                          boxShadow: "var(--p-shadow-100)"
                        }}>
                          <div style={{
                            backgroundColor: "#007AFF",
                            color: "white",
                            padding: "10px 14px",
                            borderRadius: "18px",
                            borderBottomLeftRadius: "4px",
                            alignSelf: "flex-start",
                            maxWidth: "85%",
                            wordBreak: "break-word"
                          }}>
                            <Text as="p" variant="bodyMd">
                              {generatePreview(service.message)}
                            </Text>
                          </div>
                          <Text as="span" variant="bodySm" tone="subdued" alignment="start">
                            <span style={{ color: "#8E8E93", fontSize: "11px" }}>12:42 AM</span>
                          </Text>
                        </div>
                      </div>
                      
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="medium">Test Message</Text>
                        <InlineStack gap="200" wrap={false}>
                          <div style={{ flexGrow: 1 }}>
                            <TextField
                              label="Test phone number"
                              labelHidden
                              placeholder="Test phone number, Ex: +000000000000"
                              value={testPhone}
                              onChange={setTestPhone}
                              autoComplete="off"
                            />
                          </div>
                          <Button disabled={!testPhone}>Send</Button>
                        </InlineStack>
                      </BlockStack>
                    </BlockStack>
                  </div>
                  
                  {service.id === "otp" && (
                    <>
                      <Box paddingBlockStart="600" paddingBlockEnd="400">
                        <Divider />
                      </Box>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "var(--p-space-800)",
                          alignItems: "start",
                        }}
                      >
                        {/* Left side: OTP Pop-up text config */}
                        <div style={{
                          border: "1px solid var(--p-color-border)",
                          backgroundColor: "#FAFAFA",
                          borderRadius: "var(--p-border-radius-200)",
                          padding: "var(--p-space-400)",
                          height: "100%",
                        }}>
                          <BlockStack gap="400">
                            <Text as="h3" variant="headingMd" fontWeight="bold">
                              OTP Pop-up text
                            </Text>
                          <BlockStack gap="300">
                            <TextField
                              label="Verification code"
                              value={otpSettings.verificationCode}
                              onChange={(val) => setOtpSettings({ ...otpSettings, verificationCode: val })}
                              autoComplete="off"
                            />
                            <BlockStack gap="100">
                              <TextField
                                label="Description"
                                value={otpSettings.description}
                                onChange={(val) => setOtpSettings({ ...otpSettings, description: val })}
                                multiline={3}
                                autoComplete="off"
                              />
                              <Text as="p" variant="bodySm" tone="subdued">
                                Use {`{phone}`} to insert the customer's phone number and {`{channel}`} to insert the channel (SMS or WhatsApp).
                              </Text>
                            </BlockStack>
                            <TextField
                              label="Verify button"
                              value={otpSettings.verifyButton}
                              onChange={(val) => setOtpSettings({ ...otpSettings, verifyButton: val })}
                              autoComplete="off"
                            />
                            <TextField
                              label="Resend"
                              value={otpSettings.resend}
                              onChange={(val) => setOtpSettings({ ...otpSettings, resend: val })}
                              autoComplete="off"
                            />
                            <TextField
                              label="Change number"
                              value={otpSettings.changeNumber}
                              onChange={(val) => setOtpSettings({ ...otpSettings, changeNumber: val })}
                              autoComplete="off"
                            />
                            <TextField
                              label="Invalid code message"
                              value={otpSettings.invalidCode}
                              onChange={(val) => setOtpSettings({ ...otpSettings, invalidCode: val })}
                              autoComplete="off"
                            />
                            <TextField
                              label="Code sent message text"
                              value={otpSettings.codeSent}
                              onChange={(val) => setOtpSettings({ ...otpSettings, codeSent: val })}
                              autoComplete="off"
                            />
                            <TextField
                              label="Resent attempts exceeded message"
                              value={otpSettings.resentAttempts}
                              onChange={(val) => setOtpSettings({ ...otpSettings, resentAttempts: val })}
                              autoComplete="off"
                            />
                            
                            <Box paddingBlockStart="200">
                              <BlockStack gap="400">
                                <Checkbox
                                  label="Ask for OTP verification before creating the order"
                                  helpText="Order will only be created after the customer verifies his phone number."
                                  checked={otpSettings.askBeforeCreating}
                                  onChange={(val) => setOtpSettings({ ...otpSettings, askBeforeCreating: val })}
                                />
                                <BlockStack gap="200">
                                  <Text as="p" variant="bodyMd">Maximum number of attempts?</Text>
                                  <InlineStack gap="400">
                                    {["1", "2", "3", "4", "5"].map((num) => (
                                      <RadioButton
                                        key={num}
                                        label={num}
                                        checked={otpSettings.maxAttempts === num}
                                        id={`attempt-${num}`}
                                        name="maxAttempts"
                                        onChange={() => setOtpSettings({ ...otpSettings, maxAttempts: num })}
                                      />
                                    ))}
                                  </InlineStack>
                                </BlockStack>
                              </BlockStack>
                            </Box>
                          </BlockStack>
                        </BlockStack>
                        </div>

                        {/* Right side: OTP Preview */}
                        <div style={{
                          backgroundColor: "var(--p-color-bg-surface-secondary)",
                          borderRadius: "var(--p-border-radius-200)",
                          padding: "var(--p-space-600)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "var(--p-space-400)",
                          position: "sticky",
                          top: "20px"
                        }}>
                          <Text as="p" variant="bodyMd" alignment="center">Preview</Text>
                          <div style={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            padding: "var(--p-space-800) var(--p-space-600)",
                            width: "100%",
                            maxWidth: "400px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "var(--p-space-500)",
                            boxShadow: "var(--p-shadow-200)"
                          }}>
                            {/* Blue circle with check */}
                            <div style={{
                              width: "72px",
                              height: "72px",
                              borderRadius: "50%",
                              backgroundColor: "#3b82f6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white"
                            }}>
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>

                            <BlockStack gap="200" inlineAlign="center">
                              <Text as="h2" variant="headingXl" alignment="center" fontWeight="bold">
                                {otpSettings.verificationCode}
                              </Text>
                              <Text as="p" variant="bodyLg" tone="subdued" alignment="center">
                                {otpSettings.description.replace("{channel}", "SMS").replace("{phone}", "+1234567890")}
                              </Text>
                            </BlockStack>

                            {/* Change number pill */}
                            <div style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "6px 16px",
                              backgroundColor: "#EFF6FF",
                              borderRadius: "16px",
                              color: "#2563EB",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                              </svg>
                              +1234567890
                            </div>

                            {/* OTP Inputs */}
                            <InlineStack gap="300" align="center">
                              {[1, 2, 3, 4].map((i) => (
                                <div key={i} style={{
                                  width: "56px",
                                  height: "56px",
                                  borderRadius: "10px",
                                  border: "1px solid var(--p-color-border)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "white"
                                }}>
                                </div>
                              ))}
                            </InlineStack>

                            <div style={{ width: "100%", marginTop: "16px" }}>
                              <BlockStack gap="400" inlineAlign="center">
                                <button style={{
                                  width: "100%",
                                  padding: "16px",
                                  backgroundColor: "#3b82f6",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  cursor: "pointer"
                                }}>
                                  {otpSettings.verifyButton}
                                </button>
                                <button style={{
                                  background: "none",
                                  border: "none",
                                  color: "#3b82f6",
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  cursor: "pointer"
                                }}>
                                  {otpSettings.resend}
                                </button>
                              </BlockStack>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Alert / Info Box */}
                      {showOtpHelp && (
                        <div style={{
                          marginTop: "var(--p-space-800)",
                          borderRadius: "var(--p-border-radius-300)",
                          overflow: "hidden",
                          border: "1px solid var(--p-color-border)",
                          backgroundColor: "white",
                          boxShadow: "var(--p-shadow-100)"
                        }}>
                          {/* Header */}
                          <div style={{
                            backgroundColor: "#93C5FD", // light blue header
                            padding: "var(--p-space-300) var(--p-space-400)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--p-space-200)" }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                              </svg>
                              <Text as="h3" variant="headingMd" fontWeight="semibold">
                                How OTP Verification Works?
                              </Text>
                            </div>
                            <button 
                              onClick={() => setShowOtpHelp(false)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "4px",
                                color: "inherit"
                              }}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                          {/* Body */}
                          <div style={{ padding: "var(--p-space-400) var(--p-space-600)" }}>
                            <BlockStack gap="400">
                              <div style={{ display: "flex", gap: "8px" }}>
                                <span style={{ fontSize: "16px", marginTop: "-2px" }}>•</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <Text as="p" variant="bodyMd">
                                    <strong>Step 1- Order placed</strong>
                                  </Text>
                                  <Text as="p" variant="bodyMd" tone="subdued">Customers place an order through the form</Text>
                                </div>
                              </div>
                              
                              <div style={{ display: "flex", gap: "8px" }}>
                                <span style={{ fontSize: "16px", marginTop: "-2px" }}>•</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <Text as="p" variant="bodyMd">
                                    <strong>Step 2- App sends OTP to customer via SMS / WhatsApp</strong>
                                  </Text>
                                  <Text as="p" variant="bodyMd" tone="subdued">Unique 4 digits code is sent to customer's mobile number.</Text>
                                </div>
                              </div>

                              <div style={{ display: "flex", gap: "8px" }}>
                                <span style={{ fontSize: "16px", marginTop: "-2px" }}>•</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <Text as="p" variant="bodyMd">
                                    <strong>Step 3- OTP Pop-up appears</strong>
                                  </Text>
                                  <Text as="p" variant="bodyMd" tone="subdued">Customer enters the code and clicks verify.</Text>
                                </div>
                              </div>

                              <div style={{ display: "flex", gap: "8px" }}>
                                <span style={{ fontSize: "16px", marginTop: "-2px" }}>•</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <Text as="p" variant="bodyMd">
                                    <strong>Step 4- Order is marked as verified</strong>
                                  </Text>
                                  <Text as="p" variant="bodyMd" tone="subdued">The app will add <strong>BUYEASE_VERIFIED</strong> tag to the order.</Text>
                                </div>
                              </div>
                            </BlockStack>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {service.id === "abandoned-cart" && (
                    <>
                      {showAbandonedCartHelp && (
                        <div style={{
                          marginTop: "var(--p-space-400)",
                          borderRadius: "var(--p-border-radius-300)",
                          overflow: "hidden",
                          border: "1px solid #93C5FD",
                          backgroundColor: "white",
                          boxShadow: "var(--p-shadow-100)"
                        }}>
                          {/* Header */}
                          <div style={{
                            backgroundColor: "#93C5FD",
                            padding: "var(--p-space-300) var(--p-space-400)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--p-space-200)" }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                              </svg>
                              <Text as="h3" variant="headingMd" fontWeight="bold">
                                How it works?
                              </Text>
                            </div>
                            <button 
                              onClick={() => setShowAbandonedCartHelp(false)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "4px",
                                color: "inherit"
                              }}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                          {/* Body */}
                          <div style={{ padding: "var(--p-space-400) var(--p-space-600)" }}>
                            <BlockStack gap="200">
                              <div style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                                <span style={{ fontSize: "16px", marginTop: "2px" }}>•</span>
                                <Text as="p" variant="bodyMd">The message is sent 15 minutes after your customers leave their order.</Text>
                              </div>
                              <div style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                                <span style={{ fontSize: "16px", marginTop: "2px" }}>•</span>
                                <Text as="p" variant="bodyMd">The recovery link will open the same page where the order is abandoned and information will be pre-filled.</Text>
                              </div>
                              <div style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                                <span style={{ fontSize: "16px", marginTop: "2px" }}>•</span>
                                <Text as="p" variant="bodyMd">The message will only be sent if the customer has granted permission for marketing communications by ticking the box on the form.</Text>
                              </div>
                              <div style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                                <span style={{ fontSize: "16px", marginTop: "2px" }}>•</span>
                                <Text as="p" variant="bodyMd">If the SMS is sent successfully the tag 'easysell-recovery-message-sent' will be added to the draft order.</Text>
                              </div>
                              <div style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                                <span style={{ fontSize: "16px", marginTop: "2px" }}>•</span>
                                <Text as="p" variant="bodyMd">
                                  Find the list of successfully sent messages <Link url="#">here</Link> and the recovered orders <Link url="#">here</Link>
                                </Text>
                              </div>
                              <div style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                                <span style={{ fontSize: "16px", marginTop: "2px" }}>•</span>
                                <Link url="#">How to add marketing checkbox?</Link>
                              </div>
                            </BlockStack>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </BlockStack>
          </Card>
        ))}

        <Card>
          <TextField
            label="Store name for Messages"
            value="Product Store"
            helpText="This will be used in the message as the store name."
            autoComplete="off"
            onChange={() => {}}
          />
        </Card>

        <InlineStack align="center">
          <Text as="p" variant="bodyMd">
            Learn more about{" "}
            <Link url="#" target="_blank">
              SMS & WhatsApp Messages
            </Link>
          </Text>
        </InlineStack>
      </BlockStack>
    </Page>
  );
}

export function IntegrationsPageContent(): ReactElement {
  const [activeView, setActiveView] = useState<ActiveView>("list");
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "sms-whatsapp" || params.get("tab") === "whatsapp") {
      setActiveView("sms-whatsapp");
    }
    setIsHydrating(false);
  }, []);

  if (isHydrating) {
    return (
      <SkeletonPage title="Integrations & Messaging">
        <BlockStack gap="400">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <InlineStack
                align="space-between"
                blockAlign="center"
                gap="600"
                wrap={false}
              >
                <BlockStack gap="300" inlineAlign="start" style={{ flexGrow: 1 }}>
                  <InlineStack gap="200" align="start" blockAlign="center">
                    <div style={{ width: "20px", height: "20px", backgroundColor: "var(--p-color-bg-surface-secondary)", borderRadius: "4px" }} />
                    <SkeletonDisplayText size="small" />
                  </InlineStack>
                  <SkeletonBodyText lines={2} />
                  <div style={{ width: "120px", height: "32px", backgroundColor: "var(--p-color-bg-surface-secondary)", borderRadius: "var(--p-border-radius-200)", marginTop: "4px" }} />
                </BlockStack>
                <div style={{ width: "80px", height: "80px", backgroundColor: "var(--p-color-bg-surface-secondary)", borderRadius: "var(--p-border-radius-200)", flexShrink: 0 }} />
              </InlineStack>
            </Card>
          ))}
        </BlockStack>
      </SkeletonPage>
    );
  }

  const handleSetActiveView = (view: ActiveView) => {
    setActiveView(view);
    const url = new URL(window.location.href);
    if (view === "sms-whatsapp") {
      url.searchParams.set("view", "sms-whatsapp");
    } else {
      url.searchParams.delete("view");
      url.searchParams.delete("tab");
    }
    window.history.replaceState({}, "", url.toString());
  };

  if (activeView === "sms-whatsapp") {
    return <SmsWhatsAppPage onBack={() => handleSetActiveView("list")} />;
  }

  return (
    <Page title="Integrations & Messaging">
      <BlockStack gap="400">
        {INTEGRATIONS.map((item) => (
          <Card key={item.id}>
            <InlineStack
              align="space-between"
              blockAlign="center"
              gap="600"
              wrap={false}
            >
              <BlockStack gap="300" inlineAlign="start">
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Icon source={item.icon} />
                  <Text as="h2" variant="headingMd" fontWeight="semibold">
                    {item.title}
                  </Text>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  {item.description}
                </Text>
                <div>
                  {item.id === "sms-whatsapp" ? (
                    <Button
                      icon={item.icon}
                      variant="primary"
                      onClick={() => handleSetActiveView("sms-whatsapp")}
                    >
                      {item.buttonLabel}
                    </Button>
                  ) : (
                    <Button icon={item.icon} url={item.href} variant="primary">
                      {item.buttonLabel}
                    </Button>
                  )}
                </div>
              </BlockStack>
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                width={item.imageWidth}
                height={item.imageHeight}
                style={{
                  display: "block",
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
            </InlineStack>
          </Card>
        ))}
      </BlockStack>
    </Page>
  );
}
