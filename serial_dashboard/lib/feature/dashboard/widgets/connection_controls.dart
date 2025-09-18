import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../dashboard_providers.dart';

class ConnectionControls extends ConsumerWidget {
  const ConnectionControls({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectionState = ref.watch(connectionStateProvider);
    final repository = ref.watch(serialRepositoryProvider);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Connection status indicator
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: connectionState.isConnected 
                    ? Colors.green 
                    : connectionState.isConnecting 
                        ? Colors.orange 
                        : Colors.red,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 12),
            
            // Status text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    connectionState.isConnected 
                        ? 'Connected'
                        : connectionState.isConnecting
                            ? 'Connecting...'
                            : 'Disconnected',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  if (connectionState.error != null)
                    Text(
                      connectionState.error!,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                  Text(
                    repository.runtimeType.toString().contains('WebSocket')
                        ? 'WebSocket mode - Connecting to H2GP data streamer'
                        : repository.isSupported 
                            ? 'Web Serial API supported - Direct COM port connection'
                            : 'Mock data mode - No real data connection',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            
            // Connect/Disconnect button
            ElevatedButton(
              onPressed: connectionState.isConnecting 
                  ? null 
                  : () => ref.read(connectionStateProvider.notifier).toggleConnection(),
              child: Text(connectionState.isConnected ? 'Disconnect' : 'Connect'),
            ),
          ],
        ),
      ),
    );
  }
}
