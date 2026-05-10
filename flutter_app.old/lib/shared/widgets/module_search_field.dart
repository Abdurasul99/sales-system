import 'package:flutter/material.dart';

class ModuleSearchField extends StatelessWidget {
  const ModuleSearchField({
    super.key,
    required this.hintText,
    required this.onChanged,
    this.width = 320,
  });

  final String hintText;
  final ValueChanged<String> onChanged;
  final double width;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: TextFormField(
        onChanged: onChanged,
        textInputAction: TextInputAction.search,
        decoration: InputDecoration(
          hintText: hintText,
          prefixIcon: const Icon(Icons.search_rounded),
        ),
      ),
    );
  }
}
