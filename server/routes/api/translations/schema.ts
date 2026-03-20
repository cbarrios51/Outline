import { z } from "zod";

export const TranslateSchema = {
    body: z.object({
        documentId: z.string().uuid(),
        targetLanguage: z.enum([
            "ES", "EN-US", "EN-GB", "FR", "DE", "IT",
            "PT-BR", "PT-PT", "RU", "JA", "ZH", "KO",
            "PL", "NL", "SV", "DA", "FI", "AR"
        ]),
    }),
};