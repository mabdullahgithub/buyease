import { BlockStack, Box, Card, Layout, SkeletonBodyText, SkeletonDisplayText } from "@shopify/polaris";

export default function AppLoading() {
  return (
    <Layout>
      <Layout.Section>
        <Card>
          <Box padding="400">
            <BlockStack gap="400">
              <SkeletonDisplayText maxWidth="15ch" size="small" />
              <SkeletonBodyText lines={5} />
            </BlockStack>
          </Box>
        </Card>
      </Layout.Section>
    </Layout>
  );
}
