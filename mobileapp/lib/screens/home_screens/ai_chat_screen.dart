import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/ai_chat_ctrl.dart';
import 'package:lawn_care/models/ai_chat_model.dart';
import 'package:lawn_care/utils/appcolor.dart';

class AiChatScreen extends StatelessWidget {
  const AiChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final AiChatCtrl controller = Get.put(AiChatCtrl());

    return Scaffold(
      backgroundColor: AppColor().primary,
      appBar: AppBar(
        backgroundColor: AppColor().primary,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: AppColor().secondary),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Ai Turf Talk',
          style: TextStyle(
            color: AppColor().secondary,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColor().secondary, AppColor().primary],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Column(
          children: [
            Expanded(
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColor().accent4.withOpacity(0.85),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Obx(
                  () => controller.messages.isEmpty
                      ? _buildWelcomeState()
                      : ListView.builder(
                          controller: controller.scrollController,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 12,
                          ),
                          itemCount:
                              controller.messages.length +
                              (controller.isLoading.value ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index == controller.messages.length) {
                              return _buildTypingIndicator();
                            }
                            return _buildMessageItem(
                              controller.messages[index],
                              controller,
                            );
                          },
                        ),
                ),
              ),
            ),
            _buildInputArea(controller),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_bubble_outline,
            size: 80,
            color: AppColor().secondary,
          ),
          const SizedBox(height: 20),
          Text(
            'Ai Lawncare Workshop!',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColor().secondary,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Type your lawncare query!',
            style: TextStyle(color: AppColor().secondary, fontSize: 18),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageItem(ChatMessage message, AiChatCtrl controller) {
    if (message.isUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12, top: 4),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: AppColor().sedarymainBackground.withOpacity(0.9),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            message.content,
            style: TextStyle(color: AppColor().secondary, fontSize: 16),
          ),
        ),
      );
    } else {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: AppColor().sedaryBackground,
              borderRadius: BorderRadius.circular(15),
            ),
            child: Text(
              message.content,
              style: TextStyle(
                color: AppColor().secondary,
                fontSize: 15,
                height: 1.4,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 12),
            child: InkWell(
              onTap: () => controller.copyToClipboard(message.content),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.copy_rounded,
                    size: 18,
                    color: AppColor().secondary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Copy response',
                    style: TextStyle(
                      color: AppColor().secondary,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColor().sedaryBackground,
          borderRadius: BorderRadius.circular(20),
        ),
        child: BouncingDotsIndicator(color: AppColor().secondary),
      ),
    );
  }

  Widget _buildInputArea(AiChatCtrl controller) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 4),
      decoration: BoxDecoration(
        color: AppColor().alternate,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller.messageController,
              style: const TextStyle(color: Colors.white),
              cursorColor: AppColor().accent5,
              decoration: InputDecoration(
                fillColor: AppColor().accent4,
                hintText: 'Type something...',
                hintStyle: TextStyle(
                  color: AppColor().accent4.withOpacity(0.4),
                ),
                border: InputBorder.none,
              ),
              onSubmitted: (_) => controller.sendMessage(),
            ),
          ),
          const SizedBox(width: 10),
          IconButton(
            onPressed: controller.sendMessage,
            icon: Icon(Icons.send_rounded, color: AppColor().accent4, size: 28),
          ),
        ],
      ),
    );
  }
}

class BouncingDotsIndicator extends StatefulWidget {
  final Color color;
  const BouncingDotsIndicator({super.key, required this.color});

  @override
  State<BouncingDotsIndicator> createState() => _BouncingDotsIndicatorState();
}

class _BouncingDotsIndicatorState extends State<BouncingDotsIndicator>
    with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  late List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(3, (index) {
      return AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 600),
      );
    });

    _animations = _controllers.map((controller) {
      return Tween<double>(
        begin: 0,
        end: -8,
      ).animate(CurvedAnimation(parent: controller, curve: Curves.easeInOut));
    }).toList();

    for (int i = 0; i < 3; i++) {
      Future.delayed(Duration(milliseconds: i * 200), () {
        if (mounted) _controllers[i].repeat(reverse: true);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: List.generate(3, (index) {
        return AnimatedBuilder(
          animation: _animations[index],
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(0, _animations[index].value),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: widget.color,
                  shape: BoxShape.circle,
                ),
              ),
            );
          },
        );
      }),
    );
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }
}
