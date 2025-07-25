import { z } from "zod";

export const advanceFormSchema = z.object({
  catalog: z
    .number({ required_error: "Selecciona un catálogo" })
    .min(1, "Selecciona un catálogo"),
  partida: z
    .number({ required_error: "Selecciona una partida" })
    .min(1, "Selecciona una partida"),
  concept: z
    .number({ required_error: "Selecciona un concepto" })
    .min(1, "Selecciona un concepto"),
  quantity: z
    .string()
    .refine((val) => !!val && !isNaN(Number(val)) && Number(val) > 0, {
      message: "Ingresa una cantidad válida mayor a cero",
    }),
  notes: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

export const advanceFormDefaultValues = {
  catalog: 0,
  partida: 0,
  concept: 0,
  quantity: "",
  notes: "",
  isCompleted: false,
};

export type AdvanceFormFieldsZod = z.infer<typeof advanceFormSchema>;
