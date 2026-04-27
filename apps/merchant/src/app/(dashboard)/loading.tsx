import {
  BlockStack,
  Box,
  Card,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";

export default function DashboardLoading(): React.ReactElement {
  return (
    <Page>
      <BlockStack gap="400">
        <SkeletonDisplayText size="large" />
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={4} />
          </BlockStack>
        </Card>
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={6} />
          </BlockStack>
        </Card>
        <Box paddingBlockEnd="400" />
      </BlockStack>
    </Page>
  );
}
