import json
from calendar import monthrange
from datetime import date

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.utils import timezone

from .models import Habit, Check, Row


def _serialize_row(row):
    check_map = {check.habit.id: check.value for check in row.checks.select_related("habit").all()}
    return {
        "id": row.id,
        "date": row.date.strftime("%Y-%m-%d"),
        "text": row.comment,
        "checks": check_map,
    }


def _parse_year_month(request):
    now = timezone.localdate()
    try:
        year = int(request.GET.get("year", now.year))
        month = int(request.GET.get("month", now.month))
    except (TypeError, ValueError):
        return now.year, now.month

    if month < 1 or month > 12:
        month = now.month
    if year < 1970 or year > 9999:
        year = now.year
    return year, month


def _month_day_range(year, month):
    last_day = monthrange(year, month)[1]
    start_date = date(year, month, 1)
    end_date = date(year, month, last_day)
    return start_date, end_date, last_day


def _get_or_create_month_rows(user, year, month):
    start_date, end_date, last_day = _month_day_range(year, month)

    existing_rows = {
        row.date: row
        for row in Row.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
        ).order_by("date")
    }

    rows_to_create = []
    for day in range(1, last_day + 1):
        current_date = date(year, month, day)
        if current_date not in existing_rows:
            rows_to_create.append(Row(user=user, date=current_date, comment=""))

    if rows_to_create:
        Row.objects.bulk_create(rows_to_create)

    return list(
        Row.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
        )
        .prefetch_related("checks__habit")
        .order_by("date")
    )


def _summary_payload(user, year, month):
    habits = list(Habit.objects.filter(user=user).order_by("id"))
    rows = _get_or_create_month_rows(user, year, month)

    row_data = [_serialize_row(row) for row in rows]
    completed_counts = [
        sum(1 for habit in habits if row["checks"].get(habit.id, False))
        for row in row_data
    ]

    return {
        "rows": row_data,
        "habits": [
            {
                "id": habit.id,
                "name": habit.name,
            }
            for habit in habits
        ],
        "completed_counts": completed_counts,
        "year": year,
        "month": month,
    }


def _parse_json_body(request):
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return None


@login_required
def index(request):
    year, month = _parse_year_month(request)
    context = _summary_payload(request.user, year, month)
    return render(request, "habits/index.html", context)


@login_required
def summary_api(request):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    year, month = _parse_year_month(request)
    return JsonResponse(_summary_payload(request.user, year, month))


@login_required
def update_row_comment_api(request, row_id):
    if request.method not in ["PATCH", "POST"]:
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    payload = _parse_json_body(request)
    if payload is None:
        return JsonResponse({"detail": "Invalid JSON body."}, status=400)

    if "text" not in payload:
        return JsonResponse({"detail": "text is required."}, status=400)

    row = get_object_or_404(Row, pk=row_id, user=request.user)
    row.comment = str(payload.get("text", "")).strip()
    row.save(update_fields=["comment"])

    row = (
        Row.objects.filter(pk=row.pk, user=request.user)
        .prefetch_related("checks__habit")
        .get()
    )
    return JsonResponse({"row": _serialize_row(row)})


@login_required
def update_row_check_api(request, row_id):
    if request.method not in ["PATCH", "POST"]:
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    payload = _parse_json_body(request)
    if payload is None:
        return JsonResponse({"detail": "Invalid JSON body."}, status=400)

    habit_id = payload.get("habit_id")
    if habit_id is None:
        return JsonResponse({"detail": "habit_id is required."}, status=400)

    row = get_object_or_404(Row, pk=row_id, user=request.user)
    habit = get_object_or_404(Habit, pk=habit_id, user=request.user)

    check, _ = Check.objects.get_or_create(
        daily_record=row,
        habit=habit,
        defaults={"value": False},
    )

    if "value" in payload:
        check.value = bool(payload["value"])
    else:
        check.value = not check.value

    check.save()

    row = (
        Row.objects.filter(pk=row.pk, user=request.user)
        .prefetch_related("checks__habit")
        .get()
    )
    return JsonResponse({"row": _serialize_row(row), "value": check.value})