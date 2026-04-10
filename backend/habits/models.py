from django.db import models

# Create your models here.

class Habit(models.Model):
    habit_text = models.CharField(max_length=20)


class Row(models.Model):
    date = models.DateTimeField("date added")
    row_text = models.CharField(max_length=200)


class Check(models.Model):
    row = models.ForeignKey(Row, on_delete=models.CASCADE)
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
    value = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["row", "habit"], name="unique_row_habit_check"),
        ]