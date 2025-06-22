import React, { Suspense } from "react";
import { ModalEnum, ModalPropsMap } from "./modalTypes";

const AdvanceSuccessModal = React.lazy(
  () => import("./components/AdvanceSuccessModal")
);
const ConfirmSendModal = React.lazy(
  () => import("./components/ConfirmSendModal")
);

const MODAL_MAP = {
  [ModalEnum.AdvanceSuccess]: AdvanceSuccessModal,
  [ModalEnum.ConfirmSend]: ConfirmSendModal,
};

export default function ModalRenderer({
  modal,
  onClose,
}: {
  modal: { type: ModalEnum | null; props: any };
  onClose: () => void;
}) {
  if (!modal.type) return null;
  const ModalComponent = MODAL_MAP[modal.type];
  if (!ModalComponent) return null;

  // Always inject onClose to allow closing from modal
  const props = { ...modal.props, onClose: onClose, visible: true };

  return (
    <Suspense fallback={null}>
      <ModalComponent {...props} />
    </Suspense>
  );
}
