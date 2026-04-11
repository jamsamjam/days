from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=50)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_habit_name_per_user'),
        ]

    def __str__(self):
        return self.name


class Row(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_records')
    date = models.DateField()
    comment = models.CharField(max_length=200, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'date'], name='unique_daily_record_per_user'),
        ]

    def __str__(self):
        return f'{self.user} - {self.date}'


class Check(models.Model):
    daily_record = models.ForeignKey(Row, on_delete=models.CASCADE, related_name='checks')
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='checks')
    value = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['daily_record', 'habit'], name='unique_check_per_day_habit'),
        ]

    def clean(self):
        if self.daily_record.user_id != self.habit.user_id:
            raise ValidationError('Habit and daily_record must belong to the same user.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.daily_record.date} - {self.habit.name} - {self.value}'