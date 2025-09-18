import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../dashboard_providers.dart';

class CurrentValuesPanel extends ConsumerWidget {
  const CurrentValuesPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dataBuffers = ref.watch(dataBuffersProvider);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Current Values',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 16,
              runSpacing: 8,
              children: dataBuffers.entries.map((entry) {
                final channel = entry.key;
                final buffer = entry.value;
                final currentValue = buffer.currentValue;
                
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surfaceVariant,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '$channel: ${currentValue?.toStringAsFixed(2) ?? '--'}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
