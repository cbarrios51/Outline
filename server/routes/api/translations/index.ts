import * as deepl from "deepl-node";
import Router from "koa-router";
import auth from "@server/middlewares/authentication";
import Document from "@server/models/Document";
import { APIContext } from "@server/types";
import env from "@server/env";

const router = new Router();

router.post(
    "translations.translate",
    auth(),
    async (ctx: APIContext) => {
        const { documentId, targetLanguage } = ctx.request.body as {
            documentId: string;
            targetLanguage: string;
        };

        if (!documentId || !targetLanguage) {
            ctx.throw(400, "documentId and targetLanguage are required");
        }

        const document = await Document.findByPk(documentId);

        if (!document) {
            ctx.throw(404, "Document not found");
        }

        const client = new deepl.DeepLClient(env.DEEPL_API_KEY ?? "");

        const result = await client.translateText(
            document!.text,
            null,
            targetLanguage as deepl.TargetLanguageCode
        );

        ctx.body = {
            data: {
                translatedText: result.text,
                detectedSourceLanguage: result.detectedSourceLang,
                targetLanguage,
            },
        };
    }
);

export default router;