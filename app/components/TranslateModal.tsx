import { observer } from "mobx-react";
import * as React from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import styled, { keyframes } from "styled-components";
import { i18nLanguageToDeepLTarget } from "@shared/utils/deeplTargetLanguage";
import Button from "~/components/Button";
import Flex from "~/components/Flex";
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

const STORAGE_KEY = "outline-translate-skip-confirm";

function TranslateModal({
  documentId,
  onRequestClose,
  onTranslateSuccess,
}: Props) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToasts();
  const [isLoading, setIsLoading] = React.useState(false);
  const [dontShowAgain, setDontShowAgain] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  const targetLanguage = React.useMemo(
    () => i18nLanguageToDeepLTarget(i18n.language),
    [i18n.language]
  );

  const handleTranslate = React.useCallback(async () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
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

      onTranslateSuccess({ translatedTitle, translatedText });
      onRequestClose();
    } catch (_err) {
      showToast(t("Could not translate document"), { type: "error" });
      setVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    documentId,
    targetLanguage,
    dontShowAgain,
    onTranslateSuccess,
    onRequestClose,
    showToast,
    t,
  ]);

  React.useEffect(() => {
    const skip = localStorage.getItem(STORAGE_KEY) === "true";
    if (skip) {
      void handleTranslate();
    } else {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  return ReactDOM.createPortal(
    <Popup>
      <PopupHeader>
        <PopupTitle>{t("Translate document")}</PopupTitle>
        <CloseButton onClick={onRequestClose}>✕</CloseButton>
      </PopupHeader>

      <Text type="secondary" style={{ fontSize: 13, margin: "8px 0 12px" }}>
        {t(
          "The document title and body will be translated to match your interface language. The source language is detected automatically. You can save or revert the result afterwards."
        )}
      </Text>

      <CheckboxRow>
        <input
          type="checkbox"
          id="dontShowAgain"
          checked={dontShowAgain}
          onChange={(e) => setDontShowAgain(e.target.checked)}
        />
        <label
          htmlFor="dontShowAgain"
          style={{ fontSize: 12, cursor: "pointer" }}
        >
          {t("No mostrar de nuevo")}
        </label>
      </CheckboxRow>

      <Flex gap={8} justify="flex-end" align="center" style={{ marginTop: 16 }}>
        <NudeButton
          onClick={onRequestClose}
          style={{ padding: "0 12px", minWidth: 70 }}
        >
          {t("Cancel")}
        </NudeButton>
        <Button onClick={handleTranslate} disabled={isLoading}>
          {isLoading ? t("Translating…") : t("Translate")}
        </Button>
      </Flex>
    </Popup>,
    document.body
  );
}

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Popup = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 360px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.divider};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  padding: 16px;
  animation: ${slideIn} 0.2s ease;
  z-index: 99999;
`;

const PopupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const PopupTitle = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: ${(props) => props.theme.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: ${(props) => props.theme.textTertiary};
  padding: 2px 6px;
  border-radius: 4px;
  &:hover {
    background: ${(props) => props.theme.background};
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  color: ${(props) => props.theme.text};
`;

export default observer(TranslateModal);
