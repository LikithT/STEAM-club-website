import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dashboard_providers.dart';
import 'widgets/chart_card.dart';
import 'widgets/connection_controls.dart';
import 'widgets/current_values_panel.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectionState = ref.watch(connectionStateProvider);
    final dataBuffers = ref.watch(dataBuffersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Heritage H2GP - Live Telemetry'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(connectionState.isConnected ? Icons.stop : Icons.play_arrow),
            onPressed: () => ref.read(connectionStateProvider.notifier).toggleConnection(),
            tooltip: connectionState.isConnected ? 'Disconnect' : 'Connect',
          ),
        ],
      ),
      body: Column(
        children: [
          // Connection controls and status
          Container(
            padding: const EdgeInsets.all(16),
            child: ConnectionControls(),
          ),
          const Divider(height: 1),
          
          // Current values panel
          Container(
            padding: const EdgeInsets.all(16),
            child: CurrentValuesPanel(),
          ),
          const Divider(height: 1),
          
          // Charts grid
          Expanded(
            child: _buildChartsGrid(context, dataBuffers),
          ),
        ],
      ),
    );
  }

  Widget _buildChartsGrid(BuildContext context, Map<String, dynamic> dataBuffers) {
    final isWideScreen = MediaQuery.of(context).size.width > 800;
    final crossAxisCount = isWideScreen ? 3 : 2;
    
    final channels = [
      'Battery Voltage',
      'Battery Current', 
      'Fuel Cell Voltage',
      'Battery Voltage (2nd)',
      'Purge Interval',
    ];

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        childAspectRatio: 1.5,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: channels.length,
      itemBuilder: (context, index) {
        final channel = channels[index];
        return ChartCard(
          channel: channel,
          buffer: dataBuffers[channel],
        );
      },
    );
  }
}
