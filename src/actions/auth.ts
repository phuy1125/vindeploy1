"use server";

import { RegisterFormSchema } from "@/lib/rules";

interface ActionResult {
  errors?: Record<string, string[]>;
  email?: string;
}

export async function register(_: unknown, formData: FormData): Promise<ActionResult | void> {
  const validatedFields = RegisterFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      email: formData.get("email") as string,
    };
  }
}
