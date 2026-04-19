import {
  Page,
  Layout,
  Card,
  Text,
  EmptyState,
  Button,
  BlockStack,
  InlineStack,
  Badge,
} from "@shopify/polaris";

type UpsellOffer = {
  id: string;
  title: string;
  discountPercent: number;
  isActive: boolean;
  triggerProduct: string;
  offerProduct: string;
};

const PLACEHOLDER_OFFERS: UpsellOffer[] = [
  {
    id: "1",
    title: "Post-Purchase Upsell — Accessories",
    discountPercent: 15,
    isActive: true,
    triggerProduct: "Any product",
    offerProduct: "Accessories Bundle",
  },
];

export default function UpsellsPage() {
  if (PLACEHOLDER_OFFERS.length === 0) {
    return (
      <Page
        title="Upsells"
        primaryAction={<Button variant="primary">Create Upsell</Button>}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <EmptyState
                heading="No upsell offers yet"
                action={{ content: "Create your first upsell" }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <Text as="p" variant="bodyMd">
                  Create targeted offers that appear after a customer places a
                  COD order.
                </Text>
              </EmptyState>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Upsells"
      subtitle={`${PLACEHOLDER_OFFERS.length} active offer${PLACEHOLDER_OFFERS.length !== 1 ? "s" : ""}`}
      primaryAction={<Button variant="primary">Create Upsell</Button>}
    >
      <Layout>
        {PLACEHOLDER_OFFERS.map((offer) => (
          <Layout.Section key={offer.id}>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h3" variant="headingMd">
                    {offer.title}
                  </Text>
                  <Badge tone={offer.isActive ? "success" : undefined}>
                    {offer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Trigger: {offer.triggerProduct} → Offer: {offer.offerProduct}{" "}
                  at {offer.discountPercent}% off
                </Text>
                <InlineStack gap="200">
                  <Button size="slim">Edit</Button>
                  <Button size="slim" tone="critical">
                    Delete
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}
      </Layout>
    </Page>
  );
}
