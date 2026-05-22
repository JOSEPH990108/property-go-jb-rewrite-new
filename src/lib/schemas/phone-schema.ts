import { z } from "zod";
import { isValidPhoneNumber, CountryCode } from "libphonenumber-js";

/**
 * Shared phone validation schema used by SignInForm and SignUpForm.
 * Extracted to eliminate the identical Zod schema defined in both forms.
 */
export const phoneSchema = z
  .object({
    country: z.string().min(1, "Country required"),
    phone: z.string().min(1, "Phone required"),
  })
  .superRefine((data, ctx) => {
    if (data.phone) {
      try {
        if (!isValidPhoneNumber(data.phone, data.country as CountryCode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid phone number",
            path: ["phone"],
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid format",
          path: ["phone"],
        });
      }
    }
  });

export type PhoneSchemaValues = z.infer<typeof phoneSchema>;
