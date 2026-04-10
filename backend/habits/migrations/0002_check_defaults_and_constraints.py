# Generated manually for check defaults/constraints.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("habits", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="check",
            name="value",
            field=models.BooleanField(default=False),
        ),
        migrations.AddConstraint(
            model_name="check",
            constraint=models.UniqueConstraint(
                fields=("row", "habit"),
                name="unique_row_habit_check",
            ),
        ),
    ]
