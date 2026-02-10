import { describe, it, expect } from "vitest";
import { checkoutFormSchema } from "@/lib/validations/checkout";

const validForm = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+14155551234",
  address: "123 Main Street",
  city: "New York",
  state: "NY",
  zip: "10001",
};

describe("checkoutFormSchema", () => {
  it("accepts valid form", () => {
    expect(checkoutFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("accepts without phone (optional)", () => {
    const { phone, ...noPhone } = validForm;
    expect(checkoutFormSchema.safeParse(noPhone).success).toBe(true);
  });

  it("accepts empty phone", () => {
    expect(checkoutFormSchema.safeParse({ ...validForm, phone: "" }).success).toBe(true);
  });

  it("rejects missing firstName", () => {
    const { firstName, ...noFirst } = validForm;
    expect(checkoutFormSchema.safeParse(noFirst).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email, ...noEmail } = validForm;
    expect(checkoutFormSchema.safeParse(noEmail).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      checkoutFormSchema.safeParse({ ...validForm, email: "bad" }).success
    ).toBe(false);
  });

  it("rejects invalid zip", () => {
    expect(
      checkoutFormSchema.safeParse({ ...validForm, zip: "ABC" }).success
    ).toBe(false);
  });

  it("rejects short address", () => {
    expect(
      checkoutFormSchema.safeParse({ ...validForm, address: "123" }).success
    ).toBe(false);
  });
});
