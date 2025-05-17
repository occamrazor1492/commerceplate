import LoadingProducts from "@/components/loadings/skeleton/SkeletonProducts";
import ProductLayouts from "@/components/product/ProductLayouts";
import { defaultSort, sorting } from "@/lib/constants";
import { getListPage } from "@/lib/contentParser";
import {
  getCollectionProducts,
  getCollections,
  getHighestProductPrice,
  getProducts,
  getVendors,
} from "@/lib/shopify";
import { PageInfo, Product } from "@/lib/shopify/types";
import CallToAction from "@/partials/CallToAction";
import ProductCardView from "@/partials/ProductCardView";
import ProductFilters from "@/partials/ProductFilters";
import ProductListView from "@/partials/ProductListView";
import { Suspense } from "react";

interface SearchParams {
  sort?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  b?: string;
  c?: string;
  t?: string;
}

const ShowProducts = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const {
    sort,
    q: searchValue,
    minPrice,
    maxPrice,
    b: brand,
    c: category,
    t: tag,
  } = searchParams as {
    [key: string]: string;
  };

  const { layout, cursor } = searchParams as { [key: string]: string };

  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  let productsData: any;
  let vendorsWithCounts: { vendor: string; productCount: number }[] = [];
  let categoriesWithCounts: { category: string; productCount: number }[] = [];

  if (searchValue || brand || minPrice || maxPrice || category || tag) {
    let queryString = "";

    if (minPrice || maxPrice) {
      queryString += `variants.price:<=${maxPrice} variants.price:>=${minPrice}`;
    }

    if (searchValue) {
      queryString += ` ${searchValue}`;
    }

    if (brand) {
      Array.isArray(brand)
        ? (queryString += `${brand.map((b) => `(vendor:${b})`).join(" OR ")}`)
        : (queryString += `vendor:"${brand}"`);
    }

    if (tag) {
      queryString += ` ${tag}`;
    }

    const query = {
      sortKey,
      reverse,
      query: queryString,
      cursor,
    };

    productsData =
      category && category !== "all"
        ? await getCollectionProducts({
          collection: category,
          sortKey,
          reverse,
        })
        : await getProducts(query);

    const uniqueVendors: string[] = [
      ...new Set(
        ((productsData?.products as Product[]) || []).map((product: Product) =>
          String(product?.vendor || ""),
        ),
      ),
    ];

    const uniqueCategories: string[] = [
      ...new Set(
        ((productsData?.products as Product[]) || []).flatMap(
          (product: Product) =>
            product.collections.nodes.map(
              (collectionNode: any) => collectionNode.title || "",
            ),
        ),
      ),
    ];

    vendorsWithCounts = uniqueVendors.map((vendor: string) => {
      const productCount = (productsData?.products || []).filter(
        (product: Product) => product?.vendor === vendor,
      ).length;
      return { vendor, productCount };
    });

    categoriesWithCounts = uniqueCategories.map((category: string) => {
      const productCount = ((productsData?.products as Product[]) || []).filter(
        (product: Product) =>
          product.collections.nodes.some(
            (collectionNode: any) => collectionNode.title === category,
          ),
      ).length;
      return { category, productCount };
    });
  } else {
    // Fetch all products
    productsData = await getProducts({ sortKey, reverse, cursor });
  }
  
  // Get collections for the sidebar
  let categories = await getCollections();
  
  // We only want to show specific collections when viewing a product category
  if (category && category !== 'all') {
    // Add the current category to ensure it's always included
    const currentCategoryHandle = category;
    
    // Get products for the current collection
    const collectionProducts = productsData?.products || [];
    
    // Now filter categories to only show relevant ones
    // For simplicity, we just keep the current category
    categories = categories.filter((cat: any) => cat.handle === currentCategoryHandle);
    
    // If you want to include related collections, you can uncomment and adapt this code:
    /*
    const relatedCollectionHandles = new Set<string>();
    relatedCollectionHandles.add(currentCategoryHandle);
    
    // Check if products have collection information we can use
    if (collectionProducts.length > 0 && collectionProducts[0].collections) {
      console.log('Product collections structure:', JSON.stringify(collectionProducts[0].collections));
      
      // Extract collection handles from products
      collectionProducts.forEach((product: Product) => {
        if (product.collections && product.collections.nodes) {
          product.collections.nodes.forEach((node: any) => {
            if (node.handle) {
              relatedCollectionHandles.add(node.handle);
            }
          });
        }
      });
      
      // Filter categories to only include those found in the products
      categories = categories.filter((cat: any) => 
        relatedCollectionHandles.has(cat.handle)
      );
    }
    */
  }
  
  // Get vendors (brands) based on the current view
  let vendors = [];
  
  if (category && category !== 'all') {
    // If viewing a specific collection, only show vendors from that collection's products
    const collectionProducts = productsData?.products || [];
    
    // Log the first product structure to understand available fields
    if (collectionProducts.length > 0) {
      console.log('First product vendor:', collectionProducts[0].vendor);
    }
    
    // Extract vendors from current collection's products
    vendors = collectionProducts.reduce((acc: any[], product: Product) => {
      const vendor = product.vendor;
      if (vendor) {
        const existingVendor = acc.find(v => v.vendor === vendor);
        if (existingVendor) {
          existingVendor.productCount++;
        } else {
          acc.push({ vendor, productCount: 1 });
        }
      }
      return acc;
    }, []);
  } else {
    // If not viewing a specific collection, get all vendors
    vendors = await getVendors({});
  }

  // Get tags based on the current view
  // Filter tags to only include those from the current collection's products
  let tags: string[] = [];
  
  const collectionProducts = (productsData as { pageInfo: PageInfo; products: Product[] })?.products || [];
  
  // Log tag structure from the first product
  if (collectionProducts.length > 0) {
    console.log('First product tags:', collectionProducts[0].tags);
  }
  
  // Extract all tags from the products in the current view
  tags = [
    ...new Set(
      collectionProducts.flatMap((product: Product) => product.tags || [])
    ),
  ].filter(tag => tag !== "hidden" && !tag.startsWith("hidden-"));

  const maxPriceData = await getHighestProductPrice();

  return (
    <>
      <Suspense>
        <ProductLayouts
          categories={categories}
          vendors={vendors}
          tags={tags}
          maxPriceData={maxPriceData}
          vendorsWithCounts={vendorsWithCounts}
          categoriesWithCounts={categoriesWithCounts}
        />
      </Suspense>

      <div className="container">
        <div className="row">
          <div className="col-3 hidden lg:block -mt-14">
            <Suspense>
              <ProductFilters
                categories={categories}
                vendors={vendors}
                tags={tags}
                maxPriceData={maxPriceData!}
                vendorsWithCounts={vendorsWithCounts}
                categoriesWithCounts={categoriesWithCounts}
              />
            </Suspense>
          </div>

          <div className="col-12 lg:col-9">
            {layout === "list" ? (
              <ProductListView searchParams={searchParams} />
            ) : (
              <ProductCardView searchParams={searchParams} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const ProductsListPage = async (props: {
  searchParams: Promise<SearchParams>;
}) => {
  const searchParams = await props.searchParams;
  const callToAction = getListPage("sections/call-to-action.md");

  return (
    <>
      {/* <PageHeader title={"Products"} /> */}
      <Suspense fallback={<LoadingProducts />}>
        <ShowProducts searchParams={searchParams} />
      </Suspense>

      <CallToAction data={callToAction} />
    </>
  );
};

export default ProductsListPage;
