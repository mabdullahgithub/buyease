import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Box,
} from "@shopify/polaris";
import { db } from "@buyease/db";
import { cookies } from "next/headers";

async function getDashboardData(shop: string) {
  const [totalOrders, merchant] = await Promise.all([
    db.order.count({ where: { shopId: shop } }),
    db.merchant.findUnique({
      where: { shop },
      select: { installedAt: true, plan: { select: { name: true } } },
    }),
  ]);

  const revenueResult = await db.order.aggregate({
    where: { shopId: shop, status: "DELIVERED" },
    _sum: { codAmount: true },
  });

  return {
    totalOrders,
    totalRevenue: Number(revenueResult._sum.codAmount ?? 0),
    plan: merchant?.plan?.name ?? "Free",
    installedAt: merchant?.installedAt ?? new Date(),
  };
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const shop = cookieStore.get("shopify_shop")?.value ?? "demo.myshopify.com";

  const { totalOrders, totalRevenue, plan } = await getDashboardData(shop);

  return (
    <Page title="Dashboard" subtitle={`Shop: ${shop}`}>
      <Layout>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Total Orders
                </Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {totalOrders.toLocaleString()}
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  COD Revenue
                </Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  ${totalRevenue.toFixed(2)}
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Current Plan
                </Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  {plan}
                </Text>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Getting Started
              </Text>
              <Box>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    1. Configure your COD form under{" "}
                    <strong>COD Form</strong>.
                  </Text>
                  <Text as="p" variant="bodyMd">
                    2. Set up upsell offers under <strong>Upsells</strong>.
                  </Text>
                  <Text as="p" variant="bodyMd">
                    3. Review your order analytics under{" "}
                    <strong>Analytics</strong>.
                  </Text>
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
