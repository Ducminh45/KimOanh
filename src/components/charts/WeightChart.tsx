import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { DateFormatter } from '@/utils/formatters';
import { BMICalculator } from '@/utils/calculations';

const screenWidth = Dimensions.get('window').width;

export interface WeightChartData {
  dates: string[];
  weights: number[];
  targetWeight?: number;
  height?: number; // for BMI calculation
}

export interface WeightChartProps {
  data: WeightChartData;
  period?: 'week' | 'month' | '3months' | '6months' | 'year';
  height?: number;
  showBMI?: boolean;
  showTarget?: boolean;
  showTrend?: boolean;
  style?: any;
}

export const WeightChart: React.FC<WeightChartProps> = ({
  data,
  period = 'month',
  height = 220,
  showBMI = true,
  showTarget = true,
  showTrend = true,
  style,
}) => {
  const chartWidth = screenWidth - 32;

  const formatLabel = (dateString: string, index: number) => {
    const date = new Date(dateString);
    
    if (period === 'week') {
      return DateFormatter.formatWeekday(date).substring(0, 2);
    } else if (period === 'month') {
      return date.getDate().toString();
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
    style: {
      borderRadius: lightTheme.borderRadius.md,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.lightGray,
      strokeWidth: 1,
    },
  };

  const calculateTrend = () => {
    if (data.weights.length < 2) return { value: 0, direction: 'stable' };
    
    const firstWeight = data.weights[0];
    const lastWeight = data.weights[data.weights.length - 1];
    const difference = lastWeight - firstWeight;
    
    let direction: 'losing' | 'gaining' | 'stable' = 'stable';
    if (Math.abs(difference) > 0.1) {
      direction = difference > 0 ? 'gaining' : 'losing';
    }
    
    return { value: difference, direction };
  };

  const getCurrentBMI = () => {
    if (!data.height || data.weights.length === 0) return null;
    
    const currentWeight = data.weights[data.weights.length - 1];
    return BMICalculator.calculate(currentWeight, data.height);
  };

  const getBMICategory = (bmi: number) => {
    return BMICalculator.getCategory(bmi);
  };

  const getBMIColor = (bmi: number) => {
    return BMICalculator.getCategoryColor(bmi);
  };

  const renderStats = () => {
    const currentWeight = data.weights[data.weights.length - 1] || 0;
    const startWeight = data.weights[0] || 0;
    const minWeight = Math.min(...data.weights);
    const maxWeight = Math.max(...data.weights);
    const avgWeight = data.weights.reduce((sum, w) => sum + w, 0) / data.weights.length;
    
    const trend = calculateTrend();
    const currentBMI = getCurrentBMI();

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentWeight.toFixed(1)}kg</Text>
            <Text style={styles.statLabel}>Hiện tại</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[
              styles.statValue,
              {
                color: trend.direction === 'losing' 
                  ? Colors.success 
                  : trend.direction === 'gaining' 
                  ? Colors.warning 
                  : Colors.textSecondary
              }
            ]}>
              {trend.direction === 'losing' ? '↓' : trend.direction === 'gaining' ? '↑' : '→'} 
              {Math.abs(trend.value).toFixed(1)}kg
            </Text>
            <Text style={styles.statLabel}>Thay đổi</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{avgWeight.toFixed(1)}kg</Text>
            <Text style={styles.statLabel}>Trung bình</Text>
          </View>
        </View>

        {showBMI && currentBMI && (
          <View style={styles.bmiContainer}>
            <View style={styles.bmiItem}>
              <Text style={[styles.bmiValue, { color: getBMIColor(currentBMI) }]}>
                {currentBMI.toFixed(1)}
              </Text>
              <Text style={styles.bmiLabel}>BMI</Text>
            </View>
            
            <View style={styles.bmiItem}>
              <Text style={[styles.bmiCategory, { color: getBMIColor(currentBMI) }]}>
                {getBMICategory(currentBMI) === 'UNDERWEIGHT' ? 'Thiếu cân' :
                 getBMICategory(currentBMI) === 'NORMAL' ? 'Bình thường' :
                 getBMICategory(currentBMI) === 'OVERWEIGHT' ? 'Thừa cân' : 'Béo phì'}
              </Text>
              <Text style={styles.bmiLabel}>Phân loại</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderChart = () => {
    const datasets = [
      {
        data: data.weights,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3,
      },
    ];

    // Add target weight line if provided
    if (showTarget && data.targetWeight) {
      datasets.push({
        data: new Array(data.weights.length).fill(data.targetWeight),
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity * 0.7})`,
        strokeWidth: 2,
        withDots: false,
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
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        formatYLabel={(value) => `${parseFloat(value).toFixed(1)}kg`}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withDots={true}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={false}
      />
    );
  };

  const renderGoalProgress = () => {
    if (!data.targetWeight || data.weights.length === 0) return null;

    const currentWeight = data.weights[data.weights.length - 1];
    const startWeight = data.weights[0];
    const targetWeight = data.targetWeight;
    
    const totalToLose = Math.abs(startWeight - targetWeight);
    const lost = Math.abs(startWeight - currentWeight);
    const remaining = Math.abs(currentWeight - targetWeight);
    const progress = totalToLose > 0 ? (lost / totalToLose) * 100 : 0;

    const isLosing = startWeight > targetWeight;
    const onTrack = isLosing ? currentWeight <= startWeight : currentWeight >= startWeight;

    return (
      <View style={styles.goalContainer}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>Tiến trình mục tiêu</Text>
          <Text style={[
            styles.goalStatus,
            { color: onTrack ? Colors.success : Colors.warning }
          ]}>
            {onTrack ? '✓ Đúng hướng' : '⚠ Cần điều chỉnh'}
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: progress >= 100 ? Colors.success : Colors.primary
              }
            ]} 
          />
        </View>
        
        <View style={styles.goalStats}>
          <Text style={styles.goalStat}>
            Đã {isLosing ? 'giảm' : 'tăng'}: {lost.toFixed(1)}kg
          </Text>
          <Text style={styles.goalStat}>
            Còn lại: {remaining.toFixed(1)}kg
          </Text>
          <Text style={styles.goalStat}>
            {Math.round(progress)}% hoàn thành
          </Text>
        </View>
      </View>
    );
  };

  const getPeriodTitle = () => {
    const titles = {
      week: 'Tuần này',
      month: 'Tháng này',
      '3months': '3 tháng qua',
      '6months': '6 tháng qua',
      year: 'Năm nay',
    };
    return titles[period];
  };

  if (!data.dates.length || !data.weights.length) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>⚖️ Cân nặng</Text>
          <Text style={styles.period}>{getPeriodTitle()}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có dữ liệu cân nặng</Text>
          <Text style={styles.emptySubtext}>
            Hãy bắt đầu ghi nhận cân nặng để theo dõi tiến trình
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>⚖️ Cân nặng</Text>
        <Text style={styles.period}>{getPeriodTitle()}</Text>
      </View>

      {renderStats()}
      
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {showTarget && data.targetWeight && renderGoalProgress()}

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Cân nặng thực tế</Text>
        </View>
        
        {showTarget && data.targetWeight && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.secondary }]} />
            <Text style={styles.legendText}>Mục tiêu</Text>
          </View>
        )}
      </View>
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
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  period: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Stats
  statsContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  // BMI
  bmiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: lightTheme.spacing.md,
    paddingTop: lightTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
  },
  bmiItem: {
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bmiCategory: {
    fontSize: 14,
    fontWeight: '600',
  },
  bmiLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  // Chart
  chartContainer: {
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  chart: {
    borderRadius: lightTheme.borderRadius.md,
  },

  // Goal progress
  goalContainer: {
    backgroundColor: Colors.primary + '10',
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  goalStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: lightTheme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalStat: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    width: 12,
    height: 12,
    borderRadius: 6,
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

export default WeightChart;