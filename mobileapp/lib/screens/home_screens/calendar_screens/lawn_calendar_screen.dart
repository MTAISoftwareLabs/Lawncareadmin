import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/models/home_model.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:lawn_care/controllers/home_ctrls/user_event_ctrl.dart';
import 'package:lawn_care/models/user_event.dart';

class LawnCalendarScreen extends StatefulWidget {
  final CalendarItem item;
  const LawnCalendarScreen({super.key, required this.item});

  @override
  State<LawnCalendarScreen> createState() => _LawnCalendarScreenState();
}

class _LawnCalendarScreenState extends State<LawnCalendarScreen> {
  final RxString selectedView = 'Month'.obs;
  final Rx<DateTime> focusedDate = DateTime.now().obs;
  final Rx<DateTime> selectedDate = DateTime.now().obs;
  final UserEventCtrl userEventCtrl = Get.put(UserEventCtrl());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor().alternate,
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColor().primary,
        onPressed: _showAddEventDialog,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: SafeArea(
        // Wrap the entire Column in a SingleChildScrollView to make the whole screen scrollable
        child: SingleChildScrollView(
          child: Column(
            children: [
              // AppBar
              Padding(
                padding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Row(
                  children: [
                    CostomeBackBotton(onPressed: () => Get.back()),
                    Expanded(
                      child: Center(
                        child: Text(
                          'Calendar',
                          style: TextStyle(
                            color: AppColor().secondary,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 40),
                  ],
                ),
              ),

              const SizedBox(height: 10),

              // View Toggle
              _buildToggle(),

              const SizedBox(height: 15),

              // My Reminders Button
              GestureDetector(
                onTap: _showAllReminders,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColor().secondary.withOpacity(0.5),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.notifications_active,
                        color: AppColor().secondary,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        "My Reminders",
                        style: TextStyle(
                          color: AppColor().secondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Main Content - No longer Expanded to allow scrolling
              Obx(() {
                if (selectedView.value == 'Month') {
                  return _buildMonthView();
                } else {
                  return _buildWeekView();
                }
              }),

              // Add bottom padding to ensure content doesn't touch the edge
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  void _showAddEventDialog() {
    final TextEditingController titleController = TextEditingController();
    final TextEditingController notesController = TextEditingController();
    DateTime tempDate = selectedDate.value;
    TimeOfDay tempTime = TimeOfDay.now();

    Get.defaultDialog(
      title: "Add Reminder",
      content: Column(
        children: [
          TextField(
            controller: titleController,
            decoration: const InputDecoration(
              labelText: "Event Title (e.g. Fertilize)",
            ),
          ),
          TextField(
            controller: notesController,
            decoration: const InputDecoration(labelText: "Notes (Optional)"),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Text("Date: ${tempDate.year}-${tempDate.month}-${tempDate.day}"),
              const Spacer(),
              iconButton(Icons.calendar_today, () async {
                final d = await showDatePicker(
                  context: context,
                  initialDate: tempDate,
                  firstDate: DateTime(2020),
                  lastDate: DateTime(2030),
                );
                if (d != null) tempDate = d;
              }),
            ],
          ),
          Row(
            children: [
              Text("Time: ${tempTime.format(context)}"),
              const Spacer(),
              iconButton(Icons.access_time, () async {
                final t = await showTimePicker(
                  context: context,
                  initialTime: tempTime,
                );
                if (t != null) tempTime = t;
              }),
            ],
          ),
        ],
      ),
      textConfirm: "Save",
      textCancel: "Cancel",
      onConfirm: () {
        if (titleController.text.isNotEmpty) {
          final finalDate = DateTime(
            tempDate.year,
            tempDate.month,
            tempDate.day,
            tempTime.hour,
            tempTime.minute,
          );
          userEventCtrl.addEvent(
            titleController.text,
            finalDate,
            notes: notesController.text,
          );
          Get.back();
        }
      },
    );
  }

  void _showAllReminders() {
    Get.bottomSheet(
      Container(
        height: 500,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColor().alternate,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Text(
              "All My Reminders",
              style: TextStyle(
                color: AppColor().secondary,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: Obx(() {
                if (userEventCtrl.events.isEmpty) {
                  return const Center(
                    child: Text(
                      "No reminders set",
                      style: TextStyle(color: Colors.white),
                    ),
                  );
                }
                // Sort by date desc
                final sorted = List<UserEvent>.from(userEventCtrl.events)
                  ..sort((a, b) => b.date.compareTo(a.date));

                return ListView.builder(
                  itemCount: sorted.length,
                  itemBuilder: (context, index) {
                    final event = sorted[index];
                    return Card(
                      color: Colors.white10,
                      child: ListTile(
                        leading: Checkbox(
                          value: event.isCompleted,
                          onChanged: (v) =>
                              userEventCtrl.toggleComplete(event.id),
                          checkColor: Colors.black,
                          activeColor: AppColor().secondary,
                        ),
                        title: Text(
                          event.title,
                          style: TextStyle(
                            color: Colors.white,
                            decoration: event.isCompleted
                                ? TextDecoration.lineThrough
                                : null,
                          ),
                        ),
                        subtitle: Text(
                          "${event.date.toString().substring(0, 16)}\n${event.notes ?? ''}",
                          style: const TextStyle(color: Colors.white70),
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.white70),
                          onPressed: () => userEventCtrl.deleteEvent(event.id),
                        ),
                      ),
                    );
                  },
                );
              }),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget iconButton(IconData icon, VoidCallback onTap) {
    return IconButton(onPressed: onTap, icon: Icon(icon));
  }

  Widget _buildToggle() {
    return Container(
      width: 250,
      height: 50,
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.5),
        borderRadius: BorderRadius.circular(15),
      ),
      padding: const EdgeInsets.all(4),
      child: Obx(() {
        return Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => selectedView.value = 'Month',
                child: Container(
                  decoration: BoxDecoration(
                    color: selectedView.value == 'Month'
                        ? AppColor().primary
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    'Month',
                    style: TextStyle(
                      color: selectedView.value == 'Month'
                          ? Colors.white
                          : Colors.white60,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: GestureDetector(
                onTap: () => selectedView.value = 'Week',
                child: Container(
                  decoration: BoxDecoration(
                    color: selectedView.value == 'Week'
                        ? AppColor().primary
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    'Week',
                    style: TextStyle(
                      color: selectedView.value == 'Week'
                          ? Colors.white
                          : Colors.white60,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildMonthView() {
    return Column(
      children: [
        // Month Grid Container - No longer needs to be constrained by Expanded parent
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            color: AppColor().primary,
            borderRadius: BorderRadius.circular(30),
          ),
          child: Column(
            children: [
              // Calendar Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Obx(() {
                    String monthName = _getMonthName(focusedDate.value.month);
                    return Text(
                      '$monthName ${focusedDate.value.year}',
                      style: TextStyle(
                        color: AppColor().secondary,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    );
                  }),
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today_outlined,
                        color: Colors.white70,
                        size: 20,
                      ),
                      const SizedBox(width: 15),
                      GestureDetector(
                        onTap: () => _changeMonth(-1),
                        child: Icon(
                          Icons.chevron_left,
                          color: Colors.white70,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 10),
                      GestureDetector(
                        onTap: () => _changeMonth(1),
                        child: Icon(
                          Icons.chevron_right,
                          color: Colors.white70,
                          size: 24,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Days of week
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    .map(
                      (d) => SizedBox(
                    width: 40,
                    child: Text(
                      d,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColor().secondary.withOpacity(0.7),
                        fontSize: 14,
                      ),
                    ),
                  ),
                )
                    .toList(),
              ),
              const SizedBox(height: 10),
              // Calendar Grid
              Obx(() => _buildCalendarGrid()),
            ],
          ),
        ),
        const SizedBox(height: 20),
        // Plans List - No longer Expanded
        _buildPlansList(),
      ],
    );
  }

  Widget _buildWeekView() {
    return Column(
      children: [
        _buildWeekCalendarStrip(),
        const SizedBox(height: 20),
        _buildPlansList(),
      ],
    );
  }

  Widget _buildWeekCalendarStrip() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColor().primary,
        borderRadius: BorderRadius.circular(25),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Obx(() {
                String monthName = _getMonthName(focusedDate.value.month);
                return Text(
                  monthName,
                  style: TextStyle(
                    color: AppColor().secondary,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                );
              }),
              Icon(Icons.calendar_view_week, color: Colors.white70, size: 20),
            ],
          ),
          const SizedBox(height: 15),
          Obx(() {
            // Calculate start of week (Monday)
            DateTime date = focusedDate.value;
            DateTime startOfWeek = date.subtract(
              Duration(days: date.weekday - 1),
            );

            return Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(7, (index) {
                DateTime day = startOfWeek.add(Duration(days: index));
                bool isSelected =
                    day.day == selectedDate.value.day &&
                        day.month == selectedDate.value.month;

                return GestureDetector(
                  onTap: () {
                    selectedDate.value = day;
                    focusedDate.value = day;
                  },
                  child: Column(
                    children: [
                      Text(
                        ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index],
                        style: TextStyle(color: Colors.white60, fontSize: 12),
                      ),
                      const SizedBox(height: 5),
                      Container(
                        width: 35,
                        height: 35,
                        decoration: BoxDecoration(
                          color: isSelected ? Colors.white : Colors.transparent,
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '${day.day}',
                          style: TextStyle(
                            color: isSelected
                                ? AppColor().primary
                                : Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      // Dot for events
                      if (userEventCtrl.getEventsForDay(day).isNotEmpty)
                        Container(
                          margin: const EdgeInsets.only(top: 2),
                          width: 5,
                          height: 5,
                          decoration: const BoxDecoration(
                            color: Colors.amber,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                );
              }),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildPlansList() {
    return Obx(() {
      final date = selectedDate.value;
      final events = userEventCtrl.getEventsForDay(date);
      final hasPlans = widget.item.plans.isNotEmpty;

      if (events.isEmpty && !hasPlans) {
        return const Center(
          child: Padding(
            padding: EdgeInsets.all(20.0),
            child: Text(
              "No care plans or reminders for this date",
              style: TextStyle(color: Colors.white54),
            ),
          ),
        );
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (events.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                "My Reminders",
                style: TextStyle(
                  color: AppColor().secondary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 10),
            ...events.map((e) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _buildUserEventItem(e),
            )),
            const SizedBox(height: 20),
          ],
          if (hasPlans) ...[
            if (events.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  "Recommended Plans",
                  style: TextStyle(
                    color: AppColor().secondary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            const SizedBox(height: 10),
            ...widget.item.plans.map((p) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _buildPlanItem(p),
            )),
          ],
        ],
      );
    });
  }

  Widget _buildUserEventItem(UserEvent event) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(15),
      ),
      child: ListTile(
        leading: Checkbox(
          value: event.isCompleted,
          onChanged: (v) => userEventCtrl.toggleComplete(event.id),
          checkColor: Colors.black,
          activeColor: AppColor().secondary,
        ),
        title: Text(
          event.title,
          style: TextStyle(
            color: Colors.white,
            decoration: event.isCompleted ? TextDecoration.lineThrough : null,
          ),
        ),
        subtitle: event.notes != null && event.notes!.isNotEmpty
            ? Text(event.notes!, style: const TextStyle(color: Colors.white70))
            : null,
        trailing: IconButton(
          icon: const Icon(Icons.delete, color: Colors.white54),
          onPressed: () => userEventCtrl.deleteEvent(event.id),
        ),
      ),
    );
  }

  Widget _buildCalendarGrid() {
    DateTime firstDay = DateTime(
      focusedDate.value.year,
      focusedDate.value.month,
      1,
    );
    int startOffset = (firstDay.weekday - 1); // 0 = Mon, 6 = Sun
    int daysInMonth = DateTime(
      focusedDate.value.year,
      focusedDate.value.month + 1,
      0,
    ).day;

    List<Widget> dayWidgets = [];

    // Previous month padding
    DateTime prevMonth = DateTime(
      focusedDate.value.year,
      focusedDate.value.month,
      0,
    );
    for (int i = startOffset - 1; i >= 0; i--) {
      dayWidgets.add(_buildDayCell(prevMonth.day - i, isCurrentMonth: false));
    }

    // Current month days
    for (int i = 1; i <= daysInMonth; i++) {
      dayWidgets.add(_buildDayCell(i, isCurrentMonth: true));
    }

    // Remaining grid space
    int totalCells = 42; // 6 rows of 7
    int remaining = totalCells - dayWidgets.length;
    for (int i = 1; i <= remaining; i++) {
      dayWidgets.add(_buildDayCell(i, isCurrentMonth: false));
    }

    return GridView.count(
      crossAxisCount: 7,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 5,
      crossAxisSpacing: 5,
      children: dayWidgets,
    );
  }

  Widget _buildDayCell(int day, {required bool isCurrentMonth}) {
    bool isSelected = isCurrentMonth && day == selectedDate.value.day;
    // Check for events
    bool hasEvents = false;
    if (isCurrentMonth) {
      final d = DateTime(focusedDate.value.year, focusedDate.value.month, day);
      hasEvents = userEventCtrl.getEventsForDay(d).isNotEmpty;
    }

    return GestureDetector(
      onTap: () {
        if (isCurrentMonth) {
          selectedDate.value = DateTime(
            focusedDate.value.year,
            focusedDate.value.month,
            day,
          );
        }
      },
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 35,
              height: 35,
              decoration: BoxDecoration(
                color: isSelected ? Colors.white : Colors.transparent,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Text(
                '$day',
                style: TextStyle(
                  color: isSelected
                      ? AppColor().secondary
                      : (isCurrentMonth
                      ? AppColor().secondary.withOpacity(0.9)
                      : AppColor().secondary.withOpacity(0.3)),
                  fontSize: 16,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w400,
                ),
              ),
            ),
            if (hasEvents)
              Container(
                margin: const EdgeInsets.only(top: 2),
                width: 5,
                height: 5,
                decoration: const BoxDecoration(
                  color: Colors.amber,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlanItem(CalendarPlan plan) {
    return GestureDetector(
      onTap: () => _launchPDF(plan.pdfUrl), // Make the entire card clickable
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        decoration: BoxDecoration(
          color: AppColor().primary,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            const Padding(
              padding: EdgeInsets.all(3),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Keeping this for structure, but type might not be needed
                  // Text(
                  //   plan.type,
                  //   style: TextStyle(
                  //     color: AppColor().primary,
                  //     fontSize: 20,
                  //     fontWeight: FontWeight.bold,
                  //   ),
                  // ),
                ],
              ),
            ),
            // Content
            Center(
              child: Container(
                width: 160,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColor().primary, width: 2),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),

            // PDF Section
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.black12,
                borderRadius: BorderRadius.circular(15),
              ),
              child: Row(
                children: [
                  Icon(Icons.picture_as_pdf, color: Colors.redAccent, size: 30),
                  const SizedBox(width: 15),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          plan.title,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Text(
                          plan.pdfUrl.split('/').last,
                          style: TextStyle(color: Colors.white54, fontSize: 12),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Text(
                    'Open',
                    style: TextStyle(
                      // Darkened the goldish color (was 0xFFB1A66F)
                      color: const Color(0xFF8B7E4A),
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 5),
            // Footer decoration
            Center(
              child: Icon(
                Icons.more_horiz,
                color: AppColor().secondary.withOpacity(0.3),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  String _getMonthName(int month) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  }

  void _changeMonth(int delta) {
    focusedDate.value = DateTime(
      focusedDate.value.year,
      focusedDate.value.month + delta,
    );
  }

  Future<void> _launchPDF(String url) async {
    String absoluteUrl = url;
    if (!url.startsWith('http') &&
        !url.startsWith('https') &&
        !url.startsWith('//')) {
      absoluteUrl =
      'https://thelawncareworkshop.com/${url.startsWith('/') ? url.substring(1) : url}';
    } else if (url.startsWith('//')) {
      absoluteUrl = 'https:$url';
    }

    final Uri uri = Uri.parse(absoluteUrl);
    try {
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        Get.snackbar('Error', 'Could not open PDF');
      }
    } catch (e) {
      Get.snackbar('Error', 'Invalid PDF link or no app found to open it');
    }
  }
}