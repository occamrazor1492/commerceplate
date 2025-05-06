import ProductGrid from "@/components/ProductGrid";
import config from "@/config/config.json";
import { getCollectionProducts } from "@/lib/shopify";
import { Suspense } from "react";
import SkeletonCards from "@/components/loadings/skeleton/SkeletonCards";

interface ProductGridSectionProps {
  title?: string; // u53efu5b9au5236u7684u6a21u5757u6807u9898
  collectionHandle?: string; // u96c6u5408u53e5u67c4
  maxProducts?: number; // u6700u5927u663eu793au4ea7u54c1u6570u91cf
}

// u83b7u53d6u96c6u5408u914du7f6eu5bf9u8c61
const { collections } = config.shopify;

// u5f02u6b65u83b7u53d6u4ea7u54c1u6570u636eu5e76u6e32u67d3ProductGridu7ec4u4ef6
const ShowProductGrid = async ({
  title = "Featured Products",
  collectionHandle = "hero_slider",
  maxProducts = 24,
}: ProductGridSectionProps) => {
  // u83b7u53d6u96c6u5408u7684u5b9eu9645u540du79f0
  const collectionName = collectionHandle === "hero_slider" 
    ? collections.hero_slider 
    : collectionHandle === "featured_products"
    ? collections.featured_products
    : collectionHandle;

  // u4eceu96c6u5408u4e2du83b7u53d6u4ea7u54c1u6570u636e
  const { products } = await getCollectionProducts({
    collection: collectionName,
    reverse: false,
  });

  return <ProductGrid products={products} title={title} maxProducts={maxProducts} />;
};

// u4ea7u54c1u7f51u683cu9875u9762u533au57dfu7ec4u4ef6
export default function ProductGridSection({
  title = "Our Products",
  collectionHandle = "hero_slider",
  maxProducts = 24,
}: ProductGridSectionProps) {
  return (
    <section className="section">
      <div className="container">
        <Suspense fallback={<SkeletonCards columns={5} products={maxProducts > 10 ? 10 : maxProducts} />}>
          <ShowProductGrid 
            title={title} 
            collectionHandle={collectionHandle} 
            maxProducts={maxProducts} 
          />
        </Suspense>
      </div>
    </section>
  );
}