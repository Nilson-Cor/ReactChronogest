// frontend/src/schemas/login.ts

import { z } from "zod";

// Define el esquema para el formulario de Login
export const loginSchema = z.object({
    username: z
        .string()
        .min(1, { message: "El usuario es requerido" })
        .min(3, { message: "Longitud mínima de 3 caracteres" }),

    password: z
        .string()
        .min(1, { message: "La contraseña es requerida" })
        .min(5, { message: "La contraseña debe tener al menos 5 caracteres" }),
});

// Genera el tipo TypeScript a partir del esquema
export type LoginForm = z.infer<typeof loginSchema>;