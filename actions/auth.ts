"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

const signupSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
  full_name: z
    .string()
    .min(2, "Imię musi mieć minimum 2 znaki")
    .max(100, "Imię może mieć maksimum 100 znaków"),
});

export type AuthResponse = {
  success: boolean;
  error?: string;
  data?: unknown;
};

/**
 * Server Action for user login
 */
export async function login(formData: FormData): Promise<AuthResponse> {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    // Validate input
    const validatedData = loginSchema.parse(rawData);

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      // Generic error message to avoid revealing if user exists
      return {
        success: false,
        error: "Nieprawidłowe dane logowania",
      };
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      data: { redirectTo: "/dashboard" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Błąd walidacji danych",
      };
    }

    return {
      success: false,
      error: "Nieprawidłowe dane logowania",
    };
  }
}

/**
 * Server Action for user signup
 * IMPORTANT: full_name is passed in options.data for the trigger to create profile
 */
export async function signup(formData: FormData): Promise<AuthResponse> {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
      full_name: formData.get("full_name"),
    };

    // Validate input
    const validatedData = signupSchema.parse(rawData);

    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.full_name,
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Błąd podczas rejestracji",
      };
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      data: { redirectTo: "/dashboard" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Błąd walidacji danych",
      };
    }

    return {
      success: false,
      error: "Błąd podczas rejestracji",
    };
  }
}

/**
 * Server Action for user logout
 * Used in Server Components with form action - redirect() works here
 */
export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    // In case of error, we can't use redirect, return to let component handle
    throw new Error(error.message || "Błąd podczas wylogowania");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
