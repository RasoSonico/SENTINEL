import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const advanceFormSchema = z.object({
  catalog: z.string().min(1, "Selecciona un catálogo"),
  partida: z.string().min(1, "Selecciona una partida"),
  concept: z.string().min(1, "Selecciona un concepto"),
  quantity: z
    .string()
    .refine((val) => !!val && !isNaN(Number(val)) && Number(val) > 0, {
      message: "Ingresa una cantidad válida mayor a cero",
    }),
  notes: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

export const advanceFormDefaultValues = {
  catalog: "",
  partida: "",
  concept: "",
  quantity: "",
  notes: "",
  isCompleted: false,
};

export type AdvanceFormFieldsZod = z.infer<typeof advanceFormSchema>;
