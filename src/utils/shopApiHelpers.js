import { normalizePublicProduct } from "./productHelpers";

export function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function firstArray(...values) {
  return values.find(Array.isArray) || [];
}

export function extractProductRows(response) {
  const candidates = [
    response?.data?.data,
    response?.data?.products,
    response?.data?.items,
    response?.products,
    response?.items,
    response?.result?.data,
    response?.result?.products,
    response?.result,
    response?.data,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      const nested = firstArray(
        candidate.products,
        candidate.items,
        candidate.data
      );

      if (nested.length || Array.isArray(candidate.data)) {
        return nested;
      }
    }
  }

  return [];
}

export function extractCategories(response) {
  const candidates = [
    response?.data?.data,
    response?.data?.categories,
    response?.data?.items,
    response?.categories,
    response?.items,
    response?.result?.data,
    response?.result?.categories,
    response?.result,
    response?.data,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      const nested = firstArray(
        candidate.categories,
        candidate.items,
        candidate.data
      );

      if (nested.length || Array.isArray(candidate.data)) {
        return nested;
      }
    }
  }

  return [];
}

export function getPaginationMeta(response, requestedPerPage = 100) {
  const candidates = [
    response?.data,
    response?.data?.data,
    response?.meta,
    response?.pagination,
    response?.data?.meta,
    response?.data?.pagination,
    response?.data?.data?.meta,
    response?.result?.meta,
    response?.result?.pagination,
  ];

  const meta = candidates.find(
    (item) =>
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      (
        item.last_page != null ||
        item.lastPage != null ||
        item.total_pages != null ||
        item.total != null
      )
  );

  if (!meta) return { lastPage: null, total: null };

  const total = Number(meta.total ?? meta.total_count);

  const explicitLastPage = Number(
    meta.last_page ?? meta.lastPage ?? meta.total_pages
  );

  const perPage = Number(
    meta.per_page ?? meta.perPage ?? requestedPerPage
  );

  const lastPage =
    Number.isFinite(explicitLastPage) && explicitLastPage > 0
      ? explicitLastPage
      : Number.isFinite(total) && total >= 0 && perPage > 0
        ? Math.max(1, Math.ceil(total / perPage))
        : null;

  return {
    lastPage,
    total: Number.isFinite(total) ? total : null,
  };
}

export function flattenCategories(categories = []) {
  const flattened = [];

  const visit = (items, parent = null) => {
    if (!Array.isArray(items)) return;

    items.forEach((category) => {
      if (!category || typeof category !== "object") return;

      const name =
        category.name ??
        category.category_name ??
        category.title ??
        "";

      const id = category.id ?? category.category_id ?? null;

      const slug =
        category.slug ||
        category.category_slug ||
        slugify(name);

      flattened.push({
        ...category,
        id,
        name: String(name),
        slug,
        parentId:
          category.parent_id ??
          category.parent_category_id ??
          parent?.id ??
          null,
        parentName: parent?.name ?? "",
      });

      const children = firstArray(
        category.children,
        category.sub_categories,
        category.subcategories,
        category.subCategories,
        category.child_categories
      );

      visit(children, { id, name: String(name) });
    });
  };

  visit(categories);
  return flattened.filter((category) => category.name);
}

function readName(value) {
  if (typeof value === "string") return value;

  return (
    value?.display_name ??
    value?.name ??
    value?.brand_name ??
    value?.title ??
    ""
  );
}

function toBoolean(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

function readCreatedAt(value) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function normalizeShopProduct(raw) {
  if (!raw || typeof raw !== "object") return null;

  const normalized = normalizePublicProduct(raw);

  if (!normalized) return null;

  const rawCategory =
    raw.category ??
    raw.product_category ??
    raw.productCategory ??
    null;

  const rawSubCategory =
    raw.sub_category ??
    raw.subCategory ??
    raw.subcategory ??
    raw.sub_category_name ??
    raw.subcategory_name ??
    null;

  const categoryName =
    readName(rawCategory) ||
    normalized.category ||
    raw.category_name ||
    "";

  const subCategoryName =
    readName(rawSubCategory) ||
    raw.sub_category_name ||
    raw.subcategory_name ||
    "";

  const subCategoryId =
    raw.sub_category_id ??
    raw.subcategory_id ??
    rawSubCategory?.id ??
    null;

  const brandName =
    readName(raw.brand) ||
    normalized.brand ||
    raw.brand_name ||
    "";

  const categoryId =
    raw.category_id ??
    rawCategory?.id ??
    normalized.categoryId ??
    null;

  const parentCategory =
    raw.parent_category ??
    rawCategory?.parent ??
    null;

  const parentCategoryId =
    raw.parent_category_id ??
    rawCategory?.parent_id ??
    parentCategory?.id ??
    null;

  const parentCategoryName =
    readName(parentCategory) ||
    raw.parent_category_name ||
    "";

  const categorySlug =
    rawCategory?.slug ||
    raw.category_slug ||
    normalized.categorySlug ||
    slugify(categoryName);

  const bestSelling = toBoolean(
    raw.bestSelling ??
      raw.best_selling ??
      raw.is_best_selling ??
      raw.isBestSelling
  );

  const newArrival = toBoolean(
    raw.newArrival ??
      raw.new_arrival ??
      raw.is_new_arrival ??
      raw.isNewArrival
  );

  return {
    ...normalized,
    category: categoryName,
    categoryId,
    parentCategoryId,
    parentCategoryName,
    subCategoryId,
    categorySlug,
    subCategory: String(subCategoryName || "").trim(),
    brand: brandName,
    brandId: raw.brand_id ?? raw.brand?.id ?? null,
    bestSelling,
    newArrival,
    createdAt: readCreatedAt(
      raw.created_at ?? raw.createdAt ?? raw.published_at
    ),
  };
}
