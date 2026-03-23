import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Button from "~/components/Button";
import Flex from "~/components/Flex";

type Props = {
  onRevert: () => void;
  onSave: () => void;
  canSave: boolean;
};

function TranslationPreviewBanner({ onRevert, onSave, canSave }: Props) {
  const { t, ready } = useTranslation();

  if (!ready) {
    return null;
  }

  return (
    <Banner role="status">
      <Flex align="center" gap={16} justify="space-between">
        <Message>
          {t(
            "Translation preview: the document shows translated text. Save to keep it in Outline, or revert to the previous version."
          )}
        </Message>
        <Flex gap={8}>
          <Button onClick={onRevert} neutral>
            {t("Revert translation")}
          </Button>
          <Button onClick={onSave} disabled={!canSave}>
            {t("Save translation")}
          </Button>
        </Flex>
      </Flex>
    </Banner>
  );
}

const Banner = styled.div`
  padding: 12px 16px;
  margin: 0 0 16px;
  border-radius: 8px;
  background: ${(props) => props.theme.noticeInfoBackground};
  color: ${(props) => props.theme.noticeInfoText};
  border: 1px solid ${(props) => props.theme.divider};
`;

const Message = styled.p`
  margin: 0;
  flex: 1;
  min-width: 200px;
  font-size: 14px;
  line-height: 1.4;
`;

export default observer(TranslationPreviewBanner);
