import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { i18nLanguageToDeepLTarget } from "@shared/utils/deeplTargetLanguage";
import Button from "~/components/Button";
import Flex from "~/components/Flex";
import Modal from "~/components/Modal";
import NudeButton from "~/components/NudeButton";
import Text from "~/components/Text";
import useToasts from "~/hooks/useToasts";

export type TranslateSuccessPayload = {
  translatedTitle: string;
  translatedText: string;
};

type Props = {
  documentId: string;
  onRequestClose: () => void;
  onTranslateSuccess: (payload: TranslateSuccessPayload) => void;
};

function TranslateModal({
  documentId,
  onRequestClose,
  onTranslateSuccess,
}: Props) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToasts();
  const [isLoading, setIsLoading] = React.useState(false);

  const targetLanguage = React.useMemo(
    () => i18nLanguageToDeepLTarget(i18n.language),
    [i18n.language]
  );

  const handleTranslate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/translations.translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ documentId, targetLanguage }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const json = await response.json();
      const {
        translatedTitle,
        translatedText,
        detectedSourceLanguage,
      } = json.data;

      showToast(
        t("Translation ready. Source language detected: {{source}}.", {
          source: (detectedSourceLanguage ?? "?").toString().toUpperCase(),
        }),
        { type: "success" }
      );

      onTranslateSuccess({
        translatedTitle,
        translatedText,
      });
      onRequestClose();
    } catch (_err) {
      showToast(t("Could not translate document"), { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title={t("Translate document")}
      onRequestClose={onRequestClose}
      isOpen
    >
      <Flex column gap={16} style={{ padding: "16px 0" }}>
        <Text type="secondary">
          {t(
            "The document title and body will be translated to match your interface language. The source language is detected automatically. You can save or revert the result afterwards."
          )}
        </Text>

        <Flex gap={8} justify="flex-end">
          <NudeButton onClick={onRequestClose}>{t("Cancel")}</NudeButton>
          <Button onClick={handleTranslate} disabled={isLoading}>
            {isLoading ? t("Translating…") : t("Translate")}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}

export default observer(TranslateModal);
