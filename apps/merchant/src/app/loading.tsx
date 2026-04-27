import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";

export default function HomeLoading(): React.ReactElement {
  return (
    <Page>
      <BlockStack gap="400">
        <SkeletonDisplayText size="large" />
        <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} roundedAbove="sm">
              <BlockStack gap="200">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={1} />
              </BlockStack>
            </Card>
          ))}
        </InlineGrid>
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={8} />
          </BlockStack>
        </Card>
        <Box paddingBlockEnd="400" />
      </BlockStack>
    </Page>
  );
}
