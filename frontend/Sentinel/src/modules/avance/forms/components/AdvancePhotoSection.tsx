import React from "react";
import { View } from "react-native";
import PhotoCapture from "../../components/PhotoCapture";

interface AdvancePhotoSectionProps {
  photos: any[];
  loading: boolean;
  onTakePhoto: () => void;
  onPickImage: () => void;
  onRemovePhoto: (photoId: string) => void;
  style?: any;
}

const AdvancePhotoSection: React.FC<AdvancePhotoSectionProps> = ({
  photos,
  loading,
  onTakePhoto,
  onPickImage,
  onRemovePhoto,
  style,
}) => (
  <View style={style}>
    <PhotoCapture
      photos={photos}
      loading={loading}
      onTakePhoto={onTakePhoto}
      onPickImage={onPickImage}
      onRemovePhoto={onRemovePhoto}
    />
  </View>
);

export default AdvancePhotoSection;
