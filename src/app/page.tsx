export const dynamic = "force-dynamic";

import CollectionsSlider from "@/components/CollectionsSlider";
import HeroSlider from "@/components/HeroSlider";
import SkeletonCategory from "@/components/loadings/skeleton/SkeletonCategory";
import SkeletonFeaturedProducts from "@/components/loadings/skeleton/SkeletonFeaturedProducts";
import config from "@/config/config.json";
import { getListPage } from "@/lib/contentParser";
import { getCollectionProducts, getSpecificCollections } from "@/lib/shopify";
import CallToAction from "@/partials/CallToAction";
import FeaturedProducts from "@/partials/FeaturedProducts";
import ProductGridSection from "@/partials/ProductGridSection";
import SeoMeta from "@/partials/SeoMeta";
import { Suspense } from "react";

const { collections } = config.shopify;

const ShowHeroSlider = async () => {
  const sliderImages = await getCollectionProducts({
    collection: collections.hero_slider,
  });
  const { products } = sliderImages;
  return <HeroSlider products={products} />;
};

const ShowCollections = async () => {
  // Use collection handles from config or default to empty array if not defined
  const homepageCollectionHandles = collections.homepage_collections || [];
  const homepageCollections = await getSpecificCollections(homepageCollectionHandles);
  return <CollectionsSlider collections={homepageCollections} />;
};

const ShowFeaturedProducts = async () => {
  const { pageInfo, products } = await getCollectionProducts({
    collection: collections.featured_products,
    reverse: false,
  });
  // u9650u5236u663eu793au4ea7u54c1u6570u91cfu4e3a15u4e2a
  return <FeaturedProducts products={products.slice(0, 15)} />;
};

const Home = () => {
  const callToAction = getListPage("sections/call-to-action.md");

  return (
    <>
      <SeoMeta />
      <section>
        <div className="container">
          <div className="bg-gradient py-10 rounded-md">
            <Suspense>
              <ShowHeroSlider />
            </Suspense>
          </div>
        </div>
      </section>

      {/* category section  */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-6 md:mb-14">
            <h2>Collections</h2>
          </div>
          <Suspense fallback={<SkeletonCategory />}>
            <ShowCollections />
          </Suspense>
        </div>
      </section>

      {/* Featured Products section  */}
      <section>
        <div className="container">
          <div className="text-center mb-6 md:mb-14">
            <h2 className="mb-2">Featured Products</h2>
            <p className="md:h5">Explore Today's Featured Picks!</p>
          </div>
          <Suspense fallback={<SkeletonFeaturedProducts />}>
            <ShowFeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* Product Grid section */}
      <ProductGridSection title="Shop Our Collection" collectionHandle="hero_slider" maxProducts={24} />

      {/* Second Product Grid section */}
      <ProductGridSection title="Featured Items" collectionHandle="featured_products" maxProducts={15} />

      <CallToAction data={callToAction} />
    </>
  );
};

export default Home;
