import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { NumberFormatter, DateFormatter } from '@/utils/formatters';

const screenWidth = Dimensions.get('window').width;

export interface ProgressChartData {
  dates: string[];
  values: number[];
  goals?: number[];
  type: 'weight' | 'water' | 'exercise' | 'calories' | 'streak';
}

export interface ProgressChartProps {
  data: ProgressChartData;
  period?: 'week' | 'month' | '3months';
  height?: number;
  showTrend?: boolean;
  showGoal?: boolean;
  style?: any;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  period = 'week',
  height = 200,
  showTrend = true,
  showGoal = true,
  style,
}) => {
  const chartWidth = screenWidth - 32;

  const getChartConfig = () => {
    const baseConfig = {
      backgroundColor: Colors.surface,
      backgroundGradientFrom: Colors.surface,
      backgroundGradientTo: Colors.surface,
      decimalPlaces: data.type === 'weight' ? 1 : 0,
      color: (opacity = 1) => getTypeColor(opacity),
      labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
      style: {
        borderRadius: lightTheme.borderRadius.md,
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: getTypeColor(),
      },
      propsForBackgroundLines: {
        strokeDasharray: '',
        stroke: Colors.lightGray,
        strokeWidth: 1,
      },
    };

    return baseConfig;
  };

  const getTypeColor = (opacity = 1) => {
    const colors = {
      weight: `rgba(76, 175, 80, ${opacity})`,
      water: `rgba(33, 150, 243, ${opacity})`,
      exercise: `rgba(255, 152, 0, ${opacity})`,
      calories: `rgba(244, 67, 54, ${opacity})`,
      streak: `rgba(156, 39, 176, ${opacity})`,
    };
    return colors[data.type];
  };

  const formatLabel = (dateString: string, index: number) => {
    const date = new Date(dateString);
    
    if (period === 'week') {
      return DateFormatter.formatDate(date, 'short').split(' ')[0];
    } else if (period === 'month') {
      return date.getDate().toString();
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const formatYLabel = (value: string) => {
    const numValue = parseFloat(value);
    
    switch (data.type) {
      case 'weight':
        return `${numValue.toFixed(1)}kg`;
      case 'water':
        return NumberFormatter.formatVolume(numValue);
      case 'exercise':
        return `${Math.round(numValue)}p`;
      case 'calories':
        return NumberFormatter.formatCalories(numValue);
      case 'streak':
        return `${Math.round(numValue)}`;
      default:
        return value;
    }
  };

  const calculateTrend = () => {
    if (data.values.length < 2) return 0;
    
    const firstValue = data.values[0];
    const lastValue = data.values[data.values.length - 1];
    
    return lastValue - firstValue;
  };

  const getTrendText = () => {
    const trend = calculateTrend();
    const isPositive = trend > 0;
    const isNegative = trend < 0;
    
    let trendText = '';
    let trendColor = Colors.textSecondary;
    
    if (data.type === 'weight') {
      if (isNegative) {
        trendText = `↓ ${Math.abs(trend).toFixed(1)}kg`;
        trendColor = Colors.success;
      } else if (isPositive) {
        trendText = `↑ ${trend.toFixed(1)}kg`;
        trendColor = Colors.warning;
      } else {
        trendText = '→ Ổn định';
      }
    } else {
      if (isPositive) {
        trendText = `↑ ${formatYLabel(trend.toString())}`;
        trendColor = Colors.success;
      } else if (isNegative) {
        trendText = `↓ ${formatYLabel(Math.abs(trend).toString())}`;
        trendColor = Colors.error;
      } else {
        trendText = '→ Ổn định';
      }
    }
    
    return { text: trendText, color: trendColor };
  };

  const getTypeTitle = () => {
    const titles = {
      weight: 'Cân nặng',
      water: 'Lượng nước',
      exercise: 'Tập luyện',
      calories: 'Calo',
      streak: 'Chuỗi ngày',
    };
    return titles[data.type];
  };

  const getTypeIcon = () => {
    const icons = {
      weight: '⚖️',
      water: '💧',
      exercise: '💪',
      calories: '🔥',
      streak: '🔥',
    };
    return icons[data.type];
  };

  const renderStats = () => {
    const currentValue = data.values[data.values.length - 1] || 0;
    const averageValue = data.values.reduce((sum, val) => sum + val, 0) / data.values.length;
    const maxValue = Math.max(...data.values);
    const minValue = Math.min(...data.values);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatYLabel(currentValue.toString())}
          </Text>
          <Text style={styles.statLabel}>Hiện tại</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatYLabel(averageValue.toFixed(1))}
          </Text>
          <Text style={styles.statLabel}>Trung bình</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatYLabel(maxValue.toString())}
          </Text>
          <Text style={styles.statLabel}>Cao nhất</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatYLabel(minValue.toString())}
          </Text>
          <Text style={styles.statLabel}>Thấp nhất</Text>
        </View>
      </View>
    );
  };

  const renderChart = () => {
    const datasets = [
      {
        data: data.values,
        color: (opacity = 1) => getTypeColor(opacity),
        strokeWidth: 3,
      },
    ];

    if (showGoal && data.goals && data.goals.length > 0) {
      datasets.push({
        data: data.goals,
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity * 0.7})`,
        strokeWidth: 2,
      });
    }

    return (
      <LineChart
        data={{
          labels: data.dates.map(formatLabel),
          datasets,
        }}
        width={chartWidth}
        height={height}
        chartConfig={getChartConfig()}
        bezier
        style={styles.chart}
        formatYLabel={formatYLabel}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withDots={true}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={false}
      />
    );
  };

  if (!data.dates.length || !data.values.length) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {getTypeIcon()} {getTypeTitle()}
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có dữ liệu để hiển thị</Text>
          <Text style={styles.emptySubtext}>
            Hãy bắt đầu ghi nhận để xem tiến trình của bạn
          </Text>
        </View>
      </View>
    );
  }

  const trendInfo = getTrendText();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.title}>
            {getTypeIcon()} {getTypeTitle()}
          </Text>
          <Text style={styles.period}>
            {period === 'week' ? 'Tuần này' : 
             period === 'month' ? 'Tháng này' : '3 tháng qua'}
          </Text>
        </View>
        
        {showTrend && (
          <View style={styles.trendContainer}>
            <Text style={[styles.trendText, { color: trendInfo.color }]}>
              {trendInfo.text}
            </Text>
          </View>
        )}
      </View>

      {renderStats()}

      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {showGoal && data.goals && (
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: getTypeColor().replace(/[\d.]+\)$/g, '1)') }]} />
            <Text style={styles.legendText}>Thực tế</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 152, 0, 0.7)' }]} />
            <Text style={styles.legendText}>Mục tiêu</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    padding: lightTheme.spacing.md,
    ...lightTheme.shadows.sm,
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: lightTheme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  period: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  trendContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.sm,
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray,
    marginHorizontal: lightTheme.spacing.xs,
  },

  // Chart
  chartContainer: {
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  chart: {
    borderRadius: lightTheme.borderRadius.md,
  },

  // Legend
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: lightTheme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: lightTheme.spacing.xs,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: lightTheme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default ProgressChart;