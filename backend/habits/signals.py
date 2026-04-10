from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Check, Habit, Row


def _create_checks_if_commented(row):
    if not row.row_text.strip():
        return

    habits = Habit.objects.all()
    checks = [Check(row=row, habit=habit, value=False) for habit in habits]
    Check.objects.bulk_create(checks, ignore_conflicts=True)


@receiver(post_save, sender=Row)
def create_default_checks_for_row(sender, instance, created, **kwargs):
    # Only create default checks when a row actually has comment text.
    _create_checks_if_commented(instance)
