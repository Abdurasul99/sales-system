import 'package:flutter/material.dart';

/// Wraps a fixed-width table in a horizontal scroll view when the
/// viewport gets narrower than [minWidth]. Above that, the child
/// fills available space normally.
class ResponsiveTable extends StatelessWidget {
  const ResponsiveTable({
    super.key,
    required this.minWidth,
    required this.child,
  });

  final double minWidth;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (ctx, c) {
      if (c.maxWidth >= minWidth) return child;
      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const ClampingScrollPhysics(),
        child: SizedBox(width: minWidth, child: child),
      );
    });
  }
}

/// Like Row, but switches to Wrap when each child can't get at least
/// [minChildWidth] of space.
class ResponsiveRow extends StatelessWidget {
  const ResponsiveRow({
    super.key,
    required this.children,
    this.spacing = 12,
    this.runSpacing = 12,
    this.minChildWidth = 200,
  });

  final List<Widget> children;
  final double spacing;
  final double runSpacing;
  final double minChildWidth;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (ctx, c) {
      final fits =
          c.maxWidth >= (minChildWidth * children.length + spacing * (children.length - 1));
      if (fits) {
        // All side by side
        final out = <Widget>[];
        for (var i = 0; i < children.length; i++) {
          out.add(Expanded(child: children[i]));
          if (i < children.length - 1) out.add(SizedBox(width: spacing));
        }
        return Row(crossAxisAlignment: CrossAxisAlignment.start, children: out);
      }
      // Wrap into rows of as many as fit
      final perRow = (c.maxWidth / (minChildWidth + spacing)).floor().clamp(1, children.length);
      final itemWidth =
          (c.maxWidth - spacing * (perRow - 1)) / perRow;
      return Wrap(
        spacing: spacing,
        runSpacing: runSpacing,
        children:
            children.map((w) => SizedBox(width: itemWidth, child: w)).toList(),
      );
    });
  }
}
