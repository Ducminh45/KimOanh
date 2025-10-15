import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart as RNProgressChart } from 'react-native-chart-kit';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import Card from '@components/common/Card';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ProgressChartData {
  labels: string[];
  data: number[];
  colors: string[];
}

interface ProgressChartProps {
  title: string;
  chartData: ProgressChartData;
  height?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  title,
  chartData,
  height = 220,
}) => {
  const chartConfig = {
    backgroundColor: Colors.white,
    backgroundGradientFrom: Colors.white,
    backgroundGradientTo: Colors.white,
    color: (opacity = 1, index: number = 0) => {
      const colors = chartData.colors || [Colors.protein, Colors.carbs, Colors.fats];
      return colors[index] || Colors.primary;
    },
    labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
    strokeWidth: 2,
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <RNProgressChart
        data={{
          labels: chartData.labels,
          data: chartData.data,
        }}
        width={SCREEN_WIDTH - spacing.lg * 4}
        height={height}
        chartConfig={chartConfig}
        hideLegend={false}
        style={styles.chart}
        strokeWidth={16}
        radius={32}
      />
      <View style={styles.legend}>
        {chartData.labels.map((label, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: chartData.colors[index] || Colors.primary },
              ]}
            />
            <Text style={styles.legendText}>
              {label}: {Math.round(chartData.data[index] * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  legend: {
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  legendText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
});

export default ProgressChart;
