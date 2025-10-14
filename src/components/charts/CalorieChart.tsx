import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { NumberFormatter, DateFormatter } from '@/utils/formatters';

const screenWidth = Dimensions.get('window').width;

export interface CalorieChartData {
  dates: string[];
  consumed: number[];
  goal: number[];
  burned?: number[];
}

export interface CalorieChartProps {
  data: CalorieChartData;
  type?: 'line' | 'bar';
  period?: 'week' | 'month' | '3months';
  showGoal?: boolean;
  showBurned?: boolean;
  height?: number;
  style?: any;
}

export const CalorieChart: React.FC<CalorieChartProps> = ({
  data,
  type = 'line',
  period = 'week',
  showGoal = true,
  showBurned = false,
  height = 220,
  style,
}) => {
  const chartWidth = screenWidth - 32; // Account for padding

  const formatLabel = (dateString: string, index: number) => {
    const date = new Date(dateString);
    
    if (period === 'week') {
      return DateFormatter.formatDate(date, 'short').split(' ')[0]; // Just day
    } else if (period === 'month') {
      return date.getDate().toString();
    } else {
      return DateFormatter.formatDate(date, 'short');
    }
  };

  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
    style: {
      borderRadius: lightTheme.borderRadius.md,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.lightGray,
      strokeWidth: 1,
    },
  };

  const renderLineChart = () => {
    const datasets = [
      {
        data: data.consumed,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3,
      },
    ];

    if (showGoal && data.goal.length > 0) {
      datasets.push({
        data: data.goal,
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
        strokeWidth: 2,
      });
    }

    if (showBurned && data.burned && data.burned.length > 0) {
      datasets.push({
        data: data.burned,
        color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
        strokeWidth: 2,
      });
    }

    return (
      <LineChart
        data={{
          labels: data.dates.map(formatLabel),
          datasets,
          legend: getLegend(),
        }}
        width={chartWidth}
        height={height}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        formatYLabel={(value) => NumberFormatter.formatCalories(parseInt(value))}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withDots={true}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={false}
      />
    );
  };

  const renderBarChart = () => {
    return (
      <BarChart
        data={{
          labels: data.dates.map(formatLabel),
          datasets: [
            {
              data: data.consumed,
              colors: data.consumed.map((value, index) => {
                const goal = data.goal[index] || 2000;
                const percentage = (value / goal) * 100;
                
                if (percentage >= 90 && percentage <= 110) {
                  return () => Colors.success;
                } else if (percentage > 110) {
                  return () => Colors.warning;
                } else {
                  return () => Colors.primary;
                }
              }),
            },
          ],
        }}
        width={chartWidth}
        height={height}
        chartConfig={{
          ...chartConfig,
          barPercentage: 0.7,
        }}
        style={styles.chart}
        formatYLabel={(value) => NumberFormatter.formatCalories(parseInt(value))}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withInnerLines={true}
        showValuesOnTopOfBars={false}
      />
    );
  };

  const getLegend = () => {
    const legend = ['Tiêu thụ'];
    
    if (showGoal) {
      legend.push('Mục tiêu');
    }
    
    if (showBurned && data.burned) {
      legend.push('Đốt cháy');
    }
    
    return legend;
  };

  const renderStats = () => {
    const totalConsumed = data.consumed.reduce((sum, value) => sum + value, 0);
    const averageConsumed = totalConsumed / data.consumed.length;
    const totalGoal = data.goal.reduce((sum, value) => sum + value, 0);
    const averageGoal = totalGoal / data.goal.length;
    
    const adherencePercentage = averageGoal > 0 
      ? (averageConsumed / averageGoal) * 100 
      : 0;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {NumberFormatter.formatCalories(Math.round(averageConsumed))}
          </Text>
          <Text style={styles.statLabel}>TB/ngày</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {NumberFormatter.formatCalories(Math.round(averageGoal))}
          </Text>
          <Text style={styles.statLabel}>Mục tiêu TB</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            {
              color: adherencePercentage >= 90 && adherencePercentage <= 110
                ? Colors.success
                : adherencePercentage > 110
                ? Colors.warning
                : Colors.primary
            }
          ]}>
            {Math.round(adherencePercentage)}%
          </Text>
          <Text style={styles.statLabel}>Tuân thủ</Text>
        </View>
      </View>
    );
  };

  const renderPeriodInfo = () => {
    const periodLabels = {
      week: 'Tuần này',
      month: 'Tháng này',
      '3months': '3 tháng qua',
    };

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Lượng Calo</Text>
        <Text style={styles.period}>{periodLabels[period]}</Text>
      </View>
    );
  };

  if (!data.dates.length || !data.consumed.length) {
    return (
      <View style={[styles.container, style]}>
        {renderPeriodInfo()}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có dữ liệu để hiển thị</Text>
          <Text style={styles.emptySubtext}>
            Hãy bắt đầu ghi nhận thực phẩm để xem biểu đồ
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {renderPeriodInfo()}
      {renderStats()}
      
      <View style={styles.chartContainer}>
        {type === 'line' ? renderLineChart() : renderBarChart()}
      </View>
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Tiêu thụ</Text>
        </View>
        
        {showGoal && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.secondary }]} />
            <Text style={styles.legendText}>Mục tiêu</Text>
          </View>
        )}
        
        {showBurned && data.burned && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.error }]} />
            <Text style={styles.legendText}>Đốt cháy</Text>
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
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray,
    marginHorizontal: lightTheme.spacing.md,
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
    flexWrap: 'wrap',
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

export default CalorieChart;