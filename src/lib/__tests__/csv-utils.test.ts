import { describe, it, expect } from "vitest";
import { productsToCSV, categoriesToCSV, parseProductsCSV, parseCategoriesCSV } from "@/lib/csv-utils";

// Use inline types matching the shape expected by the functions
// (avoids importing from @/lib/data/products which may have side effects)

describe("productsToCSV", () => {
  it("generates CSV with headers", () => {
    const products = [
      {
        id: 1,
        name: "Cricket Bat",
        company: "Doaba",
        category: "bats",
        description: "A nice bat",
        price: { regular: 99.99, sale: 79.99, currency: "USD" },
        image: { src: "https://example.com/bat.jpg", alt: "Bat" },
        imageHover: { src: "https://example.com/bat2.jpg", alt: "Bat hover" },
        badge: { text: "Sale", backgroundColor: "#FF0000" },
      },
    ] as any[];

    const csv = productsToCSV(products);

    // Check headers
    expect(csv).toContain("ID,Name,Company,Category");
    // Check data row
    expect(csv).toContain('"1"');
    expect(csv).toContain('"Cricket Bat"');
    expect(csv).toContain('"99.99"');
    expect(csv).toContain('"79.99"');
  });

  it("handles empty arrays", () => {
    const csv = productsToCSV([]);
    const lines = csv.split("\n");
    // Should only have headers
    expect(lines.length).toBe(1);
  });

  it("escapes quotes in values", () => {
    const products = [
      {
        id: 1,
        name: 'Bat "Pro"',
        company: "Doaba",
        category: "bats",
        description: "A nice bat",
        price: { regular: 99.99, currency: "USD" },
        image: { src: "https://example.com/bat.jpg", alt: "Bat" },
      },
    ] as any[];

    const csv = productsToCSV(products);
    // Double quotes should be escaped as ""
    expect(csv).toContain('""Pro""');
  });
});

describe("categoriesToCSV", () => {
  it("generates CSV with headers", () => {
    const categories = [
      {
        slug: "cricket-bats",
        name: "Cricket Bats",
        description: "All cricket bats",
        longDescription: "Our full range of cricket bats",
        image: "https://example.com/cat.jpg",
        imageHover: "https://example.com/cat2.jpg",
      },
    ] as any[];

    const csv = categoriesToCSV(categories);
    expect(csv).toContain("Slug,Name,Description");
    expect(csv).toContain('"cricket-bats"');
  });
});

describe("parseProductsCSV", () => {
  it("parses valid CSV back to products", () => {
    const csv = [
      "ID,Name,Company,Category,Description,Regular Price,Sale Price,Currency,Image URL,Image Hover URL,Badge Text,Badge Color",
      '"1","Cricket Bat","Doaba","bats","A great bat","99.99","79.99","USD","https://example.com/bat.jpg","","",""',
    ].join("\n");

    const products = parseProductsCSV(csv);
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Cricket Bat");
    expect(products[0].price?.regular).toBe(99.99);
    expect(products[0].price?.sale).toBe(79.99);
    expect(products[0].category).toBe("bats");
  });

  it("skips incomplete rows", () => {
    const csv = [
      "ID,Name,Company,Category,Description,Regular Price,Sale Price,Currency,Image URL",
      '"1","Bat"', // too few columns
    ].join("\n");

    const products = parseProductsCSV(csv);
    expect(products).toHaveLength(0);
  });

  it("handles empty sale price", () => {
    const csv = [
      "ID,Name,Company,Category,Description,Regular Price,Sale Price,Currency,Image URL",
      '"1","Bat","Co","cat","Description text","99.99","","USD","https://example.com/bat.jpg"',
    ].join("\n");

    const products = parseProductsCSV(csv);
    expect(products).toHaveLength(1);
    expect(products[0].price?.sale).toBeUndefined();
  });
});

describe("parseCategoriesCSV", () => {
  it("parses valid CSV back to categories", () => {
    const csv = [
      "Slug,Name,Description,Long Description,Image URL,Image Hover URL",
      '"cricket-bats","Cricket Bats","All bats","Full range of bats","https://example.com/cat.jpg",""',
    ].join("\n");

    const categories = parseCategoriesCSV(csv);
    expect(categories).toHaveLength(1);
    expect(categories[0].slug).toBe("cricket-bats");
    expect(categories[0].name).toBe("Cricket Bats");
  });

  it("skips incomplete rows", () => {
    const csv = [
      "Slug,Name,Description,Long Description,Image URL",
      '"slug","Name"', // too few
    ].join("\n");

    const categories = parseCategoriesCSV(csv);
    expect(categories).toHaveLength(0);
  });
});

describe("CSV roundtrip", () => {
  it("products survive export → import cycle", () => {
    const original = [
      {
        id: 42,
        name: "Test Product",
        company: "Test Co",
        category: "test-cat",
        description: "Test description",
        price: { regular: 25.5, sale: undefined, currency: "USD" },
        image: { src: "https://example.com/img.jpg", alt: "Test" },
        imageHover: undefined,
        badge: undefined,
      },
    ] as any[];

    const csv = productsToCSV(original);
    const parsed = parseProductsCSV(csv);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe("Test Product");
    expect(parsed[0].price?.regular).toBe(25.5);
    expect(parsed[0].company).toBe("Test Co");
  });
});
