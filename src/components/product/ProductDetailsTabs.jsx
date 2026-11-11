import ProductImageGrid from "./ProductImageGrid";

import {
  getDescription,
  getProductImages,
  getSpecifications,
} from "../../utils/productHelpers";

import "../../styles/product-details-api.css";

const TABS = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "images", label: "Product Images" },
  { id: "reviews", label: "Reviews" },
];

export default function ProductDetailsTabs({
  product,
  tab = "description",
  onTabChange,
}) {
  const activeTab = TABS.some((item) => item.id === tab)
    ? tab
    : "description";

  const specifications = getSpecifications(product);
  const images = getProductImages(product);

  return (
    <section
      id="jnr-product-info"
      className="jnr-pd-api-tabs"
      aria-label="Product information"
    >
      <div
        className="jnr-pd-api-tabs__nav"
        role="tablist"
        aria-label="Product information tabs"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            id={`jnr-pd-tab-${item.id}`}
            type="button"
            role="tab"
            className={
              activeTab === item.id
                ? "jnr-pd-api-tabs__tab is-active"
                : "jnr-pd-api-tabs__tab"
            }
            aria-selected={activeTab === item.id}
            aria-controls={`jnr-pd-panel-${item.id}`}
            tabIndex={activeTab === item.id ? 0 : -1}
            onClick={() => onTabChange?.(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        id={`jnr-pd-panel-${activeTab}`}
        className="jnr-pd-api-tabs__panel"
        role="tabpanel"
        aria-labelledby={`jnr-pd-tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTab === "description" && (
          <div className="jnr-pd-api-tabs__description">
            <h2>About this product</h2>
            <p>{getDescription(product)}</p>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="jnr-pd-api-tabs__specifications">
            <h2>Product specifications</h2>

            {specifications.length > 0 ? (
              <div className="jnr-pd-api-tabs__table-wrap">
                <table className="jnr-pd-api-tabs__table">
                  <tbody>
                    {specifications.map((spec, index) => (
                      <tr key={`${spec.label}-${index}`}>
                        <th scope="row">{spec.label}</th>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === "images" && (
          <div className="jnr-pd-api-tabs__images">
            <h2>Product images</h2>
            <ProductImageGrid
              images={images}
              productName={product?.name || "Product"}
            />
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="jnr-pd-api-tabs__reviews">
            <h2>Customer reviews</h2>
            <p>
              Customer reviews are not available yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
