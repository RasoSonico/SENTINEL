export enum ModalEnum {
  AdvanceSuccess = "AdvanceSuccess",
  AdvancePending= "AdvancePending",
  AdvanceFailure = "AdvanceFailure",
  ConfirmSend = "ConfirmSend",
}

export type ModalPropsMap = {
  [ModalEnum.AdvanceSuccess]: import("./components/AdvanceSuccessModal").AdvanceSuccessModalProps;
  [ModalEnum.AdvancePending]: import("./components/AdvancePendingModal").AdvancePendingModalProps;
  [ModalEnum.AdvanceFailure]: import("./components/AdvanceFailureModal").AdvanceFailureModalProps;
  [ModalEnum.ConfirmSend]: import("./components/ConfirmSendModal").ConfirmSendModalProps;
};

export interface BaseModalProps {
  onClose: () => void;
}
