import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/profile_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/services/api_endpoints.dart';
import 'package:url_launcher/url_launcher.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProfileCtrl>(
      init: ProfileCtrl(),
      builder: (controller) {
        return Scaffold(
          appBar: AppBar(
            automaticallyImplyLeading: false,
            backgroundColor: AppColor().primary,
            title: Text(
              'Profile',
              style: TextStyle(
                color: AppColor().secondary,
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            centerTitle: true,
          ),
          backgroundColor: AppColor().alternate,
          body: Container(
            height: double.infinity,
            width: double.infinity,
            color: AppColor().alternate,
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 20,
                ),
                child: Column(
                  children: [
                    // Header
                    const SizedBox(height: 60),

                    // Avatar and User Info
                    Obx(
                      () => Column(
                        children: [
                          // Avatar
                          Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              color: AppColor().secondary,
                              shape: BoxShape.circle,
                            ),
                            child: controller.userAvatar.value.isNotEmpty
                                ? ClipOval(
                                    child: Image.network(
                                      ApiEndpoints.formatImageUrl(
                                        controller.userAvatar.value,
                                      ),
                                      fit: BoxFit.cover,
                                      errorBuilder:
                                          (context, error, stackTrace) {
                                            return Icon(
                                              Icons.person,
                                              size: 50,
                                              color: AppColor().alternate,
                                            );
                                          },
                                    ),
                                  )
                                : Icon(
                                    Icons.person,
                                    size: 50,
                                    color: AppColor().alternate,
                                  ),
                          ),
                          const SizedBox(height: 20),
                          // User Name
                          Text(
                            controller.userName.value.isNotEmpty
                                ? controller.userName.value
                                : 'User',
                            style: TextStyle(
                              color: AppColor().primaryText,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          // User Email
                          Text(
                            controller.userEmail.value.isNotEmpty
                                ? controller.userEmail.value
                                : 'No email',
                            style: TextStyle(
                              color: AppColor().primaryText.withOpacity(0.7),
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          // User Phone
                          Text(
                            controller.userPhone.value.isNotEmpty
                                ? controller.userPhone.value
                                : 'No phone',
                            style: TextStyle(
                              color: AppColor().primaryText.withOpacity(0.7),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 30),

                    // Group 1: Zip Code
                    // _buildMenuGroup([
                    //   _buildMenuItem(
                    //     icon: Icons.location_on_outlined,
                    //     title: 'Zip Code for soil and air temps',
                    //     onTap: () => controller.handleMenuItem('Zip Code'),
                    //   ),
                    // ]),
                    // const SizedBox(height: 20),

                    // Group 2: My Profile, Contents, etc.
                    _buildMenuGroup([
                      _buildMenuItem(
                        icon: Icons.person_outline,
                        title: 'My Profile',
                        onTap: () => controller.handleMenuItem('My profile'),
                      ),
                      _buildDivider(),
                      _buildMenuItem(
                        icon: Icons.chat_bubble_outline,
                        title: 'My Contents',
                        onTap: () => controller.handleMenuItem('My Contents'),
                      ),
                      _buildDivider(),
                      _buildMenuItem(
                        icon: Icons.question_answer_outlined,
                        title: 'Chats with TurfguyRoss',
                        onTap: () => controller.handleMenuItem('My Questions'),
                      ),
                      _buildDivider(),
                      _buildMenuItem(
                        icon: Icons.notifications_none,
                        title: 'Push Notifications',
                        onTap: () =>
                            controller.handleMenuItem('Push Notifications'),
                      ),
                    ]),
                    const SizedBox(height: 20),

                    // Group 3: Saved Items, Privacy, etc.
                    _buildMenuGroup([
                      _buildMenuItem(
                        icon: Icons
                            .save_alt, // Or browse_gallery / bookmark_border
                        title: 'Saved Items',
                        onTap: () => controller.handleMenuItem('Saved Items'),
                      ),
                      _buildDivider(),
                      _buildMenuItem(
                        icon: Icons.info_outline,
                        title: 'Privacy & Policy',
                        onTap: () =>
                            controller.handleMenuItem('Privacy & policy'),
                      ),
                      _buildDivider(),
                      _buildMenuItem(
                        icon: Icons.gavel_outlined, // Rules
                        title: 'Rules and Copyright',
                        onTap: () =>
                            controller.handleMenuItem('Rules and Copyright'),
                      ),
                      _buildDivider(),
                      _buildMenuItem(
                        icon: Icons.mail_outline,
                        title: 'Contact Us',
                        onTap: () => controller.handleMenuItem('Contact us'),
                      ),
                    ]),
                    const SizedBox(height: 30),

                    // Log out Button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: controller.logout,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColor().primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                        ),
                        child: const Text(
                          'Log out',
                          style: TextStyle(color: Colors.white, fontSize: 16),
                        ),
                      ),
                    ),
                    const SizedBox(height: 15),

                    // Light or Dark Mode Button
                    SizedBox(
                      width: 200,
                      height: 45,
                      child: ElevatedButton(
                        onPressed: controller.toggleTheme,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColor().secondary.withOpacity(
                            0.8,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                        ),
                        child: Text(
                          'Light or Dark Mode',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: Get.width > 600 ? 16 : 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 30),

                    // Logo and Version
                    GestureDetector(
                      onTap: () async {
                        final Uri url = Uri.parse(
                          'https://thelawncareworkshop.com',
                        );
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url);
                        }
                      },
                      child: Image.asset(
                        'assets/images/ItunesArtwork@2x.png',
                        height: 60,
                        fit: BoxFit.contain,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Version: ${controller.version}',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildMenuGroup(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: AppColor().primary, // Dark green group background
        borderRadius: BorderRadius.circular(15),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColor().primaryText.withOpacity(0.7)),
      title: Text(
        title,
        style: TextStyle(color: AppColor().primaryText, fontSize: 16),
      ),
      trailing: Icon(Icons.arrow_forward_ios, size: 16, color: Colors.white70),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
      visualDensity: VisualDensity.compact,
    );
  }

  Widget _buildDivider() {
    return Divider(
      height: 1,
      thickness: 0.5,
      color: AppColor().secondary.withOpacity(0.2),
      indent: 20,
      endIndent: 20,
    );
  }
}
