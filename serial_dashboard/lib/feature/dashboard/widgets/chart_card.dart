import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../logic/buffers.dart';

class ChartCard extends StatelessWidget {
  final String channel;
  final RollingBuffer? buffer;

  const ChartCard({
    super.key,
    required this.channel,
    required this.buffer,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Chart title and current value
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    channel,
                    style: Theme.of(context).textTheme.titleSmall,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  buffer?.currentValue?.toStringAsFixed(2) ?? '--',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            
            // Min/Max values
            if (buffer != null && buffer!.data.isNotEmpty)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Min: ${buffer!.minValue?.toStringAsFixed(2) ?? '--'}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  Text(
                    'Max: ${buffer!.maxValue?.toStringAsFixed(2) ?? '--'}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            const SizedBox(height: 8),
            
            // Chart
            Expanded(
              child: _buildChart(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChart(BuildContext context) {
    if (buffer == null || buffer!.data.isEmpty) {
      return Center(
        child: Text(
          'No data',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      );
    }

    final data = buffer!.data;
    final now = DateTime.now();
    final timeSpan = const Duration(seconds: 60);
    final startTime = now.subtract(timeSpan);

    // Convert data points to chart spots
    final spots = <FlSpot>[];
    for (final point in data) {
      final secondsFromStart = point.timestamp.difference(startTime).inMilliseconds / 1000.0;
      if (secondsFromStart >= 0 && secondsFromStart <= 60) {
        spots.add(FlSpot(secondsFromStart, point.value));
      }
    }

    if (spots.isEmpty) {
      return Center(
        child: Text(
          'No recent data',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      );
    }

    // Calculate Y-axis range with some padding
    final minY = buffer!.minValue! - (buffer!.maxValue! - buffer!.minValue!) * 0.1;
    final maxY = buffer!.maxValue! + (buffer!.maxValue! - buffer!.minValue!) * 0.1;

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: true,
          drawHorizontalLine: true,
          horizontalInterval: (maxY - minY) / 4,
          verticalInterval: 15, // Every 15 seconds
          getDrawingHorizontalLine: (value) => FlLine(
            color: Theme.of(context).colorScheme.outlineVariant,
            strokeWidth: 0.5,
          ),
          getDrawingVerticalLine: (value) => FlLine(
            color: Theme.of(context).colorScheme.outlineVariant,
            strokeWidth: 0.5,
          ),
        ),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              interval: (maxY - minY) / 4,
              getTitlesWidget: (value, meta) => Text(
                value.toStringAsFixed(1),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 20,
              interval: 15,
              getTitlesWidget: (value, meta) => Text(
                '${(60 - value).toInt()}s',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(
          show: true,
          border: Border.all(
            color: Theme.of(context).colorScheme.outline,
            width: 1,
          ),
        ),
        minX: 0,
        maxX: 60,
        minY: minY,
        maxY: maxY,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: Theme.of(context).colorScheme.primary,
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
            ),
          ),
        ],
      ),
    );
  }
}
