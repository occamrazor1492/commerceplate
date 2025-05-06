/**
 * u4f18u5316u56feu7247URLu4e3aCDNu52a0u8f7d
 * u7ed9u56feu7247URLu6dfbu52a0u5bbdu5ea6u53c2u6570uff0cu63d0u9ad8u52a0u8f7du901fu5ea6
 * @param url u539fu59cbu56feu7247URL
 * @param width u9700u8981u7684u5bbdu5ea6uff0cu9ed8u8ba4u4e3a300px
 * @returns u4f18u5316u540eu7684URL
 */
export function optimizeImageUrl(url: string | undefined | null, width: number = 300): string {
  if (!url) return "/images/product_image404.jpg";
  
  // u68c0u67e5URLu662fu5426u5df2u7ecfu5305u542bu5bbdu5ea6u53c2u6570
  if (url.includes('?width=') || url.includes('&width=')) {
    return url;
  }
  
  // u6dfbu52a0u5bbdu5ea6u53c2u6570
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}