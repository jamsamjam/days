import json
from calendar import monthrange
from datetime import datetime

from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import Check, Habit, Row


def _serialize_row(row):
    check_map = {check.habit.habit_text: check.value for check in row.check_set.all()}
    return {
        "id": row.id,
        "date": row.date.strftime("%Y-%m-%d"),
        "text": row.row_text,
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


def _month_start_end(year, month):
    last_day = monthrange(year, month)[1]
    start_dt = timezone.make_aware(datetime(year, month, 1, 0, 0, 0))
    end_dt = timezone.make_aware(datetime(year, month, last_day, 23, 59, 59))
    return start_dt, end_dt, last_day


def _ensure_month_rows(year, month):
    start_dt, end_dt, last_day = _month_start_end(year, month)
    existing_dates = set(
        Row.objects.filter(date__gte=start_dt, date__lte=end_dt).values_list("date__date", flat=True)
    )

    rows_to_create = []
    for day in range(1, last_day + 1):
        day_dt = timezone.make_aware(datetime(year, month, day, 0, 0, 0))
        if day_dt.date() not in existing_dates:
            rows_to_create.append(Row(date=day_dt, row_text=""))

    if rows_to_create:
        Row.objects.bulk_create(rows_to_create)


def _summary_payload(year, month):
    _ensure_month_rows(year, month)

    start_dt, end_dt, _ = _month_start_end(year, month)
    habits = list(Habit.objects.all().order_by("id"))
    rows = list(
        Row.objects.filter(date__gte=start_dt, date__lte=end_dt)
        .prefetch_related("check_set__habit")
        .order_by("date")
    )

    habit_names = [habit.habit_text for habit in habits]
    row_data = [_serialize_row(row) for row in rows]
    completed_counts = [
        sum(1 for habit in habit_names if row["checks"].get(habit, False))
        for row in row_data
    ]
    return {
        "rows": row_data,
        "habits": habit_names,
        "completed_counts": completed_counts,
        "year": year,
        "month": month,
    }


def index(request):
    year, month = _parse_year_month(request)
    context = _summary_payload(year, month)
    return render(request, "habits/index.html", context)


def summary_api(request):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    year, month = _parse_year_month(request)
    return JsonResponse(_summary_payload(year, month))


@csrf_exempt
def create_row_api(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON body."}, status=400)

    text = str(payload.get("text", "")).strip()
    if not text:
        return JsonResponse({"detail": "text is required."}, status=400)

    row = Row.objects.create(date=timezone.now(), row_text=text)
    row = Row.objects.prefetch_related("check_set__habit").get(pk=row.pk)
    return JsonResponse({"row": _serialize_row(row)}, status=201)


@csrf_exempt
def update_row_comment_api(request, row_id):
    if request.method not in ["PATCH", "POST"]:
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON body."}, status=400)

    if "text" not in payload:
        return JsonResponse({"detail": "text is required."}, status=400)

    try:
        row = Row.objects.get(pk=row_id)
    except Row.DoesNotExist:
        return JsonResponse({"detail": "Row not found."}, status=404)

    row.row_text = str(payload.get("text", "")).strip()
    row.save(update_fields=["row_text"])
    row = Row.objects.prefetch_related("check_set__habit").get(pk=row.pk)
    return JsonResponse({"row": _serialize_row(row)})


@csrf_exempt
def update_row_check_api(request, row_id):
    if request.method not in ["PATCH", "POST"]:
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON body."}, status=400)

    habit_text = str(payload.get("habit", "")).strip()
    if not habit_text:
        return JsonResponse({"detail": "habit is required."}, status=400)

    try:
        row = Row.objects.get(pk=row_id)
    except Row.DoesNotExist:
        return JsonResponse({"detail": "Row not found."}, status=404)

    try:
        habit = Habit.objects.get(habit_text=habit_text)
    except Habit.DoesNotExist:
        return JsonResponse({"detail": "Habit not found."}, status=404)

    check, _ = Check.objects.get_or_create(
        row=row,
        habit=habit,
        defaults={"value": False},
    )

    if "value" in payload:
        check.value = bool(payload.get("value"))
    else:
        # Toggle behavior for habit cell click.
        check.value = not check.value

    check.save(update_fields=["value"])

    row = Row.objects.prefetch_related("check_set__habit").get(pk=row.pk)
    return JsonResponse({"row": _serialize_row(row), "value": check.value})