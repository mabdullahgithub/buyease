"use client";

import {
  Page,
  Layout,
  Card,
  DataTable,
  Badge,
  EmptyState,
  Pagination,
} from "@shopify/polaris";

type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
type OrderListItem = {
  id: string;
  orderId: string;
  codAmount: number | string | { toString(): string };
  status: OrderStatus;
  customerName: string | null;
  createdAt: Date | string;
};

const STATUS_TONE: Record<
  OrderStatus,
  "success" | "warning" | "critical" | "info" | undefined
> = {
  PENDING: "warning",
  CONFIRMED: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "critical",
  REFUNDED: undefined,
};

export function OrdersList({
  orders,
  total,
  page,
  totalPages,
}: {
  orders: OrderListItem[];
  total: number;
  page: number;
  totalPages: number;
}): React.JSX.Element {
  if (orders.length === 0) {
    return (
      <Page title="Orders">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: "40px" }}>
                <EmptyState
                  heading="No orders yet"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  action={{ content: "Create an order" }}
                >
                  <p>Orders placed via your COD form will appear here.</p>
                </EmptyState>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const rows = orders.map((order) => [
    order.orderId,
    order.customerName ?? "—",
    "$" + Number(order.codAmount).toFixed(2),
    <Badge tone={STATUS_TONE[order.status as OrderStatus]} key={order.id}>
      {order.status}
    </Badge>,
    new Date(order.createdAt).toLocaleDateString(),
  ]);

  return (
    <Page title="Orders" subtitle={`${total} total orders`}>
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={["text", "text", "numeric", "text", "text"]}
              headings={["Order ID", "Customer", "COD Amount", "Status", "Date"]}
              rows={rows}
            />
          </Card>
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
              <Pagination
                hasPrevious={page > 1}
                hasNext={page < totalPages}
                onPrevious={() => {}}
                onNext={() => {}}
              />
            </div>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}