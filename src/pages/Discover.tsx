import { Layout } from "@/components/layout/Layout";

export default function Discover() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-primary mb-2">
            Discover
          </h1>
          <p className="text-muted-foreground">
            Product discovery coming soon
          </p>
        </div>
      </div>
    </Layout>
  );
}
