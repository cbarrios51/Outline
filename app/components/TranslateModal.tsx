import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Button from "~/components/Button";
import Flex from "~/components/Flex";
import Modal from "~/components/Modal";
import NudeButton from "~/components/NudeButton";
import Text from "~/components/Text";
import useToasts from "~/hooks/useToasts";

const LANGUAGES = [
  { code: "ES", label: "Español" },
  { code: "EN-US", label: "Inglés (US)" },
  { code: "EN-GB", label: "Inglés (UK)" },
  { code: "FR", label: "Francés" },
  { code: "DE", label: "Alemán" },
  { code: "IT", label: "Italiano" },
  { code: "PT-BR", label: "Portugués (BR)" },
  { code: "PT-PT", label: "Portugués (PT)" },
  { code: "RU", label: "Ruso" },
  { code: "JA", label: "Japonés" },
  { code: "ZH", label: "Chino" },
  { code: "KO", label: "Coreano" },
  { code: "PL", label: "Polaco" },
  { code: "NL", label: "Holandés" },
  { code: "SV", label: "Sueco" },
  { code: "AR", label: "Árabe" },
];

type Props = {
  documentId: string;
  onRequestClose: () => void;
};

function TranslateModal({ documentId, onRequestClose }: Props) {
  const { t } = useTranslation();
  const { showToast } = useToasts();
  const [targetLanguage, setTargetLanguage] = React.useState("EN-US");
  const [isLoading, setIsLoading] = React.useState(false);

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
      const { translatedText, detectedSourceLanguage } = json.data;

      showToast(
        t(`Idioma detectado: {{ lang }} → traducido correctamente`, {
          lang: detectedSourceLanguage?.toUpperCase() ?? "AUTO",
        }),
        { type: "success" }
      );

      // Abrir el texto traducido en una nueva pestaña del navegador
      const blob = new Blob([translatedText], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      onRequestClose();
    } catch (err) {
      showToast(t("Error al traducir el documento"), { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title={t("Traducir documento")}
      onRequestClose={onRequestClose}
      isOpen
    >
      <Flex column gap={16} style={{ padding: "16px 0" }}>
        <Text type="secondary">
          {t(
            "El idioma origen se detecta automáticamente. Selecciona el idioma destino:"
          )}
        </Text>

        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
            backgroundColor: "var(--background)",
            color: "var(--text)",
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <Flex gap={8} justify="flex-end">
          <NudeButton onClick={onRequestClose}>{t("Cancelar")}</NudeButton>
          <Button onClick={handleTranslate} disabled={isLoading}>
            {isLoading ? t("Traduciendo…") : t("Traducir")}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}

export default observer(TranslateModal);
