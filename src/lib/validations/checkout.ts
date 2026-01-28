import { z } from "zod";
import {
  emailSchema,
  phoneSchema,
  nameSchema,
  addressSchema,
  citySchema,
  stateSchema,
  zipCodeSchema,
} from "./common";

// Checkout form validation (client-side)
export const checkoutFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  city: citySchema,
  state: stateSchema,
  zip: zipCodeSchema,
});

// Type export
export type CheckoutForm = z.infer<typeof checkoutFormSchema>;
