import * as React from "react";
import { TranslateSuccessPayload } from "~/components/TranslateModal";

export type DocumentTranslationContextValue = {
  onTranslateSuccess: (payload: TranslateSuccessPayload) => void;
} | null;

export const DocumentTranslationContext =
  React.createContext<DocumentTranslationContextValue>(null);

export function useDocumentTranslation(): DocumentTranslationContextValue {
  return React.useContext(DocumentTranslationContext);
}
