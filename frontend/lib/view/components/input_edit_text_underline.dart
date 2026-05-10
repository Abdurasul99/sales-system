import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:sales_system/constants/constants.dart';

class InputEditTextUnderline extends StatelessWidget {
  const InputEditTextUnderline({
    super.key,
    required this.textController,
    required this.focusNode,
    this.hintText = '',
    this.onChanged,
    this.onSubmit,
    this.icon,
    this.iconOnRight,
    this.onTapRightIcon,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.textInputFormatter,
    this.validator,
  });

  final TextEditingController textController;
  final FocusNode focusNode;
  final String hintText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmit;
  final Widget? icon;
  final Widget? iconOnRight;
  final GestureTapCallback? onTapRightIcon;
  final bool obscureText;
  final TextInputType keyboardType;
  final List<TextInputFormatter>? textInputFormatter;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: kDarkGrayColor, width: 1.0),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4),
      alignment: Alignment.center,
      child: Row(
        children: [
          if (icon != null) ...[
            IconTheme(
              data: const IconThemeData(color: kDarkGrayColor, size: 18),
              child: icon!,
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: TextFormField(
              controller: textController,
              focusNode: focusNode,
              onChanged: onChanged,
              onFieldSubmitted: onSubmit,
              inputFormatters: textInputFormatter,
              keyboardType: keyboardType,
              obscureText: obscureText,
              validator: validator,
              decoration: InputDecoration(
                isDense: true,
                hintText: hintText,
                hintStyle: const TextStyle(
                  fontSize: 15,
                  color: kDarkGrayColor,
                  fontWeight: FontWeight.w300,
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                errorBorder: InputBorder.none,
                focusedErrorBorder: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: kBlackFontColor,
              ),
            ),
          ),
          if (iconOnRight != null)
            GestureDetector(
              onTap: onTapRightIcon,
              child: IconTheme(
                data: const IconThemeData(color: kDarkGrayColor, size: 18),
                child: iconOnRight!,
              ),
            ),
        ],
      ),
    );
  }
}
