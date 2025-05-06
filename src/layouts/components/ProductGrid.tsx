"use client";

// u4ea7u54c1u7f51u683cu7ec4u4ef6 - u7528u4e8eu9996u9875u5c55u793au4ea7u54c1u96c6u5408
import { AddToCart } from "@/components/cart/AddToCart";
import config from "@/config/config.json";
import ImageFallback from "@/helpers/ImageFallback";
import { optimizeImageUrl } from "@/helpers/imageUtils";
import { Product } from "@/lib/shopify/types";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ProductGridProps {
  products: Product[]; // u4ea7u54c1u6570u636e
  title?: string; // u6a21u5757u6807u9898uff08u53efu9009uff09
  maxProducts?: number; // u6700u5927u663eu793au4ea7u54c1u6570u91cfuff08u9ed8u8ba424u4e2auff09
}

const ProductGrid = ({ 
  products, 
  title = "Featured Products", 
  maxProducts = 24 
}: ProductGridProps) => {
  const { currencySymbol } = config.shopify;
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);

  // u5f53u4ea7u54c1u6570u636eu53d8u5316u6216maxProductsu53d8u5316u65f6u66f4u65b0u663eu793au7684u4ea7u54c1
  useEffect(() => {
    setDisplayProducts(products.slice(0, maxProducts));
  }, [products, maxProducts]);

  return (
    <div className="product-grid-container">
      {/* u6a21u5757u6807u9898 */}
      {title && (
        <div className="text-center mb-6 md:mb-8">
          <h2 className="mb-2">{title}</h2>
        </div>
      )}

      {/* u4ea7u54c1u7f51u683c - u652fu6301u54cdu5e94u5f0fu5e03u5c40uff08u6700u591a5u4e2au4ea7u54c1u4e3au4e00u884cuff09 */}
      <div className="row g-4">
        {displayProducts.map((product: any) => {
          const {
            id,
            title,
            handle,
            featuredImage,
            priceRange,
            variants,
            compareAtPriceRange,
          } = product;

          const defaultVariantId =
            variants.length > 0 ? variants[0].id : undefined;

          // u4e3au56feu7247URLu6dfbu52a0300u53c2u6570u4ee5u52a0u5febu52a0u8f7du901fu5ea6
          const optimizedImageUrl = optimizeImageUrl(featuredImage?.url, 312);

          return (
            <div
              key={id}
              className="text-center col-6 sm:col-4 md:col-3 lg:col-1/5 mb-4 group relative"
            >
              <div className="relative overflow-hidden">
                <ImageFallback
                  src={optimizedImageUrl}
                  width={312}
                  height={269}
                  alt={featuredImage?.altText || title}
                  className="w-[312px] h-[150px] md:h-[269px] object-cover border border-border rounded-md"
                />

                <AddToCart
                  variants={product.variants}
                  availableForSale={product.availableForSale}
                  handle={handle}
                  defaultVariantId={defaultVariantId}
                  stylesClass={
                    "btn btn-primary max-md:btn-sm z-10 absolute bottom-12 md:bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full md:group-hover:-translate-y-6 duration-300 ease-in-out whitespace-nowrap drop-shadow-md"
                  }
                />
              </div>
              <div className="py-2 md:py-3 text-center z-20">
                <h3 className="font-medium text-sm md:text-base line-clamp-2">
                  <Link
                    className="after:absolute after:inset-0"
                    href={`/products/${handle}`}
                  >
                    {title}
                  </Link>
                </h3>
                <div className="flex flex-wrap justify-center items-center gap-x-2 mt-1 md:mt-2">
                  <span className="text-base font-bold text-text-dark dark:text-darkmode-text-dark">
                    {currencySymbol}{" "}
                    {priceRange.minVariantPrice.amount}{" "}
                    {compareAtPriceRange?.maxVariantPrice?.currencyCode}
                  </span>

                  {parseFloat(compareAtPriceRange?.maxVariantPrice.amount) > 0 ? (
                    <s className="text-text-light dark:text-darkmode-text-light text-xs font-medium">
                      {currencySymbol}{" "}
                      {compareAtPriceRange?.maxVariantPrice.amount}{" "}
                      {compareAtPriceRange?.maxVariantPrice?.currencyCode}
                    </s>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* u5982u679cu4ea7u54c1u96c6u5408u4e2du7684u4ea7u54c1u6570u91cfu5927u4e8eu663eu793au6570u91cfuff0cu663eu793au67e5u770bu66f4u591au6309u94ae */}
      {products.length > displayProducts.length && (
        <div className="flex justify-center mt-8">
          <Link
            className="btn btn-sm md:btn-md btn-primary font-medium"
            href={"/products?collection=product-grid-1"}
          >
            + View More Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;