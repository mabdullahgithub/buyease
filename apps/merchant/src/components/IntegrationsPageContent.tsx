"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useShopifyBridge } from "@/lib/use-shopify-bridge";
import type { ReactElement } from "react";
import type { IconSource } from "@shopify/polaris";
import Image from "next/image";
import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Icon,
  InlineStack,
  InlineGrid,
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
  AlertCircleIcon,
  CashDollarFilledIcon,
  ChartVerticalIcon,
  ChatIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DataTableIcon,
  ExternalIcon,
  LocationIcon,
  RefreshIcon,
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

type ActiveView = "list" | "sms-whatsapp" | "google-sheets";

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

// ── Google Sheets helpers ────────────────────────────────────────────────────

type SheetsStatus =
  | { connected: false }
  | {
      connected: true;
      email: string;
      spreadsheetId: string | null;
      spreadsheetUrl: string | null;
      sheetName: string;
      isEnabled: boolean;
      lastSyncAt: string | null;
      lastSyncError: string | null;
    };

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function GoogleGIcon(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GoogleSheetsPage({ onBack }: { onBack: () => void }): ReactElement {
  const shopify = useShopifyBridge();
  const [status, setStatus] = useState<SheetsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isLoadingTabs, setIsLoadingTabs] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [sheetsError, setSheetsError] = useState("");
  const [tabsError, setTabsError] = useState("");
  const [needsReauth, setNeedsReauth] = useState(false);
  const [needsDriveApiEnabled, setNeedsDriveApiEnabled] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Orders");
  const [isEnabled, setIsEnabled] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<{ id: string; name: string }[]>([]);
  const [availableTabs, setAvailableTabs] = useState<string[]>([]);
  const [tabsLoaded, setTabsLoaded] = useState(false);
  const [connectedSheetTitle, setConnectedSheetTitle] = useState<string | null>(null);
  const bearerRef = useRef<string | null>(null);

  // Accordion state
  const [step1Open, setStep1Open] = useState(false);
  const [step2Open, setStep2Open] = useState(true);
  const [step3Open, setStep3Open] = useState(true);
  const [sheetMode, setSheetMode] = useState<"new" | "existing">("new");
  const [existingSheetUrl, setExistingSheetUrl] = useState("");
  const [singleRowPerOrder, setSingleRowPerOrder] = useState(true);
  const [insertAtTop, setInsertAtTop] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const FIELD_OPTIONS = [
    { label: "Select a field", value: "" },
    { label: "Order Number", value: "order_number" },
    { label: "Customer Name", value: "customer_name" },
    { label: "Phone", value: "phone" },
    { label: "Email", value: "email" },
    { label: "Total Price", value: "total_price" },
    { label: "Payment Status", value: "payment_status" },
    { label: "Fulfillment Status", value: "fulfillment_status" },
    { label: "Created At", value: "created_at" },
    { label: "Shipping Address", value: "shipping_address" },
    { label: "Line Items", value: "line_items" },
    { label: "Tags", value: "tags" },
    { label: "Note", value: "note" },
  ];
  const [selectedFields, setSelectedFields] = useState<string[]>(["", "", "", "", "", ""]);
  const updateField = (index: number, value: string): void => {
    setSelectedFields((prev) => { const next = [...prev]; next[index] = value; return next; });
  };

  const getBearer = useCallback(async (): Promise<string> => {
    if (bearerRef.current) return bearerRef.current;
    const w = window as Window & { shopify?: { idToken?: () => Promise<string> } };
    const token = (await w.shopify?.idToken?.()) ?? "";
    bearerRef.current = token;
    return token;
  }, []);

  const fetchSpreadsheets = useCallback(async (bearer: string): Promise<void> => {
    setIsLoadingSheets(true);
    setSheetsError("");
    setNeedsReauth(false);
    setNeedsDriveApiEnabled(false);
    try {
      const res = await fetch("/api/google/spreadsheets", { headers: { Authorization: `Bearer ${bearer}` } });
      const data = (await res.json()) as { spreadsheets?: { id: string; name: string }[]; error?: string; needsReauth?: boolean; needsDriveApiEnabled?: boolean };
      if (!res.ok || data.error) {
        if (data.needsDriveApiEnabled) setNeedsDriveApiEnabled(true);
        else if (data.needsReauth) setNeedsReauth(true);
        setSheetsError(data.error ?? "Could not load spreadsheets.");
      } else {
        setAvailableSheets(data.spreadsheets ?? []);
      }
    } catch { setSheetsError("Network error loading spreadsheets."); }
    finally { setIsLoadingSheets(false); }
  }, []);

  const fetchStatus = useCallback(async (): Promise<void> => {
    try {
      const token = await getBearer();
      const res = await fetch("/api/google/status", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as SheetsStatus;
      setStatus(data);
      if (data.connected) {
        setSpreadsheetId(data.spreadsheetId ?? "");
        setSheetName(data.sheetName);
        setIsEnabled(data.isEnabled);
        setConnectedSheetTitle(data.sheetName ?? null);
        if (data.spreadsheetId && data.sheetName) { setAvailableTabs([data.sheetName]); setTabsLoaded(true); }
        void fetchSpreadsheets(token);
      }
    } catch { setStatus({ connected: false }); }
    finally { setIsLoading(false); }
  }, [getBearer, fetchSpreadsheets]);

  useEffect(() => {
    void fetchStatus();
    const handler = (event: MessageEvent<unknown>): void => {
      if (event.data && typeof event.data === "object" && (event.data as Record<string, unknown>).type === "BUYEASE_GOOGLE_CONNECTED") {
        setIsLoading(true);
        void fetchStatus();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [fetchStatus]);

  const handleConnectGoogle = useCallback(async (): Promise<void> => {
    setSaveError("");
    const token = await getBearer();
    const res = await fetch("/api/google/connect", { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { const body = (await res.json().catch(() => ({}))) as { error?: string }; setSaveError(body.error ?? "Google OAuth is not configured."); return; }
    const { authUrl } = (await res.json()) as { authUrl: string };
    window.open(authUrl, "buyease-google-oauth", "width=560,height=680,left=200,top=100");
  }, [getBearer]);

  const handleSelectSpreadsheet = useCallback(async (id: string): Promise<void> => {
    setSpreadsheetId(id); setTabsLoaded(false); setAvailableTabs([]); setTabsError("");
    if (!id) return;
    setIsLoadingTabs(true);
    try {
      const token = await getBearer();
      const res = await fetch(`/api/google/sheet-tabs?spreadsheetId=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = (await res.json()) as { tabs?: string[]; error?: string };
      if (!res.ok || data.error) { setTabsError(data.error ?? "Could not load sheet tabs."); }
      else { const tabs = data.tabs ?? ["Orders"]; setAvailableTabs(tabs); setTabsLoaded(true); setSheetName(tabs[0] ?? "Orders"); }
    } catch { setTabsError("Network error loading tabs."); }
    finally { setIsLoadingTabs(false); }
  }, [getBearer]);

  const handleRefreshTabs = useCallback(async (): Promise<void> => {
    if (!spreadsheetId) return;
    setIsLoadingTabs(true); setTabsError("");
    try {
      const token = await getBearer();
      const res = await fetch(`/api/google/sheet-tabs?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = (await res.json()) as { tabs?: string[]; error?: string };
      if (!res.ok || data.error) { setTabsError(data.error ?? "Could not load sheet tabs."); }
      else { const tabs = data.tabs ?? ["Orders"]; setAvailableTabs(tabs); setTabsLoaded(true); if (!tabs.includes(sheetName)) setSheetName(tabs[0] ?? "Orders"); }
    } catch { setTabsError("Network error loading tabs."); }
    finally { setIsLoadingTabs(false); }
  }, [getBearer, spreadsheetId, sheetName]);

  const handleSave = useCallback(async (): Promise<void> => {
    setSaveError(""); setIsSaving(true);
    try {
      const token = await getBearer();
      const res = await fetch("/api/google/configure-sheet", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ spreadsheetId, sheetName, isEnabled }) });
      const data = (await res.json()) as { ok?: boolean; error?: string; spreadsheetTitle?: string };
      if (!res.ok || data.error) { setSaveError(data.error ?? "Failed to save settings."); }
      else {
        const name = data.spreadsheetTitle ?? availableSheets.find((s) => s.id === spreadsheetId)?.name ?? spreadsheetId;
        setConnectedSheetTitle(name);
        shopify.toast.show(`Connected to "${name}"`);
        await fetchStatus();
      }
    } catch { setSaveError("Network error. Please try again."); }
    finally { setIsSaving(false); }
  }, [getBearer, spreadsheetId, sheetName, isEnabled, availableSheets, fetchStatus, shopify]);

  const handleNext = useCallback(async (): Promise<void> => {
    setSaveError(""); setIsSaving(true);
    try {
      const token = await getBearer();
      if (sheetMode === "new") {
        const res = await fetch("/api/google/create-spreadsheet", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as { ok?: boolean; spreadsheetId?: string; spreadsheetTitle?: string; spreadsheetUrl?: string; error?: string };
        if (!res.ok || data.error) {
          setSaveError(data.error ?? "Failed to create spreadsheet.");
        } else {
          const title = data.spreadsheetTitle ?? "BuyEase Orders";
          setConnectedSheetTitle(title);
          shopify.toast.show(`Sheet "${title}" created and connected!`);
          setStep2Open(false);
          setStep3Open(true);
          await fetchStatus();
        }
      } else {
        let idToUse = spreadsheetId.trim();
        if (!idToUse && existingSheetUrl.trim()) {
          idToUse = existingSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? existingSheetUrl.trim();
        }
        if (!idToUse) { setSaveError("Please select a spreadsheet or paste a Google Sheets link."); setIsSaving(false); return; }
        const res = await fetch("/api/google/configure-sheet", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ spreadsheetId: idToUse, sheetName: "Orders", isEnabled: true }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string; spreadsheetTitle?: string };
        if (!res.ok || data.error) {
          setSaveError(data.error ?? "Failed to connect spreadsheet.");
        } else {
          const title = data.spreadsheetTitle ?? idToUse;
          setConnectedSheetTitle(title);
          shopify.toast.show(`Connected to "${title}"`);
          setStep2Open(false);
          setStep3Open(true);
          await fetchStatus();
        }
      }
    } catch { setSaveError("Network error. Please try again."); }
    finally { setIsSaving(false); }
  }, [getBearer, sheetMode, spreadsheetId, existingSheetUrl, fetchStatus, shopify]);

  const handleExport = useCallback(async (): Promise<void> => {
    setIsExporting(true);
    try {
      const token = await getBearer();
      const res = await fetch("/api/google/export", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = (await res.json()) as { ok?: boolean; count?: number; error?: string };
      if (!res.ok || data.error) {
        shopify.toast.show(`Export failed: ${data.error ?? "Unknown error"}`);
      } else {
        shopify.toast.show(`${data.count ?? 0} orders exported successfully`);
        await fetchStatus();
      }
    } catch { shopify.toast.show("Network error during export"); }
    finally { setIsExporting(false); }
  }, [getBearer, fetchStatus, shopify]);

  const handleDisconnect = useCallback(async (): Promise<void> => {
    setIsDisconnecting(true);
    try {
      const token = await getBearer();
      await fetch("/api/google/disconnect", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      setStatus({ connected: false }); setSpreadsheetId(""); setSheetName("Orders"); setIsEnabled(false);
      setSaveError(""); setAvailableSheets([]); setAvailableTabs([]); setTabsLoaded(false);
      setNeedsReauth(false); setNeedsDriveApiEnabled(false); setConnectedSheetTitle(null);
      shopify.toast.show("Google account disconnected");
    } catch { /* non-critical */ }
    finally { setIsDisconnecting(false); }
  }, [getBearer]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const renderContent = (): ReactElement => {
    if (isLoading) {
      return (
        <BlockStack gap="400">
          <Card><BlockStack gap="400"><SkeletonBodyText lines={4} /></BlockStack></Card>
          <Card><BlockStack gap="400"><SkeletonBodyText lines={6} /></BlockStack></Card>
        </BlockStack>
      );
    }

    if (!status?.connected) {
      return (
        <Card>
          <Box paddingBlock="1200" paddingInline="600">
            <BlockStack gap="600" inlineAlign="center">
              <InlineGrid columns={{ xs: 1, md: 2 }} gap="800" alignItems="center">
                {/* Left: Steps */}
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd" fontWeight="bold">
                    Export store orders to Google Sheet in real time
                  </Text>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">1. Click the button to sign in and link your Google Account.</Text>
                    <Text as="p" variant="bodyMd">2. Choose what data to export to Google Sheet.</Text>
                    <Text as="p" variant="bodyMd">3. Your store orders will be synchronized in real time.</Text>
                  </BlockStack>
                  {saveError && (
                    <Banner tone="critical" onDismiss={() => setSaveError("")}>
                      <Text as="p" variant="bodyMd">{saveError}</Text>
                    </Banner>
                  )}
                </BlockStack>

                {/* Right: Icons + Button */}
                <BlockStack gap="1000" inlineAlign="center">
                  <InlineStack align="center" blockAlign="center" gap="800">
                    <BlockStack align="center" inlineAlign="center" gap="300">
                      <div style={{ width: "96px", height: "96px", position: "relative" }}>
                        <Image src="/images/store.png" alt="Store Orders" fill style={{ objectFit: "contain" }} />
                      </div>
                      <Text as="h2" variant="headingMd" fontWeight="semibold">Store Orders</Text>
                    </BlockStack>
                    <div style={{ width: "32px", height: "32px", color: "#202223", transform: "rotate(45deg)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                    </div>
                    <BlockStack align="center" inlineAlign="center" gap="300">
                      <div style={{ width: "96px", height: "96px", position: "relative" }}>
                        <Image src="/images/sheet.svg" alt="Google Sheets" fill style={{ objectFit: "contain" }} />
                      </div>
                      <Text as="h2" variant="headingMd" fontWeight="semibold">Google Sheets</Text>
                    </BlockStack>
                  </InlineStack>

                  <button
                    type="button"
                    onClick={() => void handleConnectGoogle()}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "10px 24px", marginTop: "16px", backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "100px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)", transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FAFAFA"; e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.transform = "none"; }}
                  >
                    <GoogleGIcon />
                    <span style={{ fontWeight: 600, fontSize: "15px", display: "flex", gap: "4px" }}>
                      <span style={{ color: "#4285F4" }}>Sign</span>
                      <span style={{ color: "#EA4335" }}>in</span>
                      <span style={{ color: "#FBBC05" }}>with</span>
                      <span style={{ color: "#34A853" }}>Google</span>
                    </span>
                  </button>
                </BlockStack>
              </InlineGrid>

              <div style={{ maxWidth: 540, width: "100%" }}>
                <div style={{ backgroundColor: "#FEF3C7", borderRadius: 8, padding: "14px 16px" }}>
                  <InlineStack gap="200" blockAlign="start" wrap={false}>
                    <Icon source={AlertCircleIcon} tone="caution" />
                    <Text as="p" variant="bodySm">
                      <Text as="span" fontWeight="bold">Important:</Text>{" "}
                      When signing in, tick both checkboxes to grant BuyEase access to your Google Sheets.
                    </Text>
                  </InlineStack>
                </div>
              </div>
            </BlockStack>
          </Box>
        </Card>
      );
    }

    // ── Connected view — accordion steps ────────────────────────────────────
    const connectedStatus = status;

    const stepHeaderStyle: React.CSSProperties = {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px", cursor: "pointer", userSelect: "none",
    };
    const stepCardStyle: React.CSSProperties = {
      border: "1px solid #E1E3E5", borderRadius: "12px", background: "#fff", overflow: "hidden",
    };
    const completedBadge = (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#008060", fontWeight: 600, fontSize: 13 }}>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#008060"/><path d="M5 10.5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Completed
      </span>
    );
    const pendingBadge = (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#916A00", fontWeight: 600, fontSize: 13 }}>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#916A00" strokeWidth="2"/><path d="M10 5v5.5l3 2" stroke="#916A00" strokeWidth="2" strokeLinecap="round"/></svg>
        Pending
      </span>
    );
    const chevronDown = <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="#6D7175" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    const chevronRight = <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M8 5l5 5-5 5" stroke="#6D7175" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    const sheetCompleted = !!spreadsheetId && tabsLoaded;

    return (
      <BlockStack gap="400">
        {/* Error banners */}
        {needsDriveApiEnabled && (
          <Banner title="Google Drive API not enabled" tone="critical">
            <Text as="p" variant="bodyMd">
              Go to <Link url="https://console.cloud.google.com/apis/library/drive.googleapis.com" external>Google Cloud Console</Link> and enable the Drive API, then refresh.
            </Text>
          </Banner>
        )}
        {needsReauth && !needsDriveApiEnabled && (
          <Banner title="Additional permission needed" tone="warning" action={{ content: "Reconnect Google account", onAction: () => void handleConnectGoogle() }}>
            <Text as="p" variant="bodyMd">Your Google account needs to be reconnected.</Text>
          </Banner>
        )}
        {saveError && <Banner tone="critical" onDismiss={() => setSaveError("")}><Text as="p" variant="bodyMd">{saveError}</Text></Banner>}

        {/* ── Step 1: Connect Google Account ── */}
        <div style={stepCardStyle}>
          <div style={stepHeaderStyle} onClick={() => setStep1Open((o) => !o)}>
            <InlineStack gap="300" blockAlign="center">
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#F1F1F1", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#303030" }}>1</span>
              <Text as="p" variant="bodyMd" fontWeight="semibold">Connect your Google Account</Text>
            </InlineStack>
            <InlineStack gap="400" blockAlign="center">
              {completedBadge}
              <InlineStack gap="100" blockAlign="center">
                <span style={{ fontSize: 13, color: "#5C5F62" }}>Open</span>
                {chevronRight}
              </InlineStack>
            </InlineStack>
          </div>
          {step1Open && (
            <div style={{ padding: "0 20px 20px", borderTop: "1px solid #F1F1F1" }}>
              <Box paddingBlockStart="400">
                <BlockStack gap="300">
                  <InlineStack gap="200" blockAlign="center">
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <GoogleGIcon />
                    </div>
                    <BlockStack gap="0">
                      <Text as="p" variant="bodySm" fontWeight="semibold">Your Google account is linked</Text>
                      {connectedStatus.email && <Text as="p" variant="bodySm" tone="subdued">{connectedStatus.email}</Text>}
                      {connectedSheetTitle && <Text as="p" variant="bodySm" tone="subdued">Connected to: <span style={{ fontWeight: 500, color: "#202223" }}>{connectedSheetTitle}</span></Text>}
                    </BlockStack>
                  </InlineStack>
                  <InlineStack align="end">
                    <Button tone="critical" variant="plain" loading={isDisconnecting} onClick={() => void handleDisconnect()}>Unlink this account</Button>
                  </InlineStack>
                </BlockStack>
              </Box>
            </div>
          )}
        </div>

        {/* ── Step 2: Select Google Sheet ── */}
        <div style={stepCardStyle}>
          <div style={stepHeaderStyle} onClick={() => setStep2Open((o) => !o)}>
            <InlineStack gap="300" blockAlign="center">
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#F1F1F1", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#303030" }}>2</span>
              <Text as="p" variant="bodyMd" fontWeight="semibold">Select your Google Sheet</Text>
            </InlineStack>
            <InlineStack gap="400" blockAlign="center">
              {sheetCompleted ? completedBadge : pendingBadge}
              <InlineStack gap="100" blockAlign="center">
                <span style={{ fontSize: 13, color: "#5C5F62" }}>{step2Open ? "Close" : "Open"}</span>
                {step2Open ? chevronDown : chevronRight}
              </InlineStack>
            </InlineStack>
          </div>
          {step2Open && (
            <div style={{ padding: "0 20px 20px", borderTop: "1px solid #F1F1F1" }}>
              <Box paddingBlockStart="400">
                <BlockStack gap="400">
                  <RadioButton label={<BlockStack gap="0"><Text as="span" variant="bodyMd">Create a new sheet</Text><Text as="span" variant="bodySm" tone="subdued">BuyEase will create a new Sheet for you</Text></BlockStack>} id="sheet-new" name="sheet-mode" checked={sheetMode === "new"} onChange={() => setSheetMode("new")} />
                  <RadioButton label={<BlockStack gap="0"><Text as="span" variant="bodyMd">Use an existing sheet</Text><Text as="span" variant="bodySm" tone="subdued">You can use an existing sheet by providing the sheet link</Text></BlockStack>} id="sheet-existing" name="sheet-mode" checked={sheetMode === "existing"} onChange={() => setSheetMode("existing")} />
                  {sheetMode === "existing" && (
                    <BlockStack gap="300">
                      {sheetsError && !needsReauth && <Text as="p" variant="bodySm" tone="critical">{sheetsError}</Text>}

                      {/* Sub-option 1: Select from existing sheets */}
                      <BlockStack gap="100">
                        <Text as="p" variant="bodySm" fontWeight="semibold">Select from your existing sheets</Text>
                        <InlineStack gap="200" blockAlign="center">
                          <div style={{ flex: 1 }}>
                            <Select
                              label="" labelHidden
                              options={
                                availableSheets.length > 0
                                  ? [{ label: "Select your spreadsheet", value: "" }, ...availableSheets.map((s) => ({ label: s.name, value: s.id }))]
                                  : [{ label: isLoadingSheets ? "Loading…" : "No spreadsheets found — click Refresh", value: "" }]
                              }
                              value={availableSheets.length > 0 ? spreadsheetId : ""}
                              onChange={(val) => void handleSelectSpreadsheet(val)}
                              disabled={isLoadingSheets || availableSheets.length === 0}
                            />
                          </div>
                          <Button icon={RefreshIcon} loading={isLoadingSheets} onClick={() => { void getBearer().then((t) => fetchSpreadsheets(t)); }}>
                            Refresh
                          </Button>
                        </InlineStack>
                        {spreadsheetId && availableSheets.find((s) => s.id === spreadsheetId) && (
                          <Text as="p" variant="bodySm" tone="subdued">
                            Selected: {availableSheets.find((s) => s.id === spreadsheetId)?.name}
                          </Text>
                        )}
                      </BlockStack>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 1, background: "#E1E3E5" }} />
                        <Text as="span" variant="bodySm" tone="subdued">or paste a link</Text>
                        <div style={{ flex: 1, height: 1, background: "#E1E3E5" }} />
                      </div>

                      {/* Sub-option 2: Paste spreadsheet link */}
                      <BlockStack gap="100">
                        <Text as="p" variant="bodySm" fontWeight="semibold">Spreadsheet Link</Text>
                        <TextField
                          label="" labelHidden
                          placeholder="Ex: https://docs.google.com/spreadsheets/d/1-XxrZH…/edit"
                          value={existingSheetUrl}
                          onChange={setExistingSheetUrl}
                          autoComplete="off"
                        />
                      </BlockStack>
                    </BlockStack>
                  )}
                  <InlineStack align="end">
                    <Button variant="primary" loading={isSaving} onClick={() => void handleNext()}>
                      {sheetMode === "new" ? "Create & Connect" : "Next"}
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Box>
            </div>
          )}
        </div>

        {/* ── Step 3: Select fields ── */}
        <div style={stepCardStyle}>
          <div style={stepHeaderStyle} onClick={() => setStep3Open((o) => !o)}>
            <InlineStack gap="300" blockAlign="center">
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#F1F1F1", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#303030" }}>3</span>
              <Text as="p" variant="bodyMd" fontWeight="semibold">Select fields you want to export to Google Sheet</Text>
            </InlineStack>
            <InlineStack gap="400" blockAlign="center">
              {pendingBadge}
              <InlineStack gap="100" blockAlign="center">
                <span style={{ fontSize: 13, color: "#5C5F62" }}>{step3Open ? "Close" : "Open"}</span>
                {step3Open ? chevronDown : chevronRight}
              </InlineStack>
            </InlineStack>
          </div>
          {step3Open && (
            <div style={{ borderTop: "1px solid #F1F1F1" }}>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", background: "#EAF0FB" }}>
                {["A","B","C","D","E","F"].map((col) => (
                  <div key={col} style={{ padding: "10px 0", textAlign: "center", fontWeight: 700, fontSize: 13, color: "#303030", borderRight: "1px solid #D8E0EC" }}>{col}</div>
                ))}
              </div>
              {/* Field selectors */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", padding: "12px 12px" , gap: 8 }}>
                {selectedFields.map((val, i) => (
                  <select
                    key={i}
                    value={val}
                    onChange={(e) => updateField(i, e.target.value)}
                    style={{ width: "100%", padding: "7px 8px", border: "1px solid #C9CCCF", borderRadius: 6, fontSize: 13, background: "white", color: "#303030", cursor: "pointer" }}
                  >
                    {FIELD_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Options ── */}
        <div style={{ ...stepCardStyle, padding: "16px 20px" }}>
          <BlockStack gap="300">
            <Checkbox
              label="Use a single row per order in Google Sheets"
              helpText="If enabled, all items in an order will be combined into a single row in Google Sheets."
              checked={singleRowPerOrder}
              onChange={setSingleRowPerOrder}
            />
            <Checkbox
              label="Insert new orders at the top of the sheet"
              helpText="If enabled, new orders will appear at the top of the sheet, just below the header, instead of at the bottom."
              checked={insertAtTop}
              onChange={setInsertAtTop}
              disabled={!singleRowPerOrder}
            />
          </BlockStack>
        </div>

        {/* ── Warning banner ── */}
        {showWarningBanner && (
          <div style={{ background: "#FFF8E7", border: "1px solid #F0C75E", borderRadius: 10, padding: "14px 16px" }}>
            <InlineStack gap="200" blockAlign="start" wrap={false}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <Icon source={AlertCircleIcon} tone="caution" />
              </div>
              <div style={{ flex: 1 }}>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm">• Please avoid editing the sheet manually, create a real-time clone instead. <Link url="#" target="_blank">How to create a clone?</Link></Text>
                  <Text as="p" variant="bodySm">• Please do not modify the sheet name once it has been connected to BuyEase.</Text>
                </BlockStack>
              </div>
              <button type="button" onClick={() => setShowWarningBanner(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6D7175", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>✕</button>
            </InlineStack>
          </div>
        )}

        {/* ── Sync & Export ── */}
        <div style={{ ...stepCardStyle, padding: "16px 20px" }}>
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="050">
              <Text as="p" variant="bodySm" fontWeight="semibold">Last sync</Text>
              <Text as="p" variant="bodySm" tone="subdued">{connectedStatus.lastSyncAt ? formatRelativeTime(connectedStatus.lastSyncAt) : "No syncs yet"}</Text>
            </BlockStack>
            <InlineStack gap="200" blockAlign="center">
              {connectedStatus.spreadsheetUrl && (
                <Button onClick={() => window.open(connectedStatus.spreadsheetUrl ?? undefined, "_blank", "noopener,noreferrer")} icon={ExternalIcon} variant="plain">Open spreadsheet</Button>
              )}
              <Button icon={DataTableIcon} loading={isExporting} disabled={!connectedStatus.spreadsheetId} onClick={() => void handleExport()}>Export all orders</Button>
            </InlineStack>
          </InlineStack>
        </div>
      </BlockStack>
    );
  };

  return (
    <Page backAction={{ content: "Integrations", onAction: onBack }} title="Google Sheets" subtitle="Export store orders to google sheet in real time">
      <div style={{ width: "65.5rem", maxWidth: "100%" }}>
        <BlockStack gap="400">
          {renderContent()}
          <InlineStack align="center">
            <Text as="p" variant="bodyMd">
              Learn more about <Link url="#" target="_blank">Google Sheets</Link>
            </Text>
          </InlineStack>
        </BlockStack>
      </div>
    </Page>
  );
}

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
      <div style={{ width: "65.5rem", maxWidth: "100%" }}>
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
      </div>
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
    } else if (params.get("view") === "google-sheets" || params.get("tab") === "google-sheets") {
      setActiveView("google-sheets");
    }
    setIsHydrating(false);
  }, []);

  if (isHydrating) {
    return (
      <SkeletonPage title="Integrations & Messaging">
        <div style={{ width: "65.5rem", maxWidth: "100%" }}>
          <BlockStack gap="400">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <InlineStack
                align="space-between"
                blockAlign="center"
                gap="600"
                wrap={false}
              >
                <div style={{ flexGrow: 1 }}>
                  <BlockStack gap="300" inlineAlign="start">
                    <InlineStack gap="200" align="start" blockAlign="center">
                      <div style={{ width: "20px", height: "20px", backgroundColor: "var(--p-color-bg-surface-secondary)", borderRadius: "4px" }} />
                      <SkeletonDisplayText size="small" />
                    </InlineStack>
                    <SkeletonBodyText lines={2} />
                    <div style={{ width: "120px", height: "32px", backgroundColor: "var(--p-color-bg-surface-secondary)", borderRadius: "var(--p-border-radius-200)", marginTop: "4px" }} />
                  </BlockStack>
                </div>
                <div style={{ width: "80px", height: "80px", backgroundColor: "var(--p-color-bg-surface-secondary)", borderRadius: "var(--p-border-radius-200)", flexShrink: 0 }} />
              </InlineStack>
            </Card>
          ))}
        </BlockStack>
        </div>
      </SkeletonPage>
    );
  }

  const handleSetActiveView = (view: ActiveView) => {
    setActiveView(view);
    const url = new URL(window.location.href);
    if (view === "list") {
      url.searchParams.delete("view");
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("view", view);
      url.searchParams.delete("tab");
    }
    window.history.replaceState({}, "", url.toString());
  };

  if (activeView === "sms-whatsapp") {
    return <SmsWhatsAppPage onBack={() => handleSetActiveView("list")} />;
  }

  if (activeView === "google-sheets") {
    return <GoogleSheetsPage onBack={() => handleSetActiveView("list")} />;
  }

  return (
    <Page title="Integrations & Messaging">
      <div style={{ width: "65.5rem", maxWidth: "100%" }}>
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
                  {item.id === "sms-whatsapp" || item.id === "google-sheets" ? (
                    <Button
                      icon={item.icon}
                      variant="primary"
                      onClick={() => handleSetActiveView(item.id as ActiveView)}
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
      </div>
    </Page>
  );
}
