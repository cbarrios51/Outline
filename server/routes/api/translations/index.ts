import * as deepl from "deepl-node";
import Router from "koa-router";
import env from "@server/env";
import auth from "@server/middlewares/authentication";
import Document from "@server/models/Document";
import { authorize } from "@server/policies";

const router = new Router();

router.post("translations.translate", auth(), async (ctx) => {
  const { documentId, targetLanguage } = ctx.request.body as {
    documentId: string;
    targetLanguage: string;
  };

  if (!documentId || !targetLanguage) {
    ctx.throw(400, "documentId and targetLanguage are required");
  }

  if (!env.DEEPL_API_KEY) {
    ctx.throw(503, "Translation service is not configured");
  }

  const { user } = ctx.state;

  const document = await Document.findByPk(documentId, {
    userId: user.id,
  });

  if (!document) {
    ctx.throw(404, "Document not found");
  }

  authorize(user, "read", document);

  const client = new deepl.DeepLClient(env.DEEPL_API_KEY);
  const target = targetLanguage as deepl.TargetLanguageCode;

  let translatedTitle = document.title;
  let titleDetected: string | undefined;

  if (document.title?.trim()) {
    const titleResult = await client.translateText(
      document.title,
      null,
      target
    );
    translatedTitle = titleResult.text.trim();
    titleDetected = titleResult.detectedSourceLang;
  }

  const bodyResult = await client.translateText(document.text, null, target);

  ctx.body = {
    data: {
      translatedTitle,
      translatedText: bodyResult.text,
      detectedSourceLanguage: bodyResult.detectedSourceLang ?? titleDetected,
      targetLanguage,
    },
  };
});

export default router;
