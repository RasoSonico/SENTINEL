import React, { Suspense } from "react";
import { ModalEnum } from "./modalTypes";

const AdvanceSuccessModal = React.lazy(
  () => import("./components/AdvanceSuccessModal")
);
const AdvanceFailureModal = React.lazy(
  () => import("./components/AdvanceFailureModal")
);
const AdvancePendingModal = React.lazy(
  () => import("./components/AdvancePendingModal")
);
const ConfirmSendModal = React.lazy(
  () => import("./components/ConfirmSendModal")
);

const MODAL_MAP = {
  [ModalEnum.AdvanceSuccess]: AdvanceSuccessModal,
  [ModalEnum.AdvancePending]: AdvancePendingModal,
  [ModalEnum.AdvanceFailure]: AdvanceFailureModal,
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
  const props = { ...modal.props, onClose: onClose };

  return (
    <Suspense fallback={null}>
      <ModalComponent {...props} />
    </Suspense>
  );
}
