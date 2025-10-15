import React from 'react';
import { RefreshControl } from 'react-native';
import Colors from '@constants/colors';

interface PullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  tintColor?: string;
  title?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  refreshing,
  onRefresh,
  tintColor = Colors.primary,
  title = 'Kéo để làm mới...',
}) => {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={tintColor}
      title={title}
      titleColor={tintColor}
      colors={[tintColor]}
      progressBackgroundColor={Colors.white}
    />
  );
};

export default PullToRefresh;
