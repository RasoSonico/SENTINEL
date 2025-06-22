export enum ModalEnum {
  AdvanceSuccess = "AdvanceSuccess",
  ConfirmSend = "ConfirmSend",
}

export type ModalPropsMap = {
  [ModalEnum.AdvanceSuccess]: import("./components/AdvanceSuccessModal").AdvanceSuccessModalProps;
  [ModalEnum.ConfirmSend]: import("./components/ConfirmSendModal").ConfirmSendModalProps;
};

export interface BaseModalProps {
  onClose: () => void;
}
