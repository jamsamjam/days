from django.shortcuts import render

from .models import Habit, Row


def index(request):
    rows = Row.objects.prefetch_related('check_set__habit').order_by('date')

    habit_names = list(Habit.objects.values_list('habit_text', flat=True))
    row_data = []
    completed_counts = []

    for row in rows:
        check_map = {check.habit.habit_text: check.value for check in row.check_set.all()}

        row_data.append({
            'date': row.date.strftime('%Y-%m-%d'),
            'text': row.row_text,
            'checks': check_map,
        })

        completed_counts.append(
            sum(1 for habit in habit_names if check_map.get(habit, False))
        )

    context = {
        'rows': row_data,
        'habits': habit_names,
        'completed_counts': completed_counts,
    }
    return render(request, 'habits/index.html', context)